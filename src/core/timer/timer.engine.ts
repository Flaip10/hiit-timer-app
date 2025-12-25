import type {
    RunFinishReason,
    Step,
    StepEndReason,
    TimerCallbacks,
    TimerSnapshot,
} from './timer.types';

// --------- timer engine ------------------------------

// Prefer monotonic time (performance.now) to avoid Date.now() jumps; fallback for environments without it.
const hasPerformanceNow = typeof globalThis.performance.now === 'function';

const startWallMs = Date.now();
const startPerf = hasPerformanceNow ? performance.now() : 0;

// Stable “wall ms” based on monotonic delta when available.
const nowMs = (): number =>
    hasPerformanceNow
        ? startWallMs + (performance.now() - startPerf)
        : Date.now();

/**
 * Timer engine:
 * - Ground truth is `endAt` (wall ms)
 * - Step transitions are event-driven (setTimeout to boundary)
 * - UI updates are 1Hz (aligned), but do not drive step boundaries
 */
export const createTimer = (steps: Step[], cb: TimerCallbacks = {}) => {
    const { onTimerEvent, onCountdownUiTick } = cb;

    let index = 0;
    let running = false;

    let endAt = 0; // wall ms when current step ends
    let pausedRemainMs: number | null = null;

    let boundaryTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let uiIntervalId: ReturnType<typeof setInterval> | null = null;
    let uiAlignTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const currentStep = (): Step | undefined => steps[index];
    const isRunning = (): boolean => running;

    const clearBoundary = () => {
        if (boundaryTimeoutId != null) {
            clearTimeout(boundaryTimeoutId);
            boundaryTimeoutId = null;
        }
    };

    const clearUi = () => {
        if (uiIntervalId != null) {
            clearInterval(uiIntervalId);
            uiIntervalId = null;
        }
        if (uiAlignTimeoutId != null) {
            clearTimeout(uiAlignTimeoutId);
            uiAlignTimeoutId = null;
        }
    };

    const clearAllTimers = () => {
        clearBoundary();
        clearUi();
    };

    // Compute remaining time for current step (uses endAt when running, pausedRemainMs when paused).
    const currentRemainMs = (): number => {
        const step = currentStep();
        if (!step) return 0;

        if (!running) {
            const fallback = step.durationSec * 1000;
            return pausedRemainMs ?? fallback;
        }

        return Math.max(0, endAt - nowMs());
    };

    const toRemainingSec = (ms: number) => (ms <= 0 ? 0 : Math.ceil(ms / 1000));

    const snapshot = (): TimerSnapshot => {
        const remainMs = Math.max(0, currentRemainMs());
        return {
            stepIndex: index,
            running,
            remainingMs: remainMs,
            remainingSec: toRemainingSec(remainMs),
        };
    };

    const emitSnapshot = () => {
        const s = snapshot();
        onTimerEvent?.({ type: 'STATE_SYNC', nowMs: nowMs(), snapshot: s });
    };

    const emitCountdownUiTick = () => {
        if (!onCountdownUiTick) return;
        const remainMs = Math.max(0, currentRemainMs());
        onCountdownUiTick({
            remainingMs: remainMs,
            remainingSec: toRemainingSec(remainMs),
        });
    };

    const emitStepStarted = (stepIndex: number) => {
        const step = steps[stepIndex];

        onTimerEvent?.({
            type: 'STEP_STARTED',
            nowMs: nowMs(),
            stepIndex,
            step,
        });
    };

    const emitStepEnded = (stepIndex: number, reason: StepEndReason) => {
        const step = steps[stepIndex];

        onTimerEvent?.({
            type: 'STEP_ENDED',
            nowMs: nowMs(),
            stepIndex,
            step,
            reason,
        });
    };

    const emitRunStarted = () => {
        onTimerEvent?.({
            type: 'RUN_STARTED',
            nowMs: nowMs(),
            stepIndex: index,
            step: currentStep() ?? null,
        });
    };

    const emitRunPaused = (remainingMs: number) => {
        onTimerEvent?.({
            type: 'RUN_PAUSED',
            nowMs: nowMs(),
            stepIndex: index,
            step: currentStep() ?? null,
            remainingMs,
        });
    };

    const emitRunResumed = (remainingMs: number) => {
        onTimerEvent?.({
            type: 'RUN_RESUMED',
            nowMs: nowMs(),
            stepIndex: index,
            step: currentStep() ?? null,
            remainingMs,
        });
    };

    const emitRunFinished = (reason: RunFinishReason) => {
        onTimerEvent?.({
            type: 'RUN_FINISHED',
            nowMs: nowMs(),
            stepIndex: index,
            step: currentStep() ?? null,
            reason,
        });
    };

    // Drive the 1Hz UI countdown, aligned so the displayed seconds flip exactly on second boundaries.
    const scheduleCountdownUiTicks = () => {
        clearUi();
        if (!running) return;

        const msLeft = currentRemainMs();

        // Align first update so the displayed seconds flip exactly on boundaries.
        const msUntilSecondsDisplayChanges = msLeft % 1000;
        const firstDelay =
            msUntilSecondsDisplayChanges === 0
                ? 1000
                : msUntilSecondsDisplayChanges;

        uiAlignTimeoutId = setTimeout(() => {
            if (!running) return;

            emitCountdownUiTick();

            uiIntervalId = setInterval(() => {
                if (!running) return;
                emitCountdownUiTick();
            }, 1000);
        }, firstDelay);
    };

    // Establish endAt for the given step index (and clear pausedRemainMs).
    const startStepTiming = (stepIdx: number) => {
        const step = steps[stepIdx];
        const durMs = step.durationSec * 1000;
        endAt = nowMs() + durMs;
        pausedRemainMs = null;
    };

    const stopInternal = (reason: RunFinishReason): TimerSnapshot => {
        running = false;
        pausedRemainMs = 0;
        clearAllTimers();

        emitSnapshot();
        onCountdownUiTick?.({ remainingMs: 0, remainingSec: 0 });
        emitRunFinished(reason);

        return snapshot();
    };

    // Schedule the exact step transition at the current step's boundary; catches up if timers fired late.
    const scheduleStepBoundary = () => {
        clearBoundary();
        if (!running) return;

        const msLeft = currentRemainMs();

        boundaryTimeoutId = setTimeout(() => {
            if (!running) return;

            // Catch-up loop in case timers were delayed.
            while (isRunning() && currentStep()) {
                const remain = currentRemainMs();

                if (remain > 0) {
                    scheduleStepBoundary();
                    emitCountdownUiTick();
                    return;
                }

                // Current step ended naturally at boundary
                const endedIdx = index;
                emitStepEnded(endedIdx, 'natural');

                // If callbacks paused/stopped the engine, just exit.
                if (!isRunning()) return;

                if (index < steps.length - 1) {
                    index += 1;

                    startStepTiming(index);

                    emitStepStarted(index);
                    emitSnapshot();

                    // If callbacks paused/stopped during STEP_STARTED/SYNC, exit.
                    if (!isRunning()) return;

                    scheduleCountdownUiTicks();
                    continue;
                }

                stopInternal('natural');
                return;
            }

            // Only stop if we're still running. If we got paused during callbacks, do nothing.
            if (!isRunning()) return;

            stopInternal('stop');
        }, msLeft);
    };

    const scheduleAll = () => {
        if (!running) return;
        scheduleCountdownUiTicks();
        scheduleStepBoundary();
    };

    const start = (): TimerSnapshot => {
        if (running || steps.length === 0) return snapshot();

        running = true;
        pausedRemainMs = null;

        startStepTiming(index);

        emitRunStarted();
        emitStepStarted(index);
        emitSnapshot();

        emitCountdownUiTick();
        scheduleAll();

        return snapshot();
    };

    const pause = (): TimerSnapshot => {
        if (!running) return snapshot();

        const remain = currentRemainMs();

        running = false;
        pausedRemainMs = remain;

        clearAllTimers();

        emitRunPaused(remain);
        emitSnapshot();
        emitCountdownUiTick();

        return snapshot();
    };

    const resume = (): TimerSnapshot => {
        if (running || steps.length === 0) return snapshot();

        const step = currentStep();
        const fallback = (step?.durationSec ?? 0) * 1000;
        const remain = pausedRemainMs ?? fallback;

        running = true;
        pausedRemainMs = null;
        endAt = nowMs() + remain;

        emitRunResumed(remain);
        emitSnapshot();

        emitCountdownUiTick();
        scheduleAll();

        return snapshot();
    };

    const skip = (): TimerSnapshot => {
        if (steps.length === 0) return snapshot();

        // End current step due to skip (even if paused)
        if (steps[index]) {
            emitStepEnded(index, 'skip');
        }

        if (index < steps.length - 1) {
            index += 1;

            const step = currentStep();
            const durMs = (step?.durationSec ?? 0) * 1000;

            if (running) {
                endAt = nowMs() + durMs;
                pausedRemainMs = null;

                clearAllTimers();

                emitStepStarted(index);
                emitSnapshot();
                emitCountdownUiTick();
                scheduleAll();
            } else {
                pausedRemainMs = durMs;

                emitStepStarted(index);
                emitSnapshot();
                emitCountdownUiTick();
            }

            return snapshot();
        }

        return stop();
    };

    const stop = (): TimerSnapshot => {
        if (steps[index]) {
            emitStepEnded(index, 'stop');
        }
        return stopInternal('stop');
    };

    /**
     * Rebase the current step timing using "now" as the new reference.
     *
     * - While the engine is running, `endAt` is absolute (wall-ms).
     * - If the app was backgrounded / the JS thread was stalled / timers drifted,
     *   scheduled timeouts/intervals can become misaligned or fire late.
     */
    const rebase = (): TimerSnapshot => {
        if (!running) return snapshot();

        const remain = currentRemainMs();
        endAt = nowMs() + remain;

        clearAllTimers();
        scheduleAll();
        emitCountdownUiTick();

        emitSnapshot();

        return snapshot();
    };

    return {
        start,
        pause,
        resume,
        skip,
        stop,
        rebase,

        getIndex: () => index,
        isRunning,
        getSnapshot: () => snapshot(),
    };
};
