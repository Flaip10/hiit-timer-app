import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useWorkout } from '../../src/state/useWorkouts';
import { buildSteps, createTimer, Phase } from '../../src/core/timer';
import { cancelAll, cancelById, scheduleLocal } from '../../src/core/notify';
import { MainContainer } from '../../src/components/layout/MainContainer';

const colorFor = (p: Phase): string =>
    p === 'WORK' ? '#22C55E' : p === 'REST' ? '#60A5FA' : '#F59E0B';

const RunScreen = () => {
    useKeepAwake();

    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const workout = useWorkout(id);

    const { steps } = useMemo(() => {
        if (!workout)
            return { steps: [] as ReturnType<typeof buildSteps>['steps'] };
        return buildSteps(5, workout.blocks);
    }, [workout]);

    const engRef = useRef<ReturnType<typeof createTimer> | null>(null);
    const lastNotifIdRef = useRef<string | null>(null);
    const [idx, setIdx] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [running, setRunning] = useState(false);

    // Initialize timer
    useEffect(() => {
        const setup = async () => {
            await cancelAll();
        };
        void setup();

        if (steps.length === 0) return;

        engRef.current = createTimer(steps, (t) => {
            setIdx(t.stepIndex);
            setRemaining(t.remainingSec);
            setRunning(t.running);
        });

        setIdx(0);
        setRemaining(steps[0]?.durationSec ?? 0);
        setRunning(false);

        return () => {
            engRef.current?.stop();
            void cancelAll();
        };
    }, [steps]);

    // Schedule notification for step end
    useEffect(() => {
        const schedule = async () => {
            // cancel previous pending
            if (lastNotifIdRef.current) {
                await cancelById(lastNotifIdRef.current).catch(() => {});
                lastNotifIdRef.current = null;
            }

            if (!running) return;

            const step = steps[idx];
            if (!step || remaining <= 0) return;

            const title =
                step.label === 'WORK'
                    ? 'Work done'
                    : step.label === 'REST'
                      ? 'Rest done'
                      : 'Prep done';

            const next = steps[idx + 1];
            const body = next
                ? `Next: ${next.label}${
                      next.nextName ? ` • ${next.nextName}` : ''
                  }`
                : 'Workout finished';

            const id = await scheduleLocal(remaining, title, body);
            lastNotifIdRef.current = id;
        };
        void schedule();
    }, [idx, running, remaining, steps]);

    // Resync when returning to foreground
    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                const eng = engRef.current;
                if (!eng) return;
                if (eng.isRunning()) {
                    eng.pause();
                    eng.resume();
                }
            }
        });
        return () => sub.remove();
    }, []);

    if (!workout || steps.length === 0) {
        return (
            <View style={s.container}>
                <Text style={s.title}>No steps to run</Text>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [s.btn, pressed && s.pressed]}
                >
                    <Text style={s.btnText}>Back</Text>
                </Pressable>
            </View>
        );
    }

    const step = steps[idx];
    const phase = step.label;
    const meta = `Block ${step.blockIdx + 1} • Ex ${step.exIdx + 1} • Set ${
        step.setIdx + 1
    }`;

    const onStart = () => engRef.current?.start();
    const onPause = () => {
        engRef.current?.pause();
        if (lastNotifIdRef.current) {
            void cancelById(lastNotifIdRef.current);
            lastNotifIdRef.current = null;
        }
    };
    const onResume = () => engRef.current?.resume();
    const onSkip = () => engRef.current?.skip();
    const onPlus30 = () => engRef.current?.addSeconds(30);
    const onEnd = () => {
        engRef.current?.stop();
        if (lastNotifIdRef.current) {
            void cancelById(lastNotifIdRef.current);
            lastNotifIdRef.current = null;
        }
        void cancelAll();
        router.back();
    };

    return (
        <MainContainer title={phase}>
            <View style={s.container}>
                <Text style={[s.phase, { color: colorFor(phase) }]}>
                    {phase}
                </Text>
                <Text style={s.timer}>{remaining}</Text>
                <Text style={s.meta}>{meta}</Text>
                {step.nextName ? (
                    <Text style={s.next}>Next: {step.nextName}</Text>
                ) : null}

                <View style={s.controls}>
                    {!running ? (
                        <Pressable
                            onPress={
                                remaining === step.durationSec
                                    ? onStart
                                    : onResume
                            }
                            style={({ pressed }) => [
                                s.primary,
                                pressed && s.pressed,
                            ]}
                        >
                            <Text style={s.primaryText}>
                                {remaining === step.durationSec
                                    ? 'Start'
                                    : 'Resume'}
                            </Text>
                        </Pressable>
                    ) : (
                        <Pressable
                            onPress={onPause}
                            style={({ pressed }) => [
                                s.primary,
                                pressed && s.pressed,
                            ]}
                        >
                            <Text style={s.primaryText}>Pause</Text>
                        </Pressable>
                    )}

                    <View style={s.row}>
                        <Pressable
                            onPress={onSkip}
                            style={({ pressed }) => [
                                s.secondary,
                                pressed && s.pressed,
                            ]}
                        >
                            <Text style={s.secondaryText}>Skip</Text>
                        </Pressable>
                        <Pressable
                            onPress={onPlus30}
                            style={({ pressed }) => [
                                s.secondary,
                                pressed && s.pressed,
                            ]}
                        >
                            <Text style={s.secondaryText}>+30s</Text>
                        </Pressable>
                        <Pressable
                            onPress={onEnd}
                            style={({ pressed }) => [
                                s.secondary,
                                pressed && s.pressed,
                            ]}
                        >
                            <Text style={s.secondaryText}>End</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </MainContainer>
    );
};

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0B0C',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    title: { color: '#F2F2F2', fontSize: 24, fontWeight: '700' },
    phase: { fontSize: 18, fontWeight: '700' },
    timer: { color: '#F2F2F2', fontSize: 96, fontVariant: ['tabular-nums'] },
    meta: { color: '#A1A1AA', marginTop: 6 },
    next: { color: '#9CA3AF', marginTop: 4 },
    controls: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 24,
        gap: 12,
    },
    row: { flexDirection: 'row', gap: 8 },
    primary: {
        backgroundColor: '#2563EB',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    secondary: {
        flex: 1,
        backgroundColor: '#1C1C1F',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    secondaryText: { color: '#E5E7EB', fontWeight: '700' },
    btn: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 12,
    },
    btnText: { color: '#fff', fontWeight: '700' },
    pressed: { opacity: 0.9 },
});

export default RunScreen;
