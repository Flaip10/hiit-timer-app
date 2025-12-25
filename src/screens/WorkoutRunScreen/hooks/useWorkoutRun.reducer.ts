import type {
    CountdownUiTick,
    RunFinishReason,
    RunMeta,
    Step,
    TimerEvent,
} from '@src/core/timer';

export type RunStats = {
    // completion
    completedSetsByBlock: number[];
    completedExercisesByBlock: number[];

    // time (per block)
    workMsByBlock: number[];
    restMsByBlock: number[];
    prepMsByBlock: number[];

    // time (totals)
    totalWorkMs: number;
    totalRestMs: number;
    totalPrepMs: number;

    // “non-training” time (totals)
    totalPausedMs: number;
    totalBlockPauseMs: number;
};

export type RunState = {
    // start
    hasStarted: boolean;

    // timer mirror
    stepIndex: number;
    running: boolean;
    remainingSec: number;
    remainingMs: number;

    // gate
    awaitingBlockContinue: boolean;

    // finish
    finished: boolean;
    finishReason?: RunFinishReason;

    // accounting cursors
    stepActiveSegmentStartedAtMs?: number; // only when we’re actively accumulating step time
    pausedStartedAtMs?: number;
    blockPauseStartedAtMs?: number;

    stats: RunStats;
};

export type RunAction =
    | { type: 'RESET'; meta: RunMeta }
    | { type: 'ENTER_BLOCK_PAUSE'; nowMs: number }
    | { type: 'EXIT_BLOCK_PAUSE'; nowMs: number }
    | { type: 'TIMER_EVENT'; event: TimerEvent }
    | { type: 'COUNTDOWN_TICK'; tick: CountdownUiTick }
    | { type: 'MARK_EXERCISE_COMPLETED'; blockIdx: number }
    | { type: 'MARK_SET_COMPLETED'; blockIdx: number };

const makeZeroArr = (n: number) => Array(n).fill(0);

export const createInitialRunState = (args: { meta: RunMeta }): RunState => {
    const { meta } = args;
    const blocks = meta.totalBlocks;

    return {
        hasStarted: false,
        stepIndex: 0,
        running: false,
        remainingSec: 0,
        remainingMs: 0,

        awaitingBlockContinue: false,

        finished: false,

        // No accumulation cursors are open at init.
        // They are opened/closed by RUN_STARTED/RUN_PAUSED/RUN_RESUMED and block-pause actions.
        stepActiveSegmentStartedAtMs: undefined,
        pausedStartedAtMs: undefined,
        blockPauseStartedAtMs: undefined,

        stats: {
            completedSetsByBlock: makeZeroArr(blocks),
            completedExercisesByBlock: makeZeroArr(blocks),

            workMsByBlock: makeZeroArr(blocks),
            restMsByBlock: makeZeroArr(blocks),
            prepMsByBlock: makeZeroArr(blocks),

            totalWorkMs: 0,
            totalRestMs: 0,
            totalPrepMs: 0,

            totalPausedMs: 0,
            totalBlockPauseMs: 0,
        },
    };
};

const msDelta = (fromMs: number, toMs: number) => Math.max(0, toMs - fromMs);

const flushActiveStepAccumulatedTime = (
    state: RunState,
    nowMs: number,
    step: Step | null
): RunState => {
    const startedAt = state.stepActiveSegmentStartedAtMs;
    if (startedAt == null || step == null) return state;

    const d = msDelta(startedAt, nowMs);
    if (d === 0) {
        return { ...state, stepActiveSegmentStartedAtMs: undefined };
    }

    const b = step.blockIdx;
    const nextStats: RunStats = { ...state.stats };

    if (step.label === 'WORK') {
        nextStats.totalWorkMs += d;
        if (b >= 0) nextStats.workMsByBlock[b] += d;
    } else if (step.label === 'REST') {
        nextStats.totalRestMs += d;
        if (b >= 0) nextStats.restMsByBlock[b] += d;
    } else {
        // PREP: counts as REST + keep separate bucket
        nextStats.totalPrepMs += d;
        nextStats.totalRestMs += d;

        if (b >= 0) {
            nextStats.prepMsByBlock[b] += d;
            nextStats.restMsByBlock[b] += d;
        }
    }

    return {
        ...state,
        stats: nextStats,
        stepActiveSegmentStartedAtMs: undefined,
    };
};

const startActiveStepAccumulationIfAllowed = (
    state: RunState,
    nowMs: number
): RunState => {
    // Only accumulate when:
    // - engine is running
    // - NOT awaiting block continue
    if (!state.running)
        return { ...state, stepActiveSegmentStartedAtMs: undefined };
    if (state.awaitingBlockContinue)
        return { ...state, stepActiveSegmentStartedAtMs: undefined };
    return { ...state, stepActiveSegmentStartedAtMs: nowMs };
};

const flushPausedAccumulatedTime = (
    state: RunState,
    nowMs: number
): RunState => {
    const startedAt = state.pausedStartedAtMs;
    if (startedAt == null) return state;

    const d = msDelta(startedAt, nowMs);
    if (d === 0) return { ...state, pausedStartedAtMs: undefined };

    return {
        ...state,
        pausedStartedAtMs: undefined,
        stats: { ...state.stats, totalPausedMs: state.stats.totalPausedMs + d },
    };
};

const flushBlockPauseAccumulatedTime = (
    state: RunState,
    nowMs: number
): RunState => {
    const startedAt = state.blockPauseStartedAtMs;
    if (startedAt == null) return state;

    const d = msDelta(startedAt, nowMs);
    if (d === 0) return { ...state, blockPauseStartedAtMs: undefined };

    return {
        ...state,
        blockPauseStartedAtMs: undefined,
        stats: {
            ...state.stats,
            totalBlockPauseMs: state.stats.totalBlockPauseMs + d,
        },
    };
};

const flushAllTimers = (
    state: RunState,
    nowMs: number,
    step: Step | null
): RunState => {
    const afterStep = flushActiveStepAccumulatedTime(state, nowMs, step);
    const afterPaused = flushPausedAccumulatedTime(afterStep, nowMs);
    return flushBlockPauseAccumulatedTime(afterPaused, nowMs);
};

const incrementNumberArrayAtIndex = (
    arr: number[],
    index: number
): number[] => {
    if (index < 0 || index >= arr.length) return arr;

    const next = arr.slice();
    next[index] = (next[index] ?? 0) + 1;
    return next;
};

export const runReducer = (state: RunState, action: RunAction): RunState => {
    switch (action.type) {
        case 'RESET': {
            return createInitialRunState({
                meta: action.meta,
            });
        }

        case 'ENTER_BLOCK_PAUSE': {
            if (state.awaitingBlockContinue) return state; // idempotent

            const afterPausedFlush = flushPausedAccumulatedTime(
                state,
                action.nowMs
            );

            return {
                ...afterPausedFlush,
                awaitingBlockContinue: true,
                blockPauseStartedAtMs: action.nowMs,
                stepActiveSegmentStartedAtMs: undefined,
                pausedStartedAtMs: undefined,
            };
        }

        case 'EXIT_BLOCK_PAUSE': {
            const afterBlockFlush = flushBlockPauseAccumulatedTime(
                state,
                action.nowMs
            );

            // If engine is running, resume active accumulation; otherwise go to paused timer
            if (afterBlockFlush.running) {
                return {
                    ...afterBlockFlush,
                    awaitingBlockContinue: false,
                    stepActiveSegmentStartedAtMs: action.nowMs,
                    pausedStartedAtMs: undefined,
                };
            }

            return {
                ...afterBlockFlush,
                awaitingBlockContinue: false,
                stepActiveSegmentStartedAtMs: undefined,
                pausedStartedAtMs: action.nowMs,
            };
        }

        case 'TIMER_EVENT': {
            const { event } = action;

            // Keep snapshot mirrored in state for UI
            if (event.type === 'STATE_SYNC') {
                return {
                    ...state,
                    stepIndex: event.snapshot.stepIndex,
                    running: event.snapshot.running,
                    remainingMs: event.snapshot.remainingMs,
                    remainingSec: event.snapshot.remainingSec,
                };
            }

            if (event.type === 'RUN_STARTED') {
                // leaving "paused"
                const afterPaused = flushPausedAccumulatedTime(
                    state,
                    event.nowMs
                );
                const next = {
                    ...afterPaused,
                    hasStarted: true,
                    finished: false,
                    finishReason: undefined,
                    running: true,
                    stepIndex: event.stepIndex,
                };
                return startActiveStepAccumulationIfAllowed(next, event.nowMs);
            }

            if (event.type === 'RUN_PAUSED') {
                // Pause closes the current active-step segment and starts paused-time accumulation.
                const afterStepFlush = flushActiveStepAccumulatedTime(
                    state,
                    event.nowMs,
                    event.step
                );

                return {
                    ...afterStepFlush,
                    running: false,
                    pausedStartedAtMs: event.nowMs,
                    stepActiveSegmentStartedAtMs: undefined,
                };
            }

            if (event.type === 'RUN_RESUMED') {
                // close paused time, reopen active step time if allowed
                const afterPaused = flushPausedAccumulatedTime(
                    state,
                    event.nowMs
                );
                const next = {
                    ...afterPaused,
                    running: true,
                };
                return startActiveStepAccumulationIfAllowed(next, event.nowMs);
            }

            if (event.type === 'STEP_STARTED') {
                // Update stepIndex immediately for responsiveness; STATE_SYNC will confirm shortly after.
                // Also restart the active-step accumulation cursor.
                const next = { ...state, stepIndex: event.stepIndex };
                return startActiveStepAccumulationIfAllowed(next, event.nowMs);
            }

            // Always flush the step that ended (event payload is authoritative here)
            if (event.type === 'STEP_ENDED') {
                return flushActiveStepAccumulatedTime(
                    state,
                    event.nowMs,
                    event.step
                );
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (event.type === 'RUN_FINISHED') {
                // On finish, flush any open accumulators so stats are closed at nowMs.
                const flushed = flushAllTimers(state, event.nowMs, event.step);

                return {
                    ...flushed,
                    running: false,
                    finished: true,
                    finishReason: event.reason,
                };
            }

            return state;
        }

        // UI-only 1Hz countdown mirror (does not drive step boundaries).
        case 'COUNTDOWN_TICK': {
            return {
                ...state,
                remainingMs: action.tick.remainingMs,
                remainingSec: action.tick.remainingSec,
            };
        }

        case 'MARK_EXERCISE_COMPLETED': {
            const { blockIdx } = action;
            if (blockIdx < 0) return state;

            return {
                ...state,
                stats: {
                    ...state.stats,
                    completedExercisesByBlock: incrementNumberArrayAtIndex(
                        state.stats.completedExercisesByBlock,
                        blockIdx
                    ),
                },
            };
        }

        case 'MARK_SET_COMPLETED': {
            const { blockIdx } = action;
            if (blockIdx < 0) return state;

            return {
                ...state,
                stats: {
                    ...state.stats,
                    completedSetsByBlock: incrementNumberArrayAtIndex(
                        state.stats.completedSetsByBlock,
                        blockIdx
                    ),
                },
            };
        }

        default:
            return state;
    }
};
