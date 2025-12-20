import type { WorkoutBlock } from './entities/entities';

export type Phase = 'PREP' | 'WORK' | 'REST';

export type Step = {
    id: string;
    label: Phase;
    durationSec: number;
    blockIdx: number;
    exIdx: number;
    setIdx: number;
    name?: string;
    nextName?: string;
};

/**
 * Builds workout steps from block-level structure.
 *
 * For now, non-timed exercises (mode === 'reps') are ignored in the run.
 */
export const buildSteps = (
    prepSec: number,
    blocks: WorkoutBlock[]
): { steps: Step[] } => {
    const steps: Step[] = [];

    blocks.forEach((block, bi) => {
        // Only consider exercises that have a timed duration
        const workExercises = block.exercises
            .map((ex, exIdx) => ({ ex, exIdx }))
            .filter(({ ex }) => ex.mode === 'time' && ex.value > 0);

        const L = workExercises.length;
        const sets = Math.max(0, block.sets);

        if (L === 0 || sets === 0) return;

        // PREP should happen once per block, before the first set only
        let blockPrepAdded = false;

        for (let si = 0; si < sets; si += 1) {
            for (let wi = 0; wi < L; wi += 1) {
                const { ex, exIdx } = workExercises[wi];
                const workSec = ex.value;

                // Block-level PREP (once), before the first WORK of this block
                if (!blockPrepAdded && prepSec > 0) {
                    steps.push({
                        id: `prep-${bi}`,
                        label: 'PREP',
                        durationSec: prepSec,
                        blockIdx: bi,

                        // PREP is not tied to a specific exercise/set
                        exIdx: -1,
                        setIdx: -1,

                        // Useful for UI: show what's coming next
                        name: ex.name,
                        nextName: ex.name,
                    });

                    blockPrepAdded = true;
                } else if (!blockPrepAdded) {
                    // no prep, but still mark that we've hit the first WORK in this block
                    blockPrepAdded = true;
                }

                // WORK step for this exercise
                steps.push({
                    id: `work-${bi}-${si}-${exIdx}`,
                    label: 'WORK',
                    durationSec: workSec,
                    blockIdx: bi,
                    exIdx,
                    setIdx: si,
                    name: ex.name,
                });

                // REST between exercises (within same set, but only between timed ones)
                const lastExerciseInSet = wi === L - 1;
                const restEx = block.restBetweenExercisesSec;

                if (!lastExerciseInSet && restEx > 0) {
                    steps.push({
                        id: `rest-ex-${bi}-${si}-${exIdx}`,
                        label: 'REST',
                        durationSec: restEx,
                        blockIdx: bi,
                        exIdx,
                        setIdx: si,
                        name: ex.name,
                    });
                }
            }

            // REST between sets (after the last exercise of the set)
            const lastSet = si === sets - 1;
            const restSet = block.restBetweenSetsSec;

            if (!lastSet && restSet > 0) {
                steps.push({
                    id: `rest-set-${bi}-${si}`,
                    label: 'REST',
                    durationSec: restSet,
                    blockIdx: bi,
                    exIdx: 0, // arbitrary; the run UI only cares about setIdx here
                    setIdx: si,
                });
            }
        }
    });

    // Fill nextName only for steps whose *next* step is WORK
    steps.forEach((s, i) => {
        const next = steps[i + 1];
        if (next && next.label === 'WORK') s.nextName = next.name;
    });

    return { steps };
};

// --------- timer engine ------------------------------

const startWallMs = Date.now();
const startPerf = performance.now();
const nowMs = (): number => startWallMs + (performance.now() - startPerf);

export interface TimerSnapshot {
    stepIndex: number;
    running: boolean;
    remainingMs: number; // ground truth
    remainingSec: number; // ceil UI seconds
}

export interface TimerUiTick {
    remainingMs: number;
    remainingSec: number;
}

export interface TimerCallbacks {
    /**
     * Authoritative events: step changes, start/pause/resume/skip/stop.
     * Use this to sync React state like stepIndex/running.
     */
    onEvent?: (s: TimerSnapshot) => void;

    /**
     * UI refresh only (1Hz aligned). Must NOT be used as authority for stepIndex/running.
     * Use this for the countdown number + store remainingMs.
     */
    onUiTick?: (t: TimerUiTick) => void;
}

/**
 * Timer engine:
 * - Ground truth is `endAt` (wall ms)
 * - Step transitions are event-driven (setTimeout to boundary)
 * - UI updates are 1Hz (aligned), but do not drive step boundaries
 */
export const createTimer = (steps: Step[], cb: TimerCallbacks = {}) => {
    const { onEvent, onUiTick } = cb;

    let index = 0;
    let running = false;

    let endAt = 0; // wall ms when current step ends
    let pausedRemainMs: number | null = null;

    let boundaryTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let uiIntervalId: ReturnType<typeof setInterval> | null = null;
    let uiAlignTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const currentStep = (): Step | undefined => steps[index];

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

    const currentRemainMs = (): number => {
        const step = currentStep();
        if (!step) return 0;

        if (!running) {
            const fallback = (step.durationSec ?? 0) * 1000;
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

    const emitEvent = () => {
        if (!onEvent) return;
        onEvent(snapshot());
    };

    const emitUi = () => {
        if (!onUiTick) return;
        const remainMs = Math.max(0, currentRemainMs());
        onUiTick({
            remainingMs: remainMs,
            remainingSec: toRemainingSec(remainMs),
        });
    };

    const scheduleUi = () => {
        clearUi();
        if (!running) return;

        const msLeft = currentRemainMs();

        // Align first update so seconds flip on boundaries.
        const msToNextSecondBoundary = msLeft % 1000;
        const firstDelay =
            msToNextSecondBoundary === 0 ? 1000 : msToNextSecondBoundary;

        uiAlignTimeoutId = setTimeout(() => {
            if (!running) return;

            emitUi();

            uiIntervalId = setInterval(() => {
                if (!running) return;
                emitUi();
            }, 1000);
        }, firstDelay);
    };

    const scheduleBoundary = () => {
        clearBoundary();
        if (!running) return;

        const msLeft = currentRemainMs();

        boundaryTimeoutId = setTimeout(() => {
            if (!running) return;

            // Catch-up loop in case timers were delayed.
            while (running && currentStep()) {
                const remain = currentRemainMs();

                if (remain > 0) {
                    // Still inside this step: reschedule boundary and refresh UI once.
                    scheduleBoundary();
                    emitUi();
                    return;
                }

                // Step ended -> advance or finish
                if (index < steps.length - 1) {
                    index += 1;
                    const next = currentStep();
                    const durMs = (next?.durationSec ?? 0) * 1000;

                    endAt = nowMs() + durMs;
                    pausedRemainMs = null;

                    // Authoritative event: step changed
                    emitEvent();

                    // Reschedule timers for the new step
                    scheduleUi();
                    // continue loop: if durMs===0, advance again
                    continue;
                }

                stop();
                return;
            }

            stop();
        }, msLeft);
    };

    const scheduleAll = () => {
        if (!running) return;
        scheduleUi();
        scheduleBoundary();
    };

    const start = (): TimerSnapshot => {
        if (running || steps.length === 0) return snapshot();

        const step = currentStep();
        const durMs = (step?.durationSec ?? 0) * 1000;

        running = true;
        pausedRemainMs = null;
        endAt = nowMs() + durMs;

        emitEvent();
        emitUi();
        scheduleAll();

        return snapshot();
    };

    const pause = (): TimerSnapshot => {
        if (!running) return snapshot();

        const remain = currentRemainMs();

        running = false;
        pausedRemainMs = remain;

        clearAllTimers();
        emitEvent();
        emitUi();

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

        emitEvent();
        emitUi();
        scheduleAll();

        return snapshot();
    };

    const skip = (): TimerSnapshot => {
        if (steps.length === 0) return snapshot();

        if (index < steps.length - 1) {
            index += 1;

            const step = currentStep();
            const durMs = (step?.durationSec ?? 0) * 1000;

            if (running) {
                endAt = nowMs() + durMs;
                pausedRemainMs = null;
                clearAllTimers();
                emitEvent();
                emitUi();
                scheduleAll();
            } else {
                pausedRemainMs = durMs;
                emitEvent();
                emitUi();
            }

            return snapshot();
        }

        return stop();
    };

    const stop = (): TimerSnapshot => {
        running = false;
        pausedRemainMs = 0;
        clearAllTimers();

        // Keep index as-is (last position)
        emitEvent();
        onUiTick?.({ remainingMs: 0, remainingSec: 0 });

        return snapshot();
    };

    /**
     * Optional: rebase timers after app returns to foreground.
     * Keeps remaining time consistent and reschedules boundary/ui properly.
     */
    const rebase = (): TimerSnapshot => {
        if (!running) return snapshot();

        const remain = currentRemainMs();
        endAt = nowMs() + remain;

        clearAllTimers();
        scheduleAll();
        emitUi();

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
        isRunning: () => running,
        getSnapshot: () => snapshot(),
    };
};
