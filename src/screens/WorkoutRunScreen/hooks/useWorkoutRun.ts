import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { Router } from 'expo-router';

import { createTimer, type Phase, type Step } from '@core/timer';
import { useWorkoutRunStore } from '@src/state/stores/useWorkoutRunStore';

import type { RunPlan } from './useRunBuilder';
import { useBreathingAnimation } from './useBreathingAnimation';
import { useBlockPause } from './useBlockPause';
import { useSetMaps } from './useSetMaps';

type UseWorkoutRunArgs = {
    plan: RunPlan;
    shouldAutoStart: boolean;
    router: Router;
};

export const useWorkoutRun = ({
    plan,
    shouldAutoStart,
    router,
}: UseWorkoutRunArgs) => {
    // ============================================================================
    // Inputs
    // ============================================================================
    const { steps } = plan;

    // ============================================================================
    // Engine refs (no re-render)
    // ============================================================================
    const engineRef = useRef<ReturnType<typeof createTimer> | null>(null);
    const autoStartedRef = useRef(false);

    // ============================================================================
    // Local UI state (renders)
    // ============================================================================
    const [stepIndex, setStepIndex] = useState(0);
    const [remaining, setRemaining] = useState(0); // seconds (UI)
    const [running, setRunning] = useState(false);

    // ============================================================================
    // Completion tracking (renders + refs)
    // ============================================================================
    const [completedSetsByBlock, setCompletedSetsByBlock] = useState<number[]>(
        []
    );
    const [elapsedCompletedSec, setElapsedCompletedSec] = useState(0);
    const [forceFinished, setForceFinished] = useState(false);

    const completedSetKeysRef = useRef<Set<string>>(new Set());
    const lastStepIndexRef = useRef<number | null>(null);
    const finalStepProcessedRef = useRef(false);

    // ============================================================================
    // Stable engine commands
    // ============================================================================
    const pauseEngine = useCallback(() => {
        engineRef.current?.pause();
    }, []);

    const handleStart = useCallback(() => engineRef.current?.start(), []);
    const handlePause = useCallback(() => engineRef.current?.pause(), []);
    const handleResume = useCallback(() => engineRef.current?.resume(), []);
    const handleSkip = useCallback(() => engineRef.current?.skip(), []);
    const handleDone = useCallback(() => {
        router.back();
    }, [router]);

    // ============================================================================
    // Engine lifecycle + zustand snapshot sync
    // ============================================================================
    useEffect(() => {
        if (steps.length === 0) return;

        const firstStep = steps[0] ?? null;
        const firstStepMs = Math.max(0, (firstStep?.durationSec ?? 0) * 1000);

        // Initialize zustand run definition + baseline snapshot
        useWorkoutRunStore.getState().startRun({
            steps,
            totalSets: plan.totalSetsForRun,
            snapshot: {
                running: false,
                remainingMs: firstStepMs,
                currentStep: firstStep,
            },
        });

        engineRef.current = createTimer(steps, (tick) => {
            // local UI state
            setStepIndex(tick.stepIndex);
            setRemaining(tick.remainingSec);
            setRunning(tick.running);

            // shared snapshot (ms precision + currentStep object)
            useWorkoutRunStore.getState().setEngineSnapshot({
                running: tick.running,
                remainingMs: tick.remainingMs,
                currentStep: steps[tick.stepIndex] ?? null,
            });
        });

        // Seed local UI state
        setStepIndex(0);
        setRemaining(firstStep?.durationSec ?? 0);
        setRunning(false);

        if (shouldAutoStart && !autoStartedRef.current) {
            autoStartedRef.current = true;
            engineRef.current?.start();
        }

        return () => {
            engineRef.current?.stop();
            useWorkoutRunStore.getState().resetRun();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldAutoStart, plan.runKey]);

    // ============================================================================
    // Foreground resync (wall-clock drift fix)
    // ============================================================================
    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state !== 'active') return;

            const engine = engineRef.current;
            if (!engine) return;

            if (engine.isRunning()) {
                // Rebase endAt vs wall clock
                engine.pause();
                engine.resume();
            }
        });

        return () => sub.remove();
    }, []);

    // ============================================================================
    // Derived step state (pure)
    // ============================================================================
    const step: Step | undefined = steps[stepIndex];
    const phase: Phase = (step?.label ?? 'PREP') as Phase;

    const isSetRest =
        phase === 'REST' && !!step?.id && step.id.startsWith('rest-set-');

    const naturalFinished =
        !!step && !running && stepIndex === steps.length - 1 && remaining <= 0;

    const isFinished = forceFinished || naturalFinished;

    const isAtStepStart =
        step != null ? remaining === (step.durationSec ?? 0) : false;

    const primaryLabel: 'Start' | 'Pause' | 'Resume' | 'Done' = isFinished
        ? 'Done'
        : running
          ? 'Pause'
          : isAtStepStart
            ? 'Start'
            : 'Resume';

    // ============================================================================
    // Precomputed maps (set + block helpers)
    // ============================================================================
    const { lastSetStepIndexMap, setDurationSecMap, firstStepIndexByBlock } =
        useSetMaps({ steps });

    // ============================================================================
    // Block pause between blocks
    // ============================================================================
    const { awaitingBlockContinue, currentBlockIndex, clearBlockPause } =
        useBlockPause({
            step,
            stepIndex,
            firstStepIndexByBlock,
            naturalFinished,
            forceFinished,
            pauseEngine,
        });

    // ============================================================================
    // Remaining time inside current block (UI)
    // ============================================================================
    const remainingBlockSec = useMemo(() => {
        if (!step || step.blockIdx == null) return 0;

        const currentBlockIdx = step.blockIdx;
        let total = 0;

        for (let i = 0; i < steps.length; i += 1) {
            const s = steps[i];
            if (s.blockIdx !== currentBlockIdx) continue;
            if (i < stepIndex) continue;

            total += i === stepIndex ? remaining : (s.durationSec ?? 0);
        }

        return total;
    }, [step, stepIndex, remaining, steps]);

    // ============================================================================
    // Workout structure lookup (from plan)
    // ============================================================================
    const totalSetsInBlock =
        step?.blockIdx != null
            ? (plan.plannedSetsByBlock[step.blockIdx] ?? 0)
            : 0;

    const totalExercisesInBlock =
        step?.blockIdx != null
            ? (plan.exercisesCountByBlock[step.blockIdx] ?? 0)
            : 0;

    const getExerciseNameForStep = useCallback(
        (s: Step | undefined): string | null => {
            if (!s || s.label !== 'WORK') return null;

            const b = s.blockIdx;
            const e = s.exIdx;
            if (b == null || e == null) return null;

            return plan.exerciseNamesByBlock[b]?.[e] ?? `Exercise ${e + 1}`;
        },
        [plan.exerciseNamesByBlock]
    );

    // Resolve current + next exercise labels (imperative scan, cheap)
    let currentExerciseName: string | null = null;
    let nextExerciseName: string | null = null;
    let currentExerciseIndexInBlock: number | null = null;

    if (step) {
        if (phase === 'PREP') {
            const upcoming: Step[] = [];

            for (let i = stepIndex; i < steps.length; i += 1) {
                const candidate = steps[i];
                if (candidate.label === 'WORK') {
                    upcoming.push(candidate);
                    if (upcoming.length === 2) break;
                }
            }

            const firstWork = upcoming[0];
            const secondWork = upcoming[1];

            currentExerciseName = getExerciseNameForStep(firstWork);
            nextExerciseName = getExerciseNameForStep(secondWork);
            currentExerciseIndexInBlock =
                firstWork && firstWork.exIdx != null ? firstWork.exIdx : null;
        } else {
            if (phase === 'WORK') {
                currentExerciseName = getExerciseNameForStep(step);
                currentExerciseIndexInBlock = step.exIdx ?? null;
            } else if (phase === 'REST') {
                for (let i = stepIndex - 1; i >= 0; i -= 1) {
                    const prev = steps[i];
                    if (prev.label === 'WORK') {
                        currentExerciseName = getExerciseNameForStep(prev);
                        currentExerciseIndexInBlock = prev.exIdx ?? null;
                        break;
                    }
                }
            }

            for (let i = stepIndex + 1; i < steps.length; i += 1) {
                const future = steps[i];
                if (future.label === 'WORK') {
                    nextExerciseName = getExerciseNameForStep(future);
                    break;
                }
            }
        }
    }

    // ============================================================================
    // Completion tracking (sets + elapsed time)
    // ============================================================================
    useEffect(() => {
        // reset for a new run plan
        setCompletedSetsByBlock(Array(plan.totalBlocks).fill(0));
        setElapsedCompletedSec(0);

        completedSetKeysRef.current = new Set();
        lastStepIndexRef.current = null;
        finalStepProcessedRef.current = false;

        setForceFinished(false);
        clearBlockPause();

        // new plan => allow auto-start again
        autoStartedRef.current = false;
    }, [clearBlockPause, plan.runKey, plan.totalBlocks]);

    const processCompletedStepIndex = useCallback(
        (completedIndex: number) => {
            const completedStep = steps[completedIndex];
            if (!completedStep) return;

            const { blockIdx, setIdx } = completedStep;
            if (blockIdx == null || setIdx == null) return;

            const key = `${blockIdx}-${setIdx}`;
            const lastIdxForSet = lastSetStepIndexMap.get(key);

            // mark only when the set's final step completes
            if (lastIdxForSet == null || lastIdxForSet !== completedIndex)
                return;
            if (completedSetKeysRef.current.has(key)) return;

            completedSetKeysRef.current.add(key);

            setCompletedSetsByBlock((prev) => {
                const next = prev.slice();
                if (blockIdx < 0 || blockIdx >= next.length) return next;
                next[blockIdx] = (next[blockIdx] ?? 0) + 1;
                return next;
            });

            const setDurationSec = setDurationSecMap.get(key) ?? 0;
            if (setDurationSec > 0)
                setElapsedCompletedSec((prev) => prev + setDurationSec);
        },
        [steps, lastSetStepIndexMap, setDurationSecMap]
    );

    useEffect(() => {
        if (steps.length === 0) return;

        const prevIndex = lastStepIndexRef.current;

        if (prevIndex == null) {
            lastStepIndexRef.current = stepIndex;
            return;
        }

        if (stepIndex !== prevIndex) {
            processCompletedStepIndex(prevIndex);
            lastStepIndexRef.current = stepIndex;
        }
    }, [stepIndex, steps.length, processCompletedStepIndex]);

    useEffect(() => {
        if (!naturalFinished) return;
        if (finalStepProcessedRef.current) return;

        finalStepProcessedRef.current = true;
        if (stepIndex >= 0 && stepIndex < steps.length)
            processCompletedStepIndex(stepIndex);
    }, [naturalFinished, stepIndex, steps.length, processCompletedStepIndex]);

    // ============================================================================
    // Breathing animation (UI-only shared value)
    // ============================================================================
    const { breathingPhase } = useBreathingAnimation({
        step,
        isFinished,
        phase,
        remaining,
        running,
    });

    // ============================================================================
    // Fully completed flag
    // ============================================================================
    const totalPlannedSets = plan.plannedSetsByBlock.reduce(
        (acc, val) => acc + (val ?? 0),
        0
    );
    const totalCompletedSets = completedSetsByBlock.reduce(
        (acc, val) => acc + (val ?? 0),
        0
    );

    const isFullyCompleted =
        !forceFinished &&
        naturalFinished &&
        totalPlannedSets > 0 &&
        totalCompletedSets >= totalPlannedSets;

    // ============================================================================
    // User actions
    // ============================================================================
    const handleForceFinish = useCallback(() => {
        engineRef.current?.stop();

        setRunning(false);
        setForceFinished(true);
        clearBlockPause();

        useWorkoutRunStore.getState().setEngineSnapshot({
            running: false,
            remainingMs: 0,
            currentStep: steps[stepIndex] ?? null,
        });
    }, [clearBlockPause, stepIndex, steps]);

    const handlePrimary = useCallback(() => {
        if (isFinished) {
            handleDone();
            return;
        }

        if (awaitingBlockContinue) clearBlockPause();

        if (running) handlePause();
        else if (isAtStepStart) handleStart();
        else handleResume();
    }, [
        awaitingBlockContinue,
        clearBlockPause,
        handleDone,
        handlePause,
        handleResume,
        handleStart,
        isAtStepStart,
        isFinished,
        running,
    ]);

    // ============================================================================
    // Public API
    // ============================================================================
    return {
        // raw timer state
        remaining,
        running,

        // derived timer info
        step,
        phase,
        isSetRest,
        remainingBlockSec,
        isFinished,
        primaryLabel,

        // workout structure / names
        totalSetsInBlock,
        currentBlockIndex,
        currentExerciseName,
        nextExerciseName,
        currentExerciseIndexInBlock,
        totalExercisesInBlock,

        // completion info
        completedSetsByBlock,
        elapsedCompletedSec,
        isFullyCompleted,
        awaitingBlockContinue,

        // breathing scalar for UI (0..1)
        breathingPhase,

        // controls
        handlePrimary,
        handleSkip,
        handleDone,
        handleForceFinish,
    };
};

export default useWorkoutRun;
