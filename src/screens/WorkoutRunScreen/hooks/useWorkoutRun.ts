import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { Router } from 'expo-router';

import { createTimer, type Step, type Phase } from '@core/timer';
import type { Workout } from '@core/entities';

import { computeRemainingWorkoutSec, computeSetProgress } from '../helpers';
import {
    cancelAnimation,
    Easing,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

type UseWorkoutRunArgs = {
    steps: Step[];
    workout: Workout;
    shouldAutoStart: boolean;
    router: Router;
};

export const useWorkoutRun = ({
    steps,
    workout,
    shouldAutoStart,
    router,
}: UseWorkoutRunArgs) => {
    const engineRef = useRef<ReturnType<typeof createTimer> | null>(null);
    const autoStartedRef = useRef(false);

    const [stepIndex, setStepIndex] = useState(0);
    const [remaining, setRemaining] = useState(0); // seconds (UI)
    const [remainingMs, setRemainingMs] = useState(0); // ms (for smooth progress)
    const [running, setRunning] = useState(false);

    // -------- engine setup --------
    useEffect(() => {
        if (steps.length === 0) return;

        engineRef.current = createTimer(steps, (snapshot) => {
            setStepIndex(snapshot.stepIndex);
            setRemaining(snapshot.remainingSec);
            setRemainingMs(snapshot.remainingMs);
            setRunning(snapshot.running);
        });

        const firstDurationSec = steps[0]?.durationSec ?? 0;
        setStepIndex(0);
        setRemaining(firstDurationSec);
        setRemainingMs(firstDurationSec * 1000);
        setRunning(false);

        if (shouldAutoStart && !autoStartedRef.current) {
            autoStartedRef.current = true;
            engineRef.current?.start();
        }

        return () => {
            engineRef.current?.stop();
        };
    }, [steps, shouldAutoStart]);

    // -------- foreground resync --------
    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                const engine = engineRef.current;
                if (!engine) return;
                if (engine.isRunning()) {
                    engine.pause();
                    engine.resume();
                }
            }
        });

        return () => {
            sub.remove();
        };
    }, []);

    // -------- derived values (pure logic) --------

    const step: Step | undefined = steps[stepIndex];

    const phase: Phase = (step?.label ?? 'PREP') as Phase;
    const isSetRest =
        phase === 'REST' && step?.id && step.id.startsWith('rest-set-');

    const isFinished =
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

    const primaryLabel: 'Start' | 'Pause' | 'Resume' | 'Done' = isFinished
        ? 'Done'
        : running
          ? 'Pause'
          : isAtStepStart
            ? 'Start'
            : 'Resume';

    // workout structure (block, sets, exercise names)
    const blocks = workout.blocks ?? [];
    const currentBlock = step ? blocks[step.blockIdx] : undefined;
    const totalSets = currentBlock?.sets ?? 0;

    const getExerciseNameForStep = (s: Step | undefined): string | null => {
        if (!s || s.label !== 'WORK') return null;

        const blk = blocks[s.blockIdx];
        const ex = blk?.exercises?.[s.exIdx];

        if (!ex) return null;

        const trimmed = ex.name?.trim();

        // If user provided a non-empty name, use it.
        // Otherwise fall back to "Exercise N" based on the index in the block.
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

    // -------- breathingPhase: 0..1 scalar for UI (timer + arc) --------
    const breathingPhase = useSharedValue(0);

    // Are we in the last 3 seconds of *this step* (independent of running)?
    const isBreathingWindow = useMemo(() => {
        if (!step || !step.durationSec) return false;
        return remaining > 0 && remaining <= 3;
    }, [step, remaining]);

    // Only animate when in the window *and* actually running
    const shouldAnimateBreathing = isBreathingWindow && running;

    useEffect(() => {
        cancelAnimation(breathingPhase);

        if (isFinished) {
            breathingPhase.value = withTiming(0, {
                duration: 150,
                easing: Easing.out(Easing.quad),
            });
            return;
        }

        if (!isBreathingWindow) {
            breathingPhase.value = withTiming(0, {
                duration: 150,
                easing: Easing.out(Easing.quad),
            });
            return;
        }

        if (!shouldAnimateBreathing) {
            // paused inside the window → freeze
            return;
        }

        breathingPhase.value = withRepeat(
            withSequence(
                withTiming(1, {
                    duration: 500,
                    easing: Easing.linear,
                }),
                withTiming(0, {
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                })
            ),
            -1,
            false
        );
    }, [isBreathingWindow, shouldAnimateBreathing, isFinished, breathingPhase]);

    // -------- controls --------

    const handleStart = () => engineRef.current?.start();
    const handlePause = () => engineRef.current?.pause();
    const handleResume = () => engineRef.current?.resume();
    const handleSkip = () => engineRef.current?.skip();

    const handleEnd = () => {
        handlePause();
        router.back();
    };

    const handleDone = () => {
        router.back();
    };

    const handlePrimary = () => {
        if (isFinished) {
            handleDone();
            return;
        }

        if (running) {
            handlePause();
        } else if (isAtStepStart) {
            handleStart();
        } else {
            handleResume();
        }
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
        currentExerciseName,
        nextExerciseName,

        // breathing scalar for UI (0..1)
        breathingPhase,

        // controls
        handlePrimary,
        handleSkip,
        handleEnd,
        handleDone,
    };
};
