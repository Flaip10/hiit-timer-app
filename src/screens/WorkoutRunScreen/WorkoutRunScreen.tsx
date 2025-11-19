import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Animated, Easing, Text, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';

import { useWorkout } from '@state/useWorkouts';
import { buildSteps, createTimer, type Phase } from '@core/timer';
import { cancelAll, cancelById, scheduleLocal } from '@core/notify';

import { MainContainer } from '@components/layout/MainContainer';
import { FooterBar } from '@components/layout/FooterBar';
import { Button } from '@components/ui/Button/Button';
import st from './styles';
import { PhaseArc } from './PhaseArc';
import { ExerciseInfoCard } from './ExerciseInfoCard';
import { NextExerciseCarousel } from './NextExerciseCarousel';
import { FinishedCard } from './FinishedCard';
import { PhasePill } from './PhasePill';

const colorFor = (phase: Phase): string => {
    if (phase === 'WORK') return '#22C55E';
    if (phase === 'REST') return '#60A5FA';
    return '#F59E0B';
};

const labelFor = (phase: Phase): string => {
    if (phase === 'WORK') return 'Work';
    if (phase === 'REST') return 'Rest';
    return 'Prepare';
};

export const WorkoutRunScreen = () => {
    useKeepAwake();

    const { id, autoStart } = useLocalSearchParams<{
        id?: string;
        autoStart?: string;
    }>();
    const router = useRouter();
    const workout = useWorkout(id);

    const shouldAutoStart =
        autoStart === '1' || autoStart === 'true' || autoStart === 'yes';

    // Steps + total duration
    const { steps } = useMemo(() => {
        if (!workout) {
            return {
                steps: [] as ReturnType<typeof buildSteps>['steps'],
            };
        }
        const built = buildSteps(5, workout.blocks);
        return { steps: built.steps };
    }, [workout]);

    const engineRef = useRef<ReturnType<typeof createTimer> | null>(null);
    const lastNotifIdRef = useRef<string | null>(null);
    const autoStartedRef = useRef(false);

    const [stepIndex, setStepIndex] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [running, setRunning] = useState(false);

    // Breathing animation for last seconds
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const stopBreathing = () => {
        scaleAnim.stopAnimation();
        scaleAnim.setValue(1);
    };

    const startBreathing = () => {
        // already animating? avoid stacking
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

    // Engine setup
    useEffect(() => {
        const setup = async () => {
            await cancelAll();
        };
        void setup();

        if (steps.length === 0) return;

        engineRef.current = createTimer(steps, (snapshot) => {
            setStepIndex(snapshot.stepIndex);
            setRemaining(snapshot.remainingSec);
            setRunning(snapshot.running);
        });

        setStepIndex(0);
        setRemaining(steps[0]?.durationSec ?? 0);
        setRunning(false);

        // auto-start PREP if requested (coming from WorkoutSummary "Start")
        if (shouldAutoStart && !autoStartedRef.current) {
            autoStartedRef.current = true;
            engineRef.current?.start();
        }

        return () => {
            engineRef.current?.stop();
            void cancelAll();
        };
    }, [steps, shouldAutoStart]);

    // Notifications on step end
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

    // Foreground resync
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

    // Breathing toggle (based on remaining time of the current step)
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

    // Empty / not found state
    if (!workout || steps.length === 0) {
        return (
            <>
                <MainContainer title="Run workout" scroll={false}>
                    <View style={st.emptyContainer}>
                        <Text style={st.emptyTitle}>No steps to run</Text>
                        <Text style={st.emptyText}>
                            This workout has no timed steps configured.
                        </Text>
                    </View>
                </MainContainer>
                <FooterBar>
                    <Button
                        title="Back"
                        variant="secondary"
                        onPress={() => router.back()}
                        flex={1}
                    />
                </FooterBar>
            </>
        );
    }

    const step = steps[stepIndex];
    const phase = step.label as Phase;
    const phaseColor = colorFor(phase);
    const phaseLabel = labelFor(phase);

    const isFinished =
        !running && stepIndex === steps.length - 1 && remaining <= 0;

    // Helper to read exercise name for a given step (WORK step only)
    const getExerciseNameForStep = (
        s: (typeof steps)[number] | undefined
    ): string | null => {
        if (!s || s.label !== 'WORK') return null;
        const block = workout.blocks[s.blockIdx];
        const exercise = block?.exercises[s.exIdx];
        return exercise?.name ?? null;
    };

    let currentExerciseName: string | null = null;
    let nextExerciseName: string | null = null;

    if (phase === 'PREP') {
        // Look forward from the *current* step and collect first 2 WORK steps
        const upcoming: (typeof steps)[number][] = [];

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
        // --- CURRENT exercise for WORK / REST ---
        if (phase === 'WORK') {
            currentExerciseName = getExerciseNameForStep(step);
        } else if (phase === 'REST') {
            // last WORK before this REST
            for (let i = stepIndex - 1; i >= 0; i -= 1) {
                const prev = steps[i];
                if (prev.label === 'WORK') {
                    currentExerciseName = getExerciseNameForStep(prev);
                    break;
                }
            }
        }

        // --- NEXT exercise: first WORK step after THIS step ---
        for (let i = stepIndex + 1; i < steps.length; i += 1) {
            const future = steps[i];
            if (future.label === 'WORK') {
                nextExerciseName = getExerciseNameForStep(future);
                break;
            }
        }
    }

    // progress inside *this phase*
    const phaseProgress =
        step.durationSec && step.durationSec > 0
            ? (step.durationSec - remaining) / step.durationSec
            : 0;

    // Controls
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
        engineRef.current?.stop();
        if (lastNotifIdRef.current) {
            void cancelById(lastNotifIdRef.current);
            lastNotifIdRef.current = null;
        }
        void cancelAll();
        router.back();
    };

    const handleDone = () => {
        // natural finish → just go back to previous (summary)
        router.back();
    };

    const isAtStepStart = remaining === step.durationSec;

    const primaryLabel = isFinished
        ? 'Done'
        : running
          ? 'Pause'
          : isAtStepStart
            ? 'Start'
            : 'Resume';

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

    return (
        <>
            <MainContainer title={workout.name} scroll={false}>
                <View style={st.arcContainer}>
                    <PhasePill
                        color={phaseColor}
                        label={isFinished ? 'Done' : phaseLabel}
                        containerStyle={st.phasePill}
                        textStyle={st.phasePillText}
                    />

                    <View style={st.arcWrapper}>
                        <PhaseArc
                            progress={phaseProgress}
                            color={phaseColor}
                            finished={isFinished}
                        />
                        <Animated.Text
                            style={[
                                st.timer,
                                { transform: [{ scale: scaleAnim }] },
                            ]}
                        >
                            {isFinished ? 0 : remaining}
                        </Animated.Text>
                    </View>
                </View>

                <View style={st.metaContainer}>
                    {!isFinished && currentExerciseName && (
                        <ExerciseInfoCard
                            phase={phase}
                            phaseLabel={phaseLabel}
                            color={phaseColor}
                            currentExerciseName={currentExerciseName}
                        />
                    )}

                    {!isFinished && nextExerciseName && (
                        <NextExerciseCarousel
                            phase={phase}
                            label={nextExerciseName}
                        />
                    )}
                </View>

                <FinishedCard visible={isFinished} />

                {/* Progress bar is commented for now; keep here if you want it later */}
                {/*
                <View style={st.progressContainer}>
                    <View style={st.progressHeaderRow}>
                        <Text style={st.progressMeta}>{metaLabel}</Text>
                        <Text style={st.progressText}>
                            Step {currentStepNumber} / {totalSteps}
                        </Text>
                    </View>
                    <View style={st.progressBarBg}>
                        <View
                            style={[st.progressBarFill, { flex: progress }]}
                        />
                        <View
                            style={[
                                st.progressBarRemaining,
                                { flex: 1 - progress },
                            ]}
                        />
                    </View>
                </View>
                */}
            </MainContainer>

            <FooterBar>
                {isFinished ? (
                    <Button
                        title="Done"
                        variant="primary"
                        onPress={handleDone}
                        flex={1}
                    />
                ) : (
                    <View style={st.footerRunLayout}>
                        <View style={st.footerTopRow}>
                            <Button
                                title="Skip"
                                variant="secondary"
                                onPress={handleSkip}
                                style={st.smallSecondary}
                            />
                            <Button
                                title="End"
                                variant="secondary"
                                onPress={handleEnd}
                                style={st.smallSecondary}
                            />
                        </View>
                        <View style={st.footerTopRow}>
                            <Button
                                title={primaryLabel}
                                variant="primary"
                                onPress={handlePrimary}
                                flex={1}
                                textStyle={st.bigPrimaryText}
                                style={
                                    primaryLabel === 'Pause'
                                        ? st.primaryAlt
                                        : undefined
                                }
                            />
                        </View>
                    </View>
                )}
            </FooterBar>
        </>
    );
};

export default WorkoutRunScreen;
