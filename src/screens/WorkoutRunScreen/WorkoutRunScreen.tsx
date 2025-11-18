// src/screens/workouts/WorkoutRunScreen.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Animated, Easing, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import Svg, { Circle } from 'react-native-svg';

import { useWorkout } from '@state/useWorkouts';
import { buildSteps, createTimer, type Phase } from '@core/timer';
import { cancelAll, cancelById, scheduleLocal } from '@core/notify';

import { MainContainer } from '@components/layout/MainContainer';
import { FooterBar } from '@components/layout/FooterBar';
import { Button } from '@components/ui/Button/Button';
import st from './styles';

const colorFor = (phase: Phase): string => {
    if (phase === 'WORK') return '#22C55E';
    if (phase === 'REST') return '#60A5FA';
    return '#F59E0B'; // PREP / else
};

const labelFor = (phase: Phase): string => {
    if (phase === 'WORK') return 'Work';
    if (phase === 'REST') return 'Rest';
    return 'Prepare';
};

// ——— Arc around the timer ———
const ARC_SIZE = 220;
const ARC_STROKE = 15;
const ARC_RADIUS = (ARC_SIZE - ARC_STROKE) / 2;
const ARC_CIRC = 2 * Math.PI * ARC_RADIUS;

type PhaseArcProps = {
    progress: number; // 0..1
    color: string;
};

const PhaseArc = ({ progress, color }: PhaseArcProps) => {
    const clamped = Math.min(Math.max(progress, 0), 1);
    const strokeDashoffset = ARC_CIRC * (1 - clamped);

    return (
        <Svg width={ARC_SIZE} height={ARC_SIZE}>
            {/* Background track */}
            <Circle
                cx={ARC_SIZE / 2}
                cy={ARC_SIZE / 2}
                r={ARC_RADIUS}
                stroke="#111827"
                strokeWidth={ARC_STROKE}
                fill="transparent"
            />
            {/* Progress arc */}
            <Circle
                cx={ARC_SIZE / 2}
                cy={ARC_SIZE / 2}
                r={ARC_RADIUS}
                stroke={color}
                strokeWidth={ARC_STROKE}
                fill="transparent"
                strokeDasharray={`${ARC_CIRC} ${ARC_CIRC}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
            />
        </Svg>
    );
};

export const WorkoutRunScreen = () => {
    useKeepAwake();

    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const workout = useWorkout(id);

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
                    duration: 180,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1.0,
                    duration: 180,
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

        return () => {
            engineRef.current?.stop();
            void cancelAll();
        };
    }, [steps]);

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

    const meta = `Block ${step.blockIdx + 1} • Ex ${step.exIdx + 1} • Set ${
        step.setIdx + 1
    }`;

    // progress inside *this phase*
    const phaseProgress =
        step.durationSec && step.durationSec > 0
            ? (step.durationSec - remaining) / step.durationSec
            : 0;

    const totalSteps = steps.length;
    const currentStepNumber = stepIndex + 1;
    const progress = totalSteps > 0 ? currentStepNumber / totalSteps : 0; // 0..1

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

    const handlePlus30 = () => engineRef.current?.addSeconds(30);

    const handleEnd = () => {
        engineRef.current?.stop();
        if (lastNotifIdRef.current) {
            void cancelById(lastNotifIdRef.current);
            lastNotifIdRef.current = null;
        }
        void cancelAll();
        router.back();
    };

    const isAtStepStart = remaining === step.durationSec;
    const primaryLabel = running ? 'Pause' : isAtStepStart ? 'Start' : 'Resume';

    const handlePrimary = () => {
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
                <View style={st.runContainer}>
                    {/* Phase pill (fixed position above timer) */}
                    <View
                        style={[st.phasePill, { backgroundColor: phaseColor }]}
                    >
                        <Text style={st.phasePillText}>{phaseLabel}</Text>
                    </View>

                    {/* Arc + timer (timer absolutely centered, arc behind it) */}
                    <View style={st.arcWrapper}>
                        <PhaseArc progress={phaseProgress} color={phaseColor} />
                        <Animated.Text
                            style={[
                                st.timer,
                                {
                                    transform: [{ scale: scaleAnim }],
                                },
                            ]}
                        >
                            {remaining}
                        </Animated.Text>
                    </View>

                    {/* Meta + "Next" in a fixed-height area to avoid vertical jumps */}
                    <View style={st.metaContainer}>
                        <Text style={st.meta}>{meta}</Text>
                        {step.nextName ? (
                            <Text style={st.next}>Next: {step.nextName}</Text>
                        ) : (
                            <View style={st.nextPlaceholder} />
                        )}
                    </View>

                    {/* Progress indicator for whole workout */}
                    <View style={st.progressContainer}>
                        <Text style={st.progressText}>
                            Step {currentStepNumber} / {totalSteps}
                        </Text>
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
                </View>
            </MainContainer>

            <FooterBar>
                <Button
                    title={primaryLabel}
                    variant="primary"
                    onPress={handlePrimary}
                    flex={1}
                />
                <Button
                    title="Skip"
                    variant="secondary"
                    onPress={handleSkip}
                    flex={1}
                />
                <Button
                    title="+30s"
                    variant="secondary"
                    onPress={handlePlus30}
                    flex={1}
                />
                <Button
                    title="End"
                    variant="secondary"
                    onPress={handleEnd}
                    flex={1}
                />
            </FooterBar>
        </>
    );
};

export default WorkoutRunScreen;
