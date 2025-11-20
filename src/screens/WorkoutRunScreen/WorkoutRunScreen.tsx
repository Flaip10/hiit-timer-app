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
import { WorkoutMetaStrip } from './WorkoutMetaStrip';

// -------- helpers --------

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

// -------- main screen --------

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

    // Build steps from workout blocks
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

    // --- source-of-truth timer state ---
    const [stepIndex, setStepIndex] = useState(0);
    const [remaining, setRemaining] = useState(0); // seconds (display)
    const [remainingMs, setRemainingMs] = useState(0); // ms (for smooth progress)
    const [running, setRunning] = useState(false);

    // Breathing animation for last seconds (Animated, not Reanimated)
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

    // -------- empty / not found state --------

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

    // -------- derived data from current step --------

    const step = steps[stepIndex];
    const phase = step.label as Phase;
    const phaseColor = colorFor(phase);
    const phaseLabel = labelFor(phase);

    const currentBlock = workout.blocks[step.blockIdx];
    const totalSets = currentBlock?.scheme.sets ?? 0;

    const isFinished =
        !running && stepIndex === steps.length - 1 && remaining <= 0;

    // continuous phase progress (0..1) based on ms
    const durationMs = (step?.durationSec ?? 0) * 1000;
    const safeRemainingMs =
        durationMs > 0 ? Math.max(0, Math.min(remainingMs, durationMs)) : 0;

    const phaseProgress =
        durationMs > 0 ? (durationMs - safeRemainingMs) / durationMs : 0;

    // total workout time remaining (current partial step + later steps)
    const remainingWorkoutSec = steps.reduce((acc, s, idx) => {
        // Skip PREP steps entirely from "workout time"
        if (s.label === 'PREP') return acc;

        if (idx > stepIndex) {
            return acc + (s.durationSec ?? 0);
        }

        if (idx === stepIndex) {
            return acc + remaining;
        }

        return acc;
    }, 0);

    // progress within the *current set* (0..1, continuous based on ms)
    let setProgress = 0;

    if (phase !== 'PREP' && totalSets > 0) {
        let totalSetDurationMs = 0;
        let elapsedInSetMs = 0;

        for (let i = 0; i < steps.length; i += 1) {
            const s = steps[i];

            if (
                s.blockIdx === step.blockIdx &&
                s.setIdx === step.setIdx &&
                s.label !== 'PREP' // <- skip prepare steps entirely
            ) {
                const stepDurationMs = (s.durationSec ?? 0) * 1000;
                totalSetDurationMs += stepDurationMs;

                if (i < stepIndex) {
                    // fully completed steps in this set
                    elapsedInSetMs += stepDurationMs;
                } else if (i === stepIndex) {
                    // partial current step in this set
                    const clampedRemaining = Math.min(
                        stepDurationMs,
                        Math.max(0, remainingMs)
                    );
                    const elapsedInThisStep = stepDurationMs - clampedRemaining;
                    elapsedInSetMs += elapsedInThisStep;
                }
            }
        }

        if (totalSetDurationMs > 0) {
            const raw = elapsedInSetMs / totalSetDurationMs;
            setProgress = Math.min(1, Math.max(0, raw));
        }
    }

    // helper: exercise name for a WORK step
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
        // Look forward from the current step and collect the first 2 WORK steps
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
        // CURRENT exercise for WORK / REST
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

        // NEXT exercise: first WORK step after this step
        for (let i = stepIndex + 1; i < steps.length; i += 1) {
            const future = steps[i];
            if (future.label === 'WORK') {
                nextExerciseName = getExerciseNameForStep(future);
                break;
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
        engineRef.current?.stop();
        if (lastNotifIdRef.current) {
            void cancelById(lastNotifIdRef.current);
            lastNotifIdRef.current = null;
        }
        void cancelAll();
        router.back();
    };

    const handleDone = () => {
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

    // -------- render --------

    return (
        <>
            <MainContainer scroll={false}>
                {/* ARC + PHASE */}
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

                {/* CURRENT + NEXT EXERCISE */}
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

                {/* FINISHED CARD */}
                <FinishedCard visible={isFinished} />

                {/* BLOCK / SET META STRIP */}
                {!isFinished && (
                    <WorkoutMetaStrip
                        blockIndex={step.blockIdx}
                        blockTitle={currentBlock?.title}
                        currentSetIndex={step.setIdx}
                        totalSets={totalSets}
                        remainingWorkoutSec={remainingWorkoutSec}
                        setProgress={setProgress}
                        phaseColor={phaseColor}
                    />
                )}
            </MainContainer>

            {/* FOOTER BUTTONS */}
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
