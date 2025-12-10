import { useState } from 'react';
import type { Router } from 'expo-router';

import type { Step, Phase } from '@core/timer';
import type { Workout } from '@core/entities';

import { computeRemainingWorkoutSec, computeSetProgress } from '../helpers';

import { useTimerEngine } from './useTimerEngine';
import { useSetMaps } from './useSetMaps';
import { useCompletionTracking } from './useCompletionTracking';
import { useBreathingAnimation } from './useBreathingAnimation';
import { useBlockPause } from './useBlockPause';

type UseWorkoutRunArgs = {
    steps: Step[];
    workout?: Workout;
    shouldAutoStart: boolean;
    router: Router;
};

export const useWorkoutRun = ({
    steps,
    workout,
    shouldAutoStart,
    router,
}: UseWorkoutRunArgs) => {
    // ===== 1) Timer engine (single source of truth) =====
    const {
        stepIndex,
        remaining,
        remainingMs,
        running,
        start,
        pause,
        resume,
        skip,
        stop,
    } = useTimerEngine({ steps, shouldAutoStart });

    // ===== 2) Basic derived state =====

    const step: Step | undefined = steps[stepIndex];

    const phase: Phase = (step?.label ?? 'PREP') as Phase;
    const isSetRest =
        phase === 'REST' && step?.id && step.id.startsWith('rest-set-');

    // Natural finish (ran all steps until the end)
    const naturalFinished =
        !!step && !running && stepIndex === steps.length - 1 && remaining <= 0;

    // continuous phase progress (0..1) based on ms
    const durationMs = (step?.durationSec ?? 0) * 1000;
    const safeRemainingMs =
        durationMs > 0 ? Math.max(0, Math.min(remainingMs, durationMs)) : 0;

    const phaseProgress =
        durationMs > 0 ? (durationMs - safeRemainingMs) / durationMs : 0;

    // workout time left (skipping PREP)
    const remainingWorkoutSec =
        steps.length > 0
            ? computeRemainingWorkoutSec(steps, stepIndex, remaining)
            : 0;

    // set pill progress (0..1, continuous)
    const setProgress =
        step != null ? computeSetProgress(steps, step, remainingMs) : 0;

    const isAtStepStart =
        step != null ? remaining === (step.durationSec ?? 0) : false;

    // ===== 3) Set-level maps (last step per set, durations, first step per block) =====

    const { lastSetStepIndexMap, setDurationSecMap, firstStepIndexByBlock } =
        useSetMaps({ steps, workout });

    // ===== 4) Completion tracking (fully completed sets + elapsed time) =====

    const {
        completedSetsByBlock,
        elapsedCompletedSec,
        totalPlannedSets,
        totalCompletedSets,
    } = useCompletionTracking({
        steps,
        stepIndex,
        workout,
        lastSetStepIndexMap,
        setDurationSecMap,
        naturalFinished,
    });

    // ===== 5) Forced finish flag =====

    const [forceFinished, setForceFinished] = useState(false);

    // Final "finished" flag also true when user forced finish
    const isFinished = forceFinished || naturalFinished;

    const primaryLabel: 'Start' | 'Pause' | 'Resume' | 'Done' = isFinished
        ? 'Done'
        : running
          ? 'Pause'
          : isAtStepStart
            ? 'Start'
            : 'Resume';

    // workout structure (block, sets, exercise names)
    const blocks = workout?.blocks ?? [];
    const currentBlock = step ? blocks[step.blockIdx] : undefined;
    const totalSets = currentBlock?.sets ?? 0;

    const getExerciseNameForStep = (s: Step | undefined): string | null => {
        if (!s || s.label !== 'WORK') return null;

        const blk = blocks[s.blockIdx];
        const ex = blk?.exercises?.[s.exIdx];

        if (!ex) return null;

        const trimmed = ex.name?.trim();

        return trimmed && trimmed.length > 0
            ? trimmed
            : `Exercise ${s.exIdx + 1}`;
    };

    let currentExerciseName: string | null = null;
    let nextExerciseName: string | null = null;

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
        } else {
            if (phase === 'WORK') {
                currentExerciseName = getExerciseNameForStep(step);
            } else if (phase === 'REST') {
                for (let i = stepIndex - 1; i >= 0; i -= 1) {
                    const prev = steps[i];
                    if (prev.label === 'WORK') {
                        currentExerciseName = getExerciseNameForStep(prev);
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

    // ===== 6) Breathing animation =====

    const { breathingPhase } = useBreathingAnimation({
        step,
        phase,
        remaining,
        running,
        isFinished,
    });

    // ===== 7) Block-level pause between blocks =====

    const { awaitingBlockContinue, currentBlockIndex, clearBlockPause } =
        useBlockPause({
            step,
            stepIndex,
            firstStepIndexByBlock,
            naturalFinished,
            forceFinished,
            pauseEngine: pause,
        });

    // ===== 8) "fully completed" flag =====

    const isFullyCompleted =
        !forceFinished &&
        naturalFinished &&
        totalPlannedSets > 0 &&
        totalCompletedSets >= totalPlannedSets;

    // ===== 9) controls =====

    const handleEnd = () => {
        pause();
        router.back();
    };

    const handleDone = () => {
        router.back();
    };

    const handleForceFinish = () => {
        stop();
        setForceFinished(true);
        clearBlockPause();
    };

    const handlePrimary = () => {
        if (isFinished) {
            handleDone();
            return;
        }

        if (awaitingBlockContinue) {
            clearBlockPause();
        }

        if (running) {
            pause();
        } else if (isAtStepStart) {
            start();
        } else {
            resume();
        }
    };

    const handleSkip = () => {
        skip();
    };

    return {
        // raw timer state
        remaining,
        running,

        // derived timer info
        step,
        phase,
        isSetRest,
        phaseProgress,
        remainingWorkoutSec,
        setProgress,
        isFinished,
        primaryLabel,

        // workout structure / names
        currentBlock,
        totalSets,
        currentBlockIndex,
        currentExerciseName,
        nextExerciseName,

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
        handleEnd,
        handleDone,
        handleForceFinish,
    };
};
