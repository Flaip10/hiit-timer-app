import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';

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
    return '#F59E0B'; // PREP or others
};

const labelFor = (phase: Phase): string => {
    if (phase === 'WORK') return 'Work';
    if (phase === 'REST') return 'Rest';
    return 'Prepare';
};

export const WorkoutRunScreen = () => {
    useKeepAwake();

    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const workout = useWorkout(id);

    // Build steps once for this workout
    const { steps, totalDurationSec } = useMemo(() => {
        if (!workout) {
            return {
                steps: [] as ReturnType<typeof buildSteps>['steps'],
                totalDurationSec: 0,
            };
        }

        const built = buildSteps(5, workout.blocks);
        const total = built.steps.reduce(
            (sum, s) => sum + (s.durationSec ?? 0),
            0
        );

        return { steps: built.steps, totalDurationSec: total };
    }, [workout]);

    const engineRef = useRef<ReturnType<typeof createTimer> | null>(null);
    const lastNotifIdRef = useRef<string | null>(null);

    const [stepIndex, setStepIndex] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [running, setRunning] = useState(false);

    // Initial setup + engine creation
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

    // Local notifications: schedule end of current step
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

    // Foreground re-sync: pause+resume to re-align timers after background
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

    // Empty / error state
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
                    {/* Phase pill */}
                    <View
                        style={[st.phasePill, { backgroundColor: phaseColor }]}
                    >
                        <Text style={st.phasePillText}>{phaseLabel}</Text>
                    </View>

                    {/* Timer */}
                    <Text style={st.timer}>{remaining}</Text>

                    {/* Meta */}
                    <Text style={st.meta}>{meta}</Text>
                    {step.nextName ? (
                        <Text style={st.next}>Next: {step.nextName}</Text>
                    ) : null}

                    {/* Progress indicator */}
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
