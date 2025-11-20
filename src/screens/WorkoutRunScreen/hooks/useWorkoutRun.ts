import { useEffect, useRef, useState } from 'react';
import { AppState, Animated, Easing } from 'react-native';

import { createTimer, type Step, type Phase } from '@core/timer';
import { cancelAll, cancelById, scheduleLocal } from '@core/notify';
import type { Router } from 'expo-router';

import { computeRemainingWorkoutSec, computeSetProgress } from '../helpers';

type UseWorkoutRunArgs = {
    steps: Step[];
    workout: any; // we only read blocks/exercises/name, keep this loose
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
    const lastNotifIdRef = useRef<string | null>(null);
    const autoStartedRef = useRef(false);

    const [stepIndex, setStepIndex] = useState(0);
    const [remaining, setRemaining] = useState(0); // seconds (UI)
    const [remainingMs, setRemainingMs] = useState(0); // ms (for smooth progress)
    const [running, setRunning] = useState(false);

    // breathing animation value (for the big number)
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const stopBreathing = () => {
        scaleAnim.stopAnimation();
        scaleAnim.setValue(1);
    };

    const startBreathing = () => {
        scaleAnim.stopAnimation();
        scaleAnim.setValue(1);
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.1,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1.0,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    // -------- engine setup --------
    useEffect(() => {
        const setup = async () => {
            await cancelAll();
        };
        void setup();

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
            void cancelAll();
        };
    }, [steps, shouldAutoStart]);

    // -------- notifications on step end --------
    useEffect(() => {
        const schedule = async () => {
            if (lastNotifIdRef.current) {
                await cancelById(lastNotifIdRef.current).catch(() => {});
                lastNotifIdRef.current = null;
            }

            if (!running) return;

            const step = steps[stepIndex];
            if (!step || remaining <= 0) return;

            const title =
                step.label === 'WORK'
                    ? 'Work done'
                    : step.label === 'REST'
                      ? 'Rest done'
                      : 'Prep done';

            const next = steps[stepIndex + 1];
            const body = next
                ? `Next: ${next.label}${
                      next.nextName ? ` • ${next.nextName}` : ''
                  }`
                : 'Workout finished';

            const id = await scheduleLocal(remaining, title, body);
            lastNotifIdRef.current = id;
        };

        void schedule();
    }, [stepIndex, running, remaining, steps]);

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

    // -------- breathing toggle (last 3 seconds) --------
    useEffect(() => {
        const step = steps[stepIndex];
        if (!step || !step.durationSec) {
            stopBreathing();
            return;
        }

        if (remaining > 0 && remaining <= 3) {
            startBreathing();
        } else {
            stopBreathing();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remaining, stepIndex, steps]);

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
    const blocks = workout?.blocks ?? [];
    const currentBlock = step ? blocks[step.blockIdx] : undefined;
    const totalSets = currentBlock?.scheme?.sets ?? 0;

    const getExerciseNameForStep = (s: Step | undefined): string | null => {
        if (!s || s.label !== 'WORK' || !workout) return null;
        const blk = workout.blocks[s.blockIdx];
        const ex = blk?.exercises?.[s.exIdx];
        return ex?.name ?? null;
    };

    let currentExerciseName: string | null = null;
    let nextExerciseName: string | null = null;

    if (step && workout) {
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

    // -------- controls --------

    const handleStart = () => engineRef.current?.start();

    const handlePause = () => {
        engineRef.current?.pause();
        if (lastNotifIdRef.current) {
            void cancelById(lastNotifIdRef.current);
            lastNotifIdRef.current = null;
        }
    };

    const handleResume = () => engineRef.current?.resume();

    const handleSkip = () => engineRef.current?.skip();

    const handleEnd = () => {
        handlePause();
        void cancelAll();
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
        scaleAnim,

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

        // controls
        handlePrimary,
        handleSkip,
        handleEnd,
        handleDone,
    };
};
