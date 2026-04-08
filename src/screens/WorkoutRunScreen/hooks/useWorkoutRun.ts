import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { AppState } from 'react-native';

import {
    createTimer,
    type Phase,
    type RunPlan,
    type TimerEvent,
    type TimerSnapshot,
    type CountdownUiTick,
} from '@src/core/timer';

import { useWorkoutRunStore } from '@src/state/stores/useWorkoutRunStore';

import { useBreathingAnimation } from './useBreathingAnimation';

import { createInitialRunState, runReducer } from './useWorkoutRun.reducer';
import type { WorkoutSessionStats } from '@src/core/entities/workoutSession.interfaces';
import { msToSeconds } from '@src/helpers/time.helpers';
import { msArrayToSecondsArray } from '../helpers';
import { setKey } from '@src/core/timer/timer.utils';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type UseWorkoutRunArgs = {
    plan: RunPlan;
    shouldAutoStart: boolean;
    forcedSnapshot?: ForcedRunSnapshot;
};

export interface ForcedRunSnapshot {
    stepIndex: number;
    remainingSec: number;
    running: boolean;
    awaitingBlockContinue: boolean;
    isFinished: boolean;
    stats: WorkoutSessionStats;
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export const useWorkoutRun = ({
    plan,
    shouldAutoStart,
    forcedSnapshot,
}: UseWorkoutRunArgs) => {
    const { steps, meta } = plan;

    const engineRef = useRef<ReturnType<typeof createTimer> | null>(null);
    const autoStartedRef = useRef(false);

    // completion refs (non-react, dedupe + correctness)
    const completedWorkStepIndexRef = useRef<Set<number>>(new Set());
    const completedSetKeyRef = useRef<Set<string>>(new Set());
    const workCompletedCountBySetRef = useRef<Map<string, number>>(new Map());

    const [state, dispatch] = useReducer(
        runReducer,
        createInitialRunState({ meta })
    );

    /* ---------------------------------------------------------------------- */
    /* Mirror engine snapshot into Zustand store                              */
    /* ---------------------------------------------------------------------- */

    const syncStoreSnapshot = useCallback(
        (snap: TimerSnapshot, remainingMsOverride?: number) => {
            const remainingMs =
                typeof remainingMsOverride === 'number'
                    ? remainingMsOverride
                    : snap.remainingMs;

            useWorkoutRunStore.getState().setEngineSnapshot({
                running: snap.running,
                remainingMs,
                currentStep: steps[snap.stepIndex] ?? null,
            });
        },
        [steps] // steps is now stable per runKey anyway
    );

    /* ---------------------------------------------------------------------- */
    /* Timer event handler                                                     */
    /* ---------------------------------------------------------------------- */

    const handleTimerEvent = useCallback(
        (e: TimerEvent) => {
            // Always forward events to reducer (time accounting + timer mirror)
            dispatch({ type: 'TIMER_EVENT', event: e });

            // Mirror engine snapshot to the store for UI rendering
            if (e.type === 'STATE_SYNC') {
                const snap = e.snapshot;
                syncStoreSnapshot(snap);
                return;
            }

            // Force store countdown to 0ms immediately on finish
            if (e.type === 'RUN_FINISHED') {
                const snap = engineRef.current?.getSnapshot();
                if (snap) syncStoreSnapshot(snap, 0);
                return;
            }

            // Block gate: pause at the first step of each block > 0
            if (e.type === 'STEP_STARTED') {
                const idx = e.stepIndex;
                if (idx > 0) {
                    const previousBlock = steps[idx - 1]?.blockIdx;
                    const currentBlock = e.step.blockIdx;
                    const blockStarted = previousBlock !== currentBlock;

                    if (blockStarted && currentBlock > 0) {
                        engineRef.current?.pause();
                        dispatch({ type: 'ENTER_BLOCK_PAUSE', nowMs: e.nowMs });
                    }
                }
            }

            // Completion guards: prevent double-counting on repeated events
            if (e.type === 'STEP_ENDED') {
                const endedStep = e.step;

                if (endedStep.label !== 'WORK') return;
                if (e.reason !== 'natural') return;

                if (completedWorkStepIndexRef.current.has(e.stepIndex)) return;
                completedWorkStepIndexRef.current.add(e.stepIndex);

                const b = endedStep.blockIdx;
                const sIdx = endedStep.setIdx;
                const exIdx = endedStep.exIdx;

                if (b < 0 || sIdx < 0 || exIdx < 0) return;

                // Exercise completion (must match RunAction shape)
                dispatch({
                    type: 'MARK_EXERCISE_COMPLETED',
                    blockIdx: b,
                });

                // Set completion (uses meta.workStepsCountBySet)
                const kSet = setKey(b, sIdx);
                const prev = workCompletedCountBySetRef.current.get(kSet) ?? 0;
                const next = prev + 1;
                workCompletedCountBySetRef.current.set(kSet, next);

                const plannedWork = meta.workStepsCountBySet.get(kSet) ?? 0;
                if (plannedWork > 0 && next >= plannedWork) {
                    if (completedSetKeyRef.current.has(kSet)) return;
                    completedSetKeyRef.current.add(kSet);

                    dispatch({
                        type: 'MARK_SET_COMPLETED',
                        blockIdx: b,
                    });
                }
            }
        },
        [meta.workStepsCountBySet, steps, syncStoreSnapshot]
    );

    /* ---------------------------------------------------------------------- */
    /* UI tick handler                                                         */
    /* ---------------------------------------------------------------------- */

    const applyCountdownUiTick = useCallback(
        (t: CountdownUiTick) => {
            dispatch({ type: 'COUNTDOWN_TICK', tick: t });

            const snap = engineRef.current?.getSnapshot();
            if (!snap) return;
            syncStoreSnapshot(snap, t.remainingMs);
        },
        [syncStoreSnapshot]
    );

    /* ---------------------------------------------------------------------- */
    /* Engine lifecycle                                                        */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (forcedSnapshot) {
            useWorkoutRunStore.getState().resetRun();

            return () => {
                useWorkoutRunStore.getState().resetRun();
            };
        }

        // (Re)initialize the run whenever the plan changes (meta.runKey).
        if (steps.length === 0) return;

        // Seed Zustand store with the initial snapshot (before engine exists) so UI has something to render.
        const first = steps[0] ?? null;
        const firstMs = Math.max(0, first.durationSec * 1000);

        useWorkoutRunStore.getState().startRun({
            steps,
            totalSets: meta.totalSetsForRun,
            snapshot: {
                running: false,
                remainingMs: firstMs,
                currentStep: first,
            },
        });

        // Reset reducer + completion dedupe refs for the new run.
        completedWorkStepIndexRef.current = new Set();
        completedSetKeyRef.current = new Set();
        workCompletedCountBySetRef.current = new Map();
        dispatch({ type: 'RESET', meta });

        // Create a fresh timer engine bound to this plan.
        engineRef.current = createTimer(steps, {
            onCountdownUiTick: applyCountdownUiTick,
            onTimerEvent: handleTimerEvent,
        });

        // Mirror initial engine snapshot into the store immediately (keeps currentStep aligned).
        const initialSnap = engineRef.current.getSnapshot();
        syncStoreSnapshot(initialSnap);

        if (shouldAutoStart && !autoStartedRef.current) {
            autoStartedRef.current = true;
            engineRef.current.start();
        }

        return () => {
            // Cleanup old engine + store when the plan changes or screen unmounts.
            engineRef.current?.stop();
            useWorkoutRunStore.getState().resetRun();
            engineRef.current = null;
            autoStartedRef.current = false;
        };
    }, [
        applyCountdownUiTick,
        handleTimerEvent,
        meta,
        meta.runKey,
        shouldAutoStart,
        steps,
        syncStoreSnapshot,
        forcedSnapshot,
    ]);

    /* ---------------------------------------------------------------------- */
    /* Foreground rebase                                                       */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (forcedSnapshot) return;

        const sub = AppState.addEventListener('change', (s) => {
            if (s !== 'active') return;
            engineRef.current?.rebase();
        });

        return () => sub.remove();
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Derived step state                                                      */
    /* ---------------------------------------------------------------------- */

    const stepIndex = forcedSnapshot?.stepIndex ?? state.stepIndex;
    const step = steps[stepIndex] ?? null;

    const phase: Phase = step.label;

    const isSetRest =
        step.label === 'REST' &&
        typeof step.id === 'string' &&
        step.id.startsWith('rest-set-');

    const primaryLabel: 'Start' | 'Pause' | 'Resume' | 'Continue' | 'Done' =
        forcedSnapshot?.isFinished
            ? 'Done'
            : forcedSnapshot?.awaitingBlockContinue
              ? 'Continue'
              : forcedSnapshot?.running
                ? 'Pause'
                : forcedSnapshot
                  ? 'Start'
                  : state.finished
            ? 'Done'
            : state.awaitingBlockContinue
              ? 'Continue'
              : state.running
                ? 'Pause'
                : state.hasStarted
                  ? 'Resume'
                  : 'Start';

    const remainingBlockSec = (() => {
        return (
            state.remainingSec +
            (meta.remainingBlockAfterStepIndexSec[stepIndex] ?? 0)
        );
    })();

    /* ---------------------------------------------------------------------- */
    /* Stats snapshot                                                          */
    /* ---------------------------------------------------------------------- */

    const runStats = useMemo(() => {
        if (forcedSnapshot) {
            return forcedSnapshot.stats;
        }

        const completedSetsByBlock = [...state.stats.completedSetsByBlock];
        const completedExercisesByBlock = [...state.stats.completedExercisesByBlock];

        const completedSets = completedSetsByBlock.reduce((a, b) => a + b, 0);
        const completedExercises = completedExercisesByBlock.reduce(
            (a, b) => a + b,
            0
        );

        return {
            completedSets,
            completedExercises,

            completedSetsByBlock,
            completedExercisesByBlock,

            // Convert ms accounting into UI/session seconds using floor for stable persisted stats.
            totalWorkSec: msToSeconds(state.stats.totalWorkMs, 'floor'),
            totalRestSec: msToSeconds(state.stats.totalRestMs, 'floor'),
            totalPrepSec: msToSeconds(state.stats.totalPrepMs, 'floor'),

            totalPausedSec: msToSeconds(state.stats.totalPausedMs, 'floor'),
            totalBlockPauseSec: msToSeconds(
                state.stats.totalBlockPauseMs,
                'floor'
            ),

            workSecByBlock: msArrayToSecondsArray(
                state.stats.workMsByBlock,
                'floor'
            ),
            restSecByBlock: msArrayToSecondsArray(
                state.stats.restMsByBlock,
                'floor'
            ),
            prepSecByBlock: msArrayToSecondsArray(
                state.stats.prepMsByBlock,
                'floor'
            ),
        } satisfies WorkoutSessionStats;
    }, [forcedSnapshot, state.stats]);

    /* ---------------------------------------------------------------------- */
    /* Breathing                                                               */
    /* ---------------------------------------------------------------------- */

    const { breathingPhase } = useBreathingAnimation({
        step,
        isFinished: forcedSnapshot?.isFinished ?? state.finished,
        remaining: forcedSnapshot?.remainingSec ?? state.remainingSec,
        running: forcedSnapshot?.running ?? state.running,
    });

    /* ---------------------------------------------------------------------- */
    /* Controls                                                                */
    /* ---------------------------------------------------------------------- */

    const handleStart = useCallback(() => {
        if (forcedSnapshot) return;
        engineRef.current?.start();
    }, []);

    const handlePause = useCallback(() => {
        if (forcedSnapshot) return;
        engineRef.current?.pause();
    }, [forcedSnapshot]);

    const handleResume = useCallback(() => {
        if (forcedSnapshot) return;
        engineRef.current?.resume();
    }, [forcedSnapshot]);

    const handleSkip = useCallback(() => {
        if (forcedSnapshot) return;
        if (state.awaitingBlockContinue) return;
        engineRef.current?.skip();
    }, [forcedSnapshot, state.awaitingBlockContinue]);

    const handleForceFinish = useCallback(() => {
        if (forcedSnapshot) return;
        engineRef.current?.stop();
    }, [forcedSnapshot]);

    const handlePrimary = useCallback(() => {
        if (state.awaitingBlockContinue) {
            dispatch({ type: 'EXIT_BLOCK_PAUSE', nowMs: Date.now() });
            engineRef.current?.resume();
            return;
        }

        if (state.running) {
            handlePause();
            return;
        }

        if (!state.hasStarted) {
            handleStart();
            return;
        }

        handleResume();
    }, [
        handlePause,
        handleResume,
        handleStart,
        state.awaitingBlockContinue,
        state.running,
        state.hasStarted,
    ]);

    /* ---------------------------------------------------------------------- */
    /* Return                                                                  */
    /* ---------------------------------------------------------------------- */

    const timer = useMemo(
        () => ({
            stepIndex,
            remainingSec: forcedSnapshot?.remainingSec ?? state.remainingSec,
            running: forcedSnapshot?.running ?? state.running,
            step,
            phase,
            isSetRest,
            remainingBlockSec:
                forcedSnapshot?.isFinished === true ? 0 : remainingBlockSec,
            isFinished: forcedSnapshot?.isFinished ?? state.finished,
            primaryLabel,
        }),
        [
            stepIndex,
            forcedSnapshot,
            state.remainingSec,
            state.running,
            state.finished,
            step,
            phase,
            isSetRest,
            remainingBlockSec,
            primaryLabel,
        ]
    );

    const runContext = useMemo(
        () => ({
            currentBlockIdx: step.blockIdx,
            currentExerciseName: step.name ?? null,
            nextExerciseName: step.nextName ?? null,
            currentExerciseIndexInBlock: step.exIdx,
        }),
        [step]
    );

    const gates = useMemo(
        () => ({
            awaitingBlockContinue:
                forcedSnapshot?.awaitingBlockContinue ?? state.awaitingBlockContinue,
        }),
        [forcedSnapshot, state.awaitingBlockContinue]
    );

    const breathing = useMemo(() => ({ breathingPhase }), [breathingPhase]);

    const controls = useMemo(
        () => ({ handlePrimary, handleSkip, handleForceFinish }),
        [handlePrimary, handleSkip, handleForceFinish]
    );

    return { timer, runContext, stats: runStats, gates, breathing, controls };
};

export default useWorkoutRun;
