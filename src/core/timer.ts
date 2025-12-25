import type { Workout, WorkoutBlock } from './entities/entities';
import {
    clampInt,
    exDisplayName,
    normalizeName,
    normalizeTitle,
    setKey,
} from './timer.helpers';
import {
    RunFinishReason,
    RunMeta,
    RunPlan,
    Step,
    StepEndReason,
    TimerCallbacks,
    TimerSnapshot,
} from './timer.interfaces';

/**
 * Creates a stable hash for a string.
 * Used to keep meta.runKey small and stable without storing the full JSON payload.
 *
 * FNV-1a 32-bit hash, encoded as unsigned base36.
 */
const hashStringFnv1a = (input: string): string => {
    const FNV_OFFSET_BASIS = 0x811c9dc5;
    const FNV_PRIME = 0x01000193;

    let hash = FNV_OFFSET_BASIS;

    for (const char of input) {
        // eslint-disable-next-line no-bitwise
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, FNV_PRIME);
    }

    // eslint-disable-next-line no-bitwise
    return (hash >>> 0).toString(36);
};

/**
 * Prepares run data from a workout:
 * - steps: sequential Step[]
 * - meta: precomputed maps/counters to keep reducers/hooks simple and efficient
 */
export const prepareRunData = (
    workout: Workout | null | undefined,
    prepSec: number
): RunPlan => {
    const blocks: WorkoutBlock[] = workout?.blocks ?? [];
    const totalBlocks = blocks.length;

    const steps: Step[] = [];

    // Per Block data
    const blockTitles: (string | null)[] = Array(totalBlocks).fill(null);
    const exerciseNamesByBlock: string[][] = Array(totalBlocks)
        .fill(null)
        .map(() => []);
    const exercisesCountByBlock: number[] = Array(totalBlocks).fill(0);
    const plannedSetsByBlock: number[] = Array(totalBlocks).fill(0);
    const lastWorkStepIndexByBlock = new Map<number, number>();
    const firstStepIndexByBlock = new Map<number, number>();
    const blockTotalSecByBlock: number[] = Array(totalBlocks).fill(0);

    // Per set data
    const lastWorkStepIndexBySet = new Map<string, number>();
    const workStepsCountBySet = new Map<string, number>();

    // Set-progress precompute:
    // - per set (keyed): total counted ms
    // - per stepIndex: elapsed counted ms before this step, and this step duration counted ms
    const setTotalMsByKey = new Map<string, number>();
    const setElapsedBeforeMsByStepIndex: number[] = [];
    const setStepMsByStepIndex: number[] = [];

    // Accumulated elapsed time (ms) per set, keyed by block+set composite key
    const setElapsedMsByKey = new Map<string, number>();

    const isCountedSetStep = (s: Step) => {
        if (s.setIdx < 0) return false; // excludes PREP
        if (s.label === 'WORK') return true;
        // Only count rest between exercises (rest-set should not reset/flicker set progress)
        if (s.label === 'REST' && !s.id.startsWith('rest-set-')) return true;
        return false;
    };

    const pushStep = (s: Step) => {
        // Backfill `nextName` so REST steps (and the previous WORK) can show the upcoming WORK name.
        // Walk backwards within the same block until the previous WORK is reached.
        if (s.label === 'WORK' && s.name) {
            for (let j = steps.length - 1; j >= 0; j -= 1) {
                const prev = steps[j];
                if (!prev) continue;

                // Stop at block boundary
                if (prev.blockIdx !== s.blockIdx) break;

                // Don't override explicit nextName (PREP/rest-set may set it)
                if (prev.nextName != null) continue;

                prev.nextName = s.name;

                // Once we've updated the previous WORK step too, stop.
                if (prev.label === 'WORK') break;
            }
        }

        // First step index per block (including PREP if present)
        if (!firstStepIndexByBlock.has(s.blockIdx)) {
            firstStepIndexByBlock.set(s.blockIdx, steps.length);
        }

        // Total block seconds
        if (s.blockIdx >= 0 && s.blockIdx < totalBlocks) {
            blockTotalSecByBlock[s.blockIdx] += s.durationSec ?? 0;
        }

        // Set progress precompute for set progress pills component
        const stepIndex = steps.length;

        if (s.setIdx >= 0) {
            const setCompositeKey = setKey(s.blockIdx, s.setIdx);
            const elapsedCountedMsBeforeStep =
                setElapsedMsByKey.get(setCompositeKey) ?? 0;

            setElapsedBeforeMsByStepIndex[stepIndex] =
                elapsedCountedMsBeforeStep;

            if (isCountedSetStep(s)) {
                const stepCountedDurationMs = Math.max(
                    0,
                    (s.durationSec ?? 0) * 1000
                );

                setStepMsByStepIndex[stepIndex] = stepCountedDurationMs;

                setElapsedMsByKey.set(
                    setCompositeKey,
                    elapsedCountedMsBeforeStep + stepCountedDurationMs
                );

                setTotalMsByKey.set(
                    setCompositeKey,
                    (setTotalMsByKey.get(setCompositeKey) ?? 0) +
                        stepCountedDurationMs
                );
            } else {
                setStepMsByStepIndex[stepIndex] = 0;
            }
        } else {
            // PREP / non-set steps
            setElapsedBeforeMsByStepIndex[stepIndex] = 0;
            setStepMsByStepIndex[stepIndex] = 0;
        }

        steps.push(s);
    };

    let totalExercisesForRun = 0;
    let totalSetsForRun = 0;

    // ---------- meta from workout structure ----------
    for (let bi = 0; bi < totalBlocks; bi += 1) {
        const block = blocks[bi];
        const exs = block?.exercises ?? [];

        blockTitles[bi] = normalizeTitle(block?.title);
        exerciseNamesByBlock[bi] = exs.map((ex, exIdx) =>
            normalizeName(ex?.name, `Exercise ${exIdx + 1}`)
        );

        const timedExercises = exs
            .map((ex, exIdx) => ({ ex, exIdx }))
            .filter(
                ({ ex }) => ex?.mode === 'time' && clampInt(ex?.value, 0) > 0
            );
        const exercisesCount = timedExercises.length;
        const setsCount = Math.max(0, clampInt(block?.sets, 0));

        exercisesCountByBlock[bi] = exercisesCount;
        plannedSetsByBlock[bi] = setsCount;

        totalExercisesForRun += exercisesCount;
        totalSetsForRun += setsCount;

        if (exercisesCount === 0 || setsCount === 0) continue;

        // ---------- build steps + maps ----------
        let isBlockPrepAdded = false;

        for (let si = 0; si < setsCount; si += 1) {
            const setCompositeKey = setKey(bi, si);

            // Initialize set counters (explicitly; avoids undefined checks later)
            if (!workStepsCountBySet.has(setCompositeKey)) {
                workStepsCountBySet.set(setCompositeKey, 0);
            }

            for (let wi = 0; wi < exercisesCount; wi += 1) {
                const { ex, exIdx } = timedExercises[wi];
                const workSec = Math.max(0, clampInt(ex?.value, 0));

                // Block-level PREP once, before first WORK of block
                if (!isBlockPrepAdded) {
                    isBlockPrepAdded = true;

                    if (prepSec > 0) {
                        const first = timedExercises[0];
                        const second = timedExercises[1] ?? first;

                        const firstName = exDisplayName(
                            bi,
                            first?.exIdx ?? 0,
                            first?.ex?.name
                        );
                        const secondName = exDisplayName(
                            bi,
                            second?.exIdx ?? first?.exIdx ?? 0,
                            second?.ex?.name
                        );

                        pushStep({
                            id: `prep-${bi}`,
                            label: 'PREP',
                            durationSec: Math.max(0, clampInt(prepSec, 0)),
                            blockIdx: bi,
                            exIdx: -1,
                            setIdx: -1,
                            name: firstName,
                            nextName: secondName,
                        });
                    }
                }

                // Push WORK step
                pushStep({
                    id: `work-${bi}-${si}-${exIdx}`,
                    label: 'WORK',
                    durationSec: workSec,
                    blockIdx: bi,
                    exIdx,
                    setIdx: si,
                    name: exDisplayName(bi, exIdx, ex?.name),
                });

                // Update WORK meta values
                const workStepIndex = steps.length - 1;
                lastWorkStepIndexBySet.set(setCompositeKey, workStepIndex);
                lastWorkStepIndexByBlock.set(bi, workStepIndex);
                workStepsCountBySet.set(
                    setCompositeKey,
                    (workStepsCountBySet.get(setCompositeKey) ?? 0) + 1
                );

                // Push REST between exercises step (same set)
                const isLastExerciseInSet = wi === exercisesCount - 1;
                const restBetweenExercisesSec = Math.max(
                    0,
                    clampInt(block?.restBetweenExercisesSec, 0)
                );

                if (!isLastExerciseInSet && restBetweenExercisesSec > 0) {
                    pushStep({
                        id: `rest-ex-${bi}-${si}-${exIdx}`,
                        label: 'REST',
                        durationSec: restBetweenExercisesSec,
                        blockIdx: bi,
                        exIdx,
                        setIdx: si,
                        name: exDisplayName(bi, exIdx, ex?.name),
                    });
                }
            }

            // Push REST between sets step (after last exercise of the set)
            const isLastSet = si === setsCount - 1;
            const restBetweenSetsSec = Math.max(
                0,
                clampInt(block?.restBetweenSetsSec, 0)
            );

            if (!isLastSet && restBetweenSetsSec > 0) {
                const last = timedExercises[timedExercises.length - 1];
                const nextFirst = timedExercises[0];

                const firstName = exDisplayName(
                    bi,
                    last?.exIdx ?? 0,
                    last?.ex?.name
                );
                const secondName = exDisplayName(
                    bi,
                    nextFirst?.exIdx ?? 0,
                    nextFirst?.ex?.name
                );

                pushStep({
                    id: `rest-set-${bi}-${si}`,
                    label: 'REST',
                    durationSec: restBetweenSetsSec,
                    blockIdx: bi,
                    exIdx: last?.exIdx ?? 0,
                    setIdx: si, // keep if your UI uses this as “rest after set si”
                    name: firstName,
                    nextName: secondName,
                });
            }
        }
    }

    /**
     * For each step index, compute remaining seconds *after* this step within the current block.
     * (Excludes current step duration.)
     */
    const remainingBlockAfterStepIndexSec: number[] = Array(steps.length).fill(
        0
    );

    let i = steps.length - 1;
    while (i >= 0) {
        const blockIndex = steps[i]?.blockIdx;
        if (blockIndex == null) {
            remainingBlockAfterStepIndexSec[i] = 0;
            i -= 1;
            continue;
        }

        // Find start of this block segment
        let j = i;
        while (j >= 0 && steps[j]?.blockIdx === blockIndex) j -= 1;

        // Block segment is [j + 1 .. i]
        let secondsAfterCurrentStep = 0;
        for (let k = i; k >= j + 1; k -= 1) {
            remainingBlockAfterStepIndexSec[k] = secondsAfterCurrentStep;
            secondsAfterCurrentStep += steps[k]?.durationSec ?? 0;
        }

        i = j;
    }

    // Stable identity key:
    // Include enough to reset correctly when anything meaningful changes, then hash it.
    const runKeyPayload = JSON.stringify({
        workoutId: workout?.id ?? 'no-workout',
        prepSec: clampInt(prepSec, 0),
        blocks: blocks.map((b, bi) => ({
            i: bi,
            id: b.id,
            title: normalizeTitle(b.title),
            sets: plannedSetsByBlock[bi],
            restSets: clampInt(b.restBetweenSetsSec, 0),
            restExercises: clampInt(b.restBetweenExercisesSec, 0),
            exercises: (b.exercises ?? []).map((ex, exIdx) => ({
                i: exIdx,
                id: ex.id,
                mode: ex.mode,
                value: clampInt(ex.value, 0),
                name: normalizeName(ex.name, ''),
            })),
        })),
    });

    const runKey = hashStringFnv1a(runKeyPayload);

    const meta: RunMeta = {
        blockTitles,
        exerciseNamesByBlock,

        exercisesCountByBlock,
        plannedSetsByBlock,

        totalBlocks,
        totalSetsForRun,
        totalExercisesForRun,

        lastWorkStepIndexBySet,
        workStepsCountBySet,

        lastWorkStepIndexByBlock,
        firstStepIndexByBlock,

        blockTotalSecByBlock,
        remainingBlockAfterStepIndexSec,

        setTotalMsByKey,
        setElapsedBeforeMsByStepIndex,
        setStepMsByStepIndex,

        runKey,
    };

    return { steps, meta };
};

// --------- timer engine ------------------------------

// Prefer monotonic time (performance.now) to avoid Date.now() jumps; fallback for environments without it.
const hasPerformanceNow = typeof globalThis.performance?.now === 'function';

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
        if (!step) return;
        onTimerEvent?.({
            type: 'STEP_STARTED',
            nowMs: nowMs(),
            stepIndex,
            step,
        });
    };

    const emitStepEnded = (stepIndex: number, reason: StepEndReason) => {
        const step = steps[stepIndex];
        if (!step) return;
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
        const durMs = (step?.durationSec ?? 0) * 1000;
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
            while (running && currentStep()) {
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
                if (!running) return;

                if (index < steps.length - 1) {
                    index += 1;

                    startStepTiming(index);

                    emitStepStarted(index);
                    emitSnapshot();

                    // If callbacks paused/stopped during STEP_STARTED/SYNC, exit.
                    if (!running) return;

                    scheduleCountdownUiTicks();
                    continue;
                }

                stopInternal('natural');
                return;
            }

            // Only stop if we're still running. If we got paused during callbacks, do nothing.
            if (!running) return;

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
        isRunning: () => running,
        getSnapshot: () => snapshot(),
    };
};
