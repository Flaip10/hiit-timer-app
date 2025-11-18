// src/screens/workouts/WorkoutRunScreen.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Animated, Easing, Text, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import Svg, { Path } from 'react-native-svg';
import Reanimated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing as ReEasing,
} from 'react-native-reanimated';

import { useWorkout } from '@state/useWorkouts';
import { buildSteps, createTimer, type Phase } from '@core/timer';
import { cancelAll, cancelById, scheduleLocal } from '@core/notify';

import { MainContainer } from '@components/layout/MainContainer';
import { FooterBar } from '@components/layout/FooterBar';
import { Button } from '@components/ui/Button/Button';
import st, { ARC_SIZE } from './styles';

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
const AnimatedPath = Reanimated.createAnimatedComponent(Path);

const ARC_STROKE = 17;
const ARC_RADIUS = (ARC_SIZE - ARC_STROKE) / 2;

// 240° arc, open at the bottom like a rainbow
const ARC_SWEEP_DEG = 240;
const ARC_SWEEP_RAD = (ARC_SWEEP_DEG * Math.PI) / 180;

// Arc length used for strokeDasharray/offset
const ARC_LENGTH = ARC_RADIUS * ARC_SWEEP_RAD;

const polarToCartesian = (
    cx: number,
    cy: number,
    radius: number,
    angleDeg: number
) => {
    // angle 0 at top, positive clockwise
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
        x: cx + radius * Math.cos(rad),
        y: cy + radius * Math.sin(rad),
    };
};

const describeArc = (
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number
) => {
    const start = polarToCartesian(cx, cy, radius, startAngle);
    const end = polarToCartesian(cx, cy, radius, endAngle);

    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? 0 : 1;
    const sweepFlag = 1; // clockwise

    return [
        `M ${start.x} ${start.y}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`,
    ].join(' ');
};

type PhaseArcProps = {
    progress: number; // 0..1
    color: string;
};

const PhaseArc = ({ progress, color }: PhaseArcProps) => {
    const cx = ARC_SIZE / 2;
    const cy = ARC_SIZE / 2;

    // Arc from -120° to +120° (240° total)
    const startAngle = -120;
    const endAngle = 120;

    const arcPath = describeArc(cx, cy, ARC_RADIUS, startAngle, endAngle);

    // Shared value for smooth progress
    const animatedProgress = useSharedValue(progress);

    // Animate toward the latest progress
    useEffect(() => {
        const clamped = Math.min(Math.max(progress, 0), 1);
        animatedProgress.value = withTiming(clamped, {
            duration: 300,
            easing: ReEasing.out(ReEasing.cubic),
        });
    }, [progress, animatedProgress]);

    // Animate strokeDashoffset along the arc length
    const animatedProps = useAnimatedProps(() => {
        const clamped = Math.min(Math.max(animatedProgress.value, 0), 1);
        const strokeDashoffset = ARC_LENGTH * (1 - clamped);

        return {
            strokeDashoffset,
        };
    });

    return (
        <Svg width={ARC_SIZE} height={ARC_SIZE}>
            {/* Background track for the arc */}
            <Path
                d={arcPath}
                stroke="#111827"
                strokeWidth={ARC_STROKE}
                fill="transparent"
                strokeLinecap="round"
            />
            {/* Foreground animated arc */}
            <AnimatedPath
                d={arcPath}
                stroke={color}
                strokeWidth={ARC_STROKE}
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={`${ARC_LENGTH} ${ARC_LENGTH}`}
                animatedProps={animatedProps}
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
                <View style={st.arcContainer}>
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
