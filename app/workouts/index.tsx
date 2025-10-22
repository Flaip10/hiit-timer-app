import { useMemo, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAllWorkouts, useWorkouts } from '../../src/state/useWorkouts';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { isTimePace, isRepsPace } from '../../src/core/entities';

const summarize = (w: ReturnType<typeof useAllWorkouts>[number]) => {
    if (!w) return { blocks: 0, exercises: 0, hasReps: false, approxSec: 0 };

    let exercises = 0;
    let hasReps = false;
    let approxSec = 0;

    w.blocks.forEach((b) => {
        const L = b.exercises.length;
        exercises += L;

        const sets = Math.max(0, b.scheme.sets);
        const restSet = b.scheme.restBetweenSetsSec;
        const restEx = b.scheme.restBetweenExercisesSec;

        // Determine base pace for time estimation
        const baseTime = isTimePace(b.defaultPace) ? b.defaultPace.workSec : 0;

        // If any override introduces reps or if default is reps, we mark hasReps.
        if (isRepsPace(b.defaultPace)) hasReps = true;
        b.exercises.forEach((ex) => {
            if (ex.paceOverride) {
                if (isRepsPace(ex.paceOverride)) hasReps = true;
            }
        });

        // Rough time estimate only from timed parts
        const timedPerExercise = isTimePace(b.defaultPace) ? baseTime : 0;
        const timedPerSet = timedPerExercise * L + Math.max(0, L - 1) * restEx;
        const totalForBlock =
            sets * timedPerSet + Math.max(0, sets - 1) * restSet;

        approxSec += totalForBlock;
    });

    return {
        blocks: w.blocks.length,
        exercises,
        hasReps,
        approxSec,
    };
};

const fmtMins = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m${s ? ` ${s}s` : ''}` : `${s}s`;
};

const WorkoutItem = ({
    item,
    onPress,
    onEdit,
    onRemove,
}: {
    item: NonNullable<ReturnType<typeof useAllWorkouts>[number]>;
    onPress: () => void;
    onEdit: () => void;
    onRemove: () => void;
}) => {
    const sum = useMemo(() => summarize(item), [item]);

    const timeLabel =
        sum.approxSec > 0
            ? `~${fmtMins(sum.approxSec)}`
            : sum.hasReps
              ? 'mixed'
              : '—';

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [st.card, pressed && st.pressed]}
        >
            <View style={{ flex: 1 }}>
                <Text style={st.title}>{item.name}</Text>
                <Text style={st.sub}>
                    {sum.blocks} block{sum.blocks !== 1 ? 's' : ''} •{' '}
                    {sum.exercises} exercise{sum.exercises !== 1 ? 's' : ''} •{' '}
                    {timeLabel}
                </Text>
            </View>
            <View style={st.row}>
                <Pressable
                    onPress={onEdit}
                    style={({ pressed }) => [
                        st.smallBtn,
                        pressed && st.pressed,
                    ]}
                >
                    <Text style={st.smallBtnText}>Edit</Text>
                </Pressable>
                <Pressable
                    onPress={onRemove}
                    style={({ pressed }) => [
                        st.smallDanger,
                        pressed && st.pressed,
                    ]}
                >
                    <Text style={st.smallDangerText}>Remove</Text>
                </Pressable>
            </View>
        </Pressable>
    );
};

const WorkoutsScreen = () => {
    const router = useRouter();
    const list = useAllWorkouts();
    const { remove } = useWorkouts();

    const [q, setQ] = useState('');
    const [toRemove, setToRemove] = useState<string | null>(null);

    const data = useMemo(() => {
        const qq = q.trim().toLowerCase();
        if (!qq) return list;
        return list.filter((w) => w?.name.toLowerCase().includes(qq));
    }, [list, q]);

    return (
        <View style={st.container}>
            <View style={st.headerRow}>
                <TextInput
                    value={q}
                    onChangeText={setQ}
                    placeholder="Search workouts"
                    placeholderTextColor="#6B7280"
                    style={st.search}
                />
                <Link href="/workouts/edit" asChild>
                    <Pressable
                        style={({ pressed }) => [
                            st.newBtn,
                            pressed && st.pressed,
                        ]}
                    >
                        <Text style={st.newBtnText}>＋ New</Text>
                    </Pressable>
                </Link>
            </View>

            <FlatList
                data={data}
                keyExtractor={(w) => w.id}
                renderItem={({ item }) =>
                    item ? (
                        <WorkoutItem
                            item={item}
                            onPress={() => router.push(`/workouts/${item.id}`)}
                            onEdit={() =>
                                router.push({
                                    pathname: '/workouts/edit',
                                    params: { id: item.id },
                                })
                            }
                            onRemove={() => setToRemove(item.id)}
                        />
                    ) : null
                }
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                contentContainerStyle={{ paddingBottom: 24 }}
            />

            <ConfirmDialog
                visible={toRemove != null}
                title="Remove workout"
                message="This will permanently delete the workout."
                confirmLabel="Remove"
                cancelLabel="Cancel"
                destructive
                onConfirm={() => {
                    if (toRemove) remove(toRemove);
                    setToRemove(null);
                }}
                onCancel={() => setToRemove(null)}
            />
        </View>
    );
};

const st = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B0C', padding: 16 },
    headerRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    search: {
        flex: 1,
        backgroundColor: '#131316',
        color: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#1F1F23',
    },
    newBtn: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingHorizontal: 14,
        justifyContent: 'center',
    },
    newBtnText: { color: '#fff', fontWeight: '700' },

    card: {
        backgroundColor: '#111113',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1F1F23',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: { color: '#F2F2F2', fontWeight: '700', fontSize: 16 },
    sub: { color: '#A1A1AA', marginTop: 2 },

    row: { flexDirection: 'row', gap: 8 },
    smallBtn: {
        backgroundColor: '#1C1C1F',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    smallBtnText: { color: '#E5E7EB', fontWeight: '700' },
    smallDanger: {
        backgroundColor: '#2A0E0E',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#7F1D1D',
    },
    smallDangerText: { color: '#FCA5A5', fontWeight: '700' },

    pressed: { opacity: 0.9 },
});

export default WorkoutsScreen;
