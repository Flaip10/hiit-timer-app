import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkout, useWorkouts } from '../../src/state/useWorkouts';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { isTimePace, isRepsPace, type Pace } from '../../src/core/entities';

const fmt = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m${s ? ` ${s}s` : ''}` : `${s}s`;
};

const describePace = (p: Pace) =>
    isTimePace(p)
        ? `${p.workSec}s`
        : `${p.reps} reps${p.tempo ? ` @ ${p.tempo}` : ''}`;

const WorkoutDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const workout = useWorkout(id);
    const { remove } = useWorkouts();

    const [confirm, setConfirm] = useState(false);

    const summary = useMemo(() => {
        if (!workout)
            return { blocks: 0, exercises: 0, approxSec: 0, hasReps: false };
        let exercises = 0;
        let approxSec = 0;
        let hasReps = false;

        workout.blocks.forEach((b) => {
            const L = b.exercises.length;
            exercises += L;

            const sets = Math.max(0, b.scheme.sets);
            const restSet = b.scheme.restBetweenSetsSec;
            const restEx = b.scheme.restBetweenExercisesSec;

            if (isRepsPace(b.defaultPace)) hasReps = true;
            b.exercises.forEach((ex) => {
                if (ex.paceOverride && isRepsPace(ex.paceOverride))
                    hasReps = true;
            });

            const baseTime = isTimePace(b.defaultPace)
                ? b.defaultPace.workSec
                : 0;
            const timedPerSet = baseTime * L + Math.max(0, L - 1) * restEx;
            approxSec += sets * timedPerSet + Math.max(0, sets - 1) * restSet;
        });

        return { blocks: workout.blocks.length, exercises, approxSec, hasReps };
    }, [workout]);

    if (!workout) {
        return (
            <View style={st.container}>
                <Text style={st.title}>Workout not found</Text>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [
                        st.secondary,
                        pressed && st.pressed,
                    ]}
                >
                    <Text style={st.secondaryText}>Back</Text>
                </Pressable>
            </View>
        );
    }

    const onBegin = () =>
        router.push({ pathname: `/run/${workout.id}`, params: { prep: '5' } });
    const onEdit = () =>
        router.push({ pathname: '/workouts/edit', params: { id: workout.id } });
    const onConfirmRemove = () => {
        remove(workout.id);
        setConfirm(false);
        router.replace('/workouts');
    };

    return (
        <View style={st.container}>
            <ScrollView contentContainerStyle={st.scroll}>
                <Text style={st.title}>{workout.name}</Text>
                <Text style={st.meta}>
                    {summary.blocks} block{summary.blocks !== 1 ? 's' : ''} •{' '}
                    {summary.exercises} exercise
                    {summary.exercises !== 1 ? 's' : ''} •{' '}
                    {summary.approxSec > 0
                        ? `~${fmt(summary.approxSec)}`
                        : summary.hasReps
                          ? 'mixed'
                          : '—'}
                </Text>

                {workout.blocks.map((b, bi) => (
                    <View key={b.id} style={st.block}>
                        <Text style={st.blockTitle}>
                            Block {bi + 1}
                            {b.title ? ` — ${b.title}` : ''}
                        </Text>

                        <Text style={st.line}>
                            Sets: <Text style={st.mono}>{b.scheme.sets}</Text>
                        </Text>
                        <Text style={st.line}>
                            # Exercises:{' '}
                            <Text style={st.mono}>{b.exercises.length}</Text>
                        </Text>
                        <Text style={st.line}>
                            Rest between sets:{' '}
                            <Text style={st.mono}>
                                {fmt(b.scheme.restBetweenSetsSec)}
                            </Text>
                        </Text>
                        <Text style={st.line}>
                            Rest between exercises:{' '}
                            <Text style={st.mono}>
                                {fmt(b.scheme.restBetweenExercisesSec)}
                            </Text>
                        </Text>

                        <Text style={st.line}>
                            Default type:{' '}
                            <Text style={st.mono}>
                                {isTimePace(b.defaultPace) ? 'Time' : 'Reps'}
                            </Text>{' '}
                            <Text style={st.mono}>
                                ({describePace(b.defaultPace)})
                            </Text>
                        </Text>

                        <View style={{ height: 8 }} />
                        <Text style={st.section}>Exercises</Text>
                        {b.exercises.length === 0 ? (
                            <Text style={st.dim}>—</Text>
                        ) : (
                            b.exercises.map((ex, ei) => {
                                const ov = ex.paceOverride;
                                const ovText = ov
                                    ? ` • override: ${isTimePace(ov) ? 'Time' : 'Reps'} (${describePace(ov)})`
                                    : '';
                                return (
                                    <Text key={ex.id} style={st.line}>
                                        {ei + 1}. {ex.name}
                                        {b.advanced && ovText ? (
                                            <Text style={st.dim}>{ovText}</Text>
                                        ) : null}
                                    </Text>
                                );
                            })
                        )}
                    </View>
                ))}
            </ScrollView>

            <View style={st.actions}>
                <Pressable
                    onPress={onEdit}
                    style={({ pressed }) => [
                        st.secondary,
                        pressed && st.pressed,
                    ]}
                >
                    <Text style={st.secondaryText}>Edit</Text>
                </Pressable>
                <Pressable
                    onPress={() => setConfirm(true)}
                    style={({ pressed }) => [st.danger, pressed && st.pressed]}
                >
                    <Text style={st.dangerText}>Remove</Text>
                </Pressable>
                <Pressable
                    onPress={onBegin}
                    style={({ pressed }) => [st.primary, pressed && st.pressed]}
                >
                    <Text style={st.primaryText}>Begin</Text>
                </Pressable>
            </View>

            <ConfirmDialog
                visible={confirm}
                title="Remove workout"
                message={`Are you sure you want to remove “${workout.name}”?`}
                confirmLabel="Remove"
                cancelLabel="Cancel"
                destructive
                onConfirm={onConfirmRemove}
                onCancel={() => setConfirm(false)}
            />
        </View>
    );
};

const st = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B0C' },
    scroll: { padding: 16, paddingBottom: 120, gap: 12 },
    title: { color: '#F2F2F2', fontSize: 24, fontWeight: '700' },
    meta: { color: '#A1A1AA', marginBottom: 8 },

    block: {
        backgroundColor: '#111113',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1F1F23',
        padding: 12,
        gap: 6,
    },
    blockTitle: { color: '#E5E7EB', fontWeight: '700', fontSize: 16 },

    line: { color: '#E5E7EB' },
    dim: { color: '#9CA3AF' },
    section: { color: '#E5E7EB', fontWeight: '700', marginTop: 4 },
    mono: { fontVariant: ['tabular-nums'], color: '#E5E7EB' },

    actions: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 16,
        flexDirection: 'row',
        gap: 8,
    },
    primary: {
        flex: 1.2,
        backgroundColor: '#2563EB',
        borderRadius: 12,
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
    danger: {
        flex: 1,
        backgroundColor: '#3B0D0D',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#7F1D1D',
    },
    dangerText: { color: '#FCA5A5', fontWeight: '700' },
    pressed: { opacity: 0.9 },
});

export default WorkoutDetails;
