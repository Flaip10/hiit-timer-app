import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';

import { useWorkout } from '@state/useWorkouts';
import { buildSteps, createTimer, type Phase } from '@core/timer';
import { cancelAll, cancelById, scheduleLocal } from '@core/notify';
import { MainContainer } from '@src/components/layout/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { Button } from '@src/components/ui/Button/Button';
import st from './styles';

const colorFor = (phase: Phase): string => {
    if (phase === 'WORK') return '#22C55E';
    if (phase === 'REST') return '#60A5FA';
    return '#F59E0B'; // PREP or anything else
};

const WorkoutRunScreen = () => {
    useKeepAwake();

    const { id } = useLocalSearchParams<{ id?: string }>();
    const router = useRouter();
    const workout = useWorkout(id);

    const { steps } = useMemo(() => {
        if (!workout) {
            return { steps: [] as ReturnType<typeof buildSteps>['steps'] };
        }
        // TODO: allow rounds to be configurable instead of hardcoded 5
        return buildSteps(5, workout.blocks);
    }, [workout]);

    const engineRef = useRef<ReturnType<typeof createTimer> | null>(null);
    const lastNotifIdRef = useRef<string | null>(null);

    const [stepIndex, setStepIndex] = useState(0);
    const [remainingSec, setRemainingSec] = useState(0);
    const [running, setRunning] = useState(false);

    // ---- init timer on steps change ----
    useEffect(() => {
        const setup = async () => {
            await cancelAll();
        };
        void setup();

        if (steps.length === 0) return;

        engineRef.current = createTimer(steps, (t) => {
            setStepIndex(t.stepIndex);
            setRemainingSec(t.remainingSec);
            setRunning(t.running);
        });

        setStepIndex(0);
        setRemainingSec(steps[0]?.durationSec ?? 0);
        setRunning(false);

        return () => {
            engineRef.current?.stop();
            void cancelAll();
        };
    }, [steps]);

    // ---- schedule / reschedule local notification for current step ----
    useEffect(() => {
        const schedule = async () => {
            // clear previous pending notification
            if (lastNotifIdRef.current) {
                await cancelById(lastNotifIdRef.current).catch(() => {});
                lastNotifIdRef.current = null;
            }

            if (!running) return;

            const step = steps[stepIndex];
            if (!step || remainingSec <= 0) return;

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

            const id = await scheduleLocal(remainingSec, title, body);
            lastNotifIdRef.current = id;
        };

        void schedule();
    }, [stepIndex, remainingSec, running, steps]);

    // ---- resync when app returns to foreground ----
    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                const engine = engineRef.current;
                if (!engine) return;
                if (engine.isRunning()) {
                    // small "jog" to force re-sync
                    engine.pause();
                    engine.resume();
                }
            }
        });

        return () => sub.remove();
    }, []);

    // ---- early exit: no workout / no steps ----
    if (!workout || steps.length === 0) {
        return (
            <>
                <MainContainer title="Run Workout" scroll={false}>
                    <View style={st.emptyContainer}>
                        <Text style={st.emptyTitle}>No steps to run</Text>
                        <Text style={st.emptyText}>
                            This workout has no timed blocks configured.
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
    const phase = step.label;
    const phaseColor = colorFor(phase);

    const meta = `Block ${step.blockIdx + 1} • Ex ${step.exIdx + 1} • Set ${
        step.setIdx + 1
    }`;

    const onStart = () => engineRef.current?.start();

    const onPause = () => {
        engineRef.current?.pause();
        if (lastNotifIdRef.current) {
            void cancelById(lastNotifIdRef.current);
            lastNotifIdRef.current = null;
        }
    };

    const onResume = () => engineRef.current?.resume();

    const onSkip = () => engineRef.current?.skip();

    const onPlus30 = () => engineRef.current?.addSeconds(30);

    const onEnd = () => {
        engineRef.current?.stop();
        if (lastNotifIdRef.current) {
            void cancelById(lastNotifIdRef.current);
            lastNotifIdRef.current = null;
        }
        void cancelAll();
        router.back();
    };

    const isAtStepStart = remainingSec === step.durationSec;
    const primaryLabel = !running
        ? isAtStepStart
            ? 'Start'
            : 'Resume'
        : 'Pause';
    const primaryHandler = !running
        ? isAtStepStart
            ? onStart
            : onResume
        : onPause;

    return (
        <>
            <MainContainer title={workout.name} scroll={false}>
                <View style={st.runContainer}>
                    <Text style={[st.phase, { color: phaseColor }]}>
                        {phase}
                    </Text>
                    <Text style={st.timer}>{remainingSec}</Text>
                    <Text style={st.meta}>{meta}</Text>

                    {step.nextName ? (
                        <Text style={st.next}>Next: {step.nextName}</Text>
                    ) : null}
                </View>
            </MainContainer>

            <FooterBar>
                <Button
                    title={primaryLabel}
                    variant="primary"
                    onPress={primaryHandler}
                    flex={1}
                />
                <Button
                    title="Skip"
                    variant="secondary"
                    onPress={onSkip}
                    flex={1}
                />
                <Button
                    title="+30s"
                    variant="secondary"
                    onPress={onPlus30}
                    flex={1}
                />
                <Button
                    title="End"
                    variant="secondary"
                    onPress={onEnd}
                    flex={1}
                />
            </FooterBar>
        </>
    );
};

export default WorkoutRunScreen;
