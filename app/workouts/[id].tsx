import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkout, useWorkouts } from '../../src/state/useWorkouts';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';

const fmt = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const WorkoutDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const workout = useWorkout(id);
    const { remove } = useWorkouts();

    const [confirm, setConfirm] = useState(false);

    const summary = useMemo(() => {
        if (!workout) return { blocks: 0, timeSec: 0 };
        let total = 0;
        workout.blocks.forEach((b) => {
            b.exercises.forEach((ex) => {
                if (ex.pace.type === 'time') {
                    total += ex.pace.workSec * ex.setScheme.sets;
                    total +=
                        ex.setScheme.restBetweenSetsSec *
                        Math.max(0, ex.setScheme.sets - 1);
                }
            });
            total +=
                Math.max(0, b.exercises.length - 1) * b.restBetweenExercisesSec;
        });
        return { blocks: workout.blocks.length, timeSec: total };
    }, [workout]);

    if (!workout) {
        return (
            <View style={s.container}>
                <Text style={s.title}>Workout not found</Text>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [s.secondary, pressed && s.pressed]}
                >
                    <Text style={s.secondaryText}>Back</Text>
                </Pressable>
            </View>
        );
    }

    const onBegin = () =>
        router.push({ pathname: `/run/${workout.id}`, params: { prep: '5' } });
    const onEdit = () =>
        router.push({ pathname: '/workouts/edit', params: { id: workout.id } });
    const onRemove = () => setConfirm(true);
    const onConfirmRemove = () => {
        remove(workout.id);
        setConfirm(false);
        router.replace('/workouts');
    };

    return (
        <View style={s.container}>
            <ScrollView contentContainerStyle={s.scroll}>
                <Text style={s.title}>{workout.name}</Text>
                <Text style={s.meta}>
                    {summary.blocks} block{summary.blocks !== 1 ? 's' : ''} • ~
                    {fmt(summary.timeSec)}
                </Text>

                <View style={s.section}>
                    <Text style={s.sectionTitle}>Plan</Text>
                    {workout.blocks.length === 0 ? (
                        <Text style={s.empty}>No blocks yet.</Text>
                    ) : (
                        workout.blocks.map((b, bi) => (
                            <View key={b.id} style={s.block}>
                                <Text style={s.blockTitle}>
                                    Block {bi + 1}
                                    {b.title ? ` — ${b.title}` : ''}
                                </Text>
                                {b.exercises.map((ex, ei) => (
                                    <View key={ex.id} style={s.row}>
                                        <Text style={s.exName}>{ex.name}</Text>
                                        {ex.pace.type === 'time' ? (
                                            <Text style={s.exMeta}>
                                                {ex.setScheme.sets} ×{' '}
                                                {ex.pace.workSec}s
                                                {ex.setScheme
                                                    .restBetweenSetsSec > 0
                                                    ? ` • rest ${ex.setScheme.restBetweenSetsSec}s`
                                                    : ''}
                                            </Text>
                                        ) : (
                                            <Text style={s.exMeta}>
                                                {ex.setScheme.sets} ×{' '}
                                                {ex.pace.reps} reps
                                                {ex.setScheme
                                                    .restBetweenSetsSec > 0
                                                    ? ` • rest ${ex.setScheme.restBetweenSetsSec}s`
                                                    : ''}
                                            </Text>
                                        )}
                                    </View>
                                ))}
                                {b.restBetweenExercisesSec > 0 && (
                                    <Text style={s.blockFoot}>
                                        Rest between exercises:{' '}
                                        {b.restBetweenExercisesSec}s
                                    </Text>
                                )}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            <View style={s.actions}>
                <Pressable
                    onPress={onEdit}
                    style={({ pressed }) => [s.secondary, pressed && s.pressed]}
                >
                    <Text style={s.secondaryText}>Edit</Text>
                </Pressable>
                <Pressable
                    onPress={onRemove}
                    style={({ pressed }) => [s.danger, pressed && s.pressed]}
                >
                    <Text style={s.dangerText}>Remove</Text>
                </Pressable>
                <Pressable
                    onPress={onBegin}
                    style={({ pressed }) => [s.primary, pressed && s.pressed]}
                >
                    <Text style={s.primaryText}>Begin</Text>
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

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B0C' },
    scroll: { padding: 16, paddingBottom: 120, gap: 8 },
    title: { color: '#F2F2F2', fontSize: 24, fontWeight: '700' },
    meta: { color: '#A1A1AA', marginBottom: 8 },
    section: { marginTop: 8, gap: 8 },
    sectionTitle: { color: '#E5E7EB', fontWeight: '700', fontSize: 16 },
    empty: { color: '#A1A1AA' },
    block: {
        backgroundColor: '#131316',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1F1F23',
        padding: 12,
        gap: 6,
    },
    blockTitle: { color: '#E5E7EB', fontWeight: '700' },
    blockFoot: { color: '#9CA3AF', marginTop: 2 },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    exName: { color: '#F2F2F2', fontWeight: '600' },
    exMeta: { color: '#A1A1AA' },

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
