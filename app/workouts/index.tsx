import { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import type { Workout } from '../../src/core/entities';
import { WorkoutCard } from '../../src/components/WorkoutCard';
import { useAllWorkouts, useWorkouts } from '../../src/state/useWorkouts';
import { ensureSeed } from '../../src/state/seed';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';

const formatMinSec = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const estimateDurationSec = (w: Workout): number => {
    let sec = 0;
    w.blocks.forEach((b) => {
        b.exercises.forEach((ex) => {
            if (ex.pace.type === 'time')
                sec +=
                    ex.pace.workSec * ex.setScheme.sets +
                    ex.setScheme.restBetweenSetsSec * (ex.setScheme.sets - 1);
        });
        const transitions = Math.max(0, b.exercises.length - 1);
        sec += transitions * b.restBetweenExercisesSec;
    });
    return sec;
};

const WorkoutsScreen = () => {
    const router = useRouter();
    const list = useAllWorkouts();
    const { remove } = useWorkouts();

    const [q, setQ] = useState('');
    const [confirm, setConfirm] = useState<{ id: string; name: string } | null>(
        null
    );

    useEffect(() => {
        ensureSeed();
    }, []);

    const data = useMemo(
        () =>
            list.filter((w) =>
                w.name.toLowerCase().includes(q.trim().toLowerCase())
            ),
        [list, q]
    );

    const onRemove = (id: string, name: string) => setConfirm({ id, name });
    const onConfirmRemove = () => {
        if (confirm) remove(confirm.id);
        setConfirm(null);
    };

    const renderItem = ({ item }: { item: Workout }) => {
        const est = estimateDurationSec(item);
        const subtitle =
            est > 0
                ? `~${formatMinSec(est)} • ${item.blocks.length} block${item.blocks.length > 1 ? 's' : ''}`
                : `${item.blocks.length} block(s)`;

        return (
            <WorkoutCard
                title={item.name}
                subtitle={subtitle}
                onPress={() => router.push(`/workouts/${item.id}`)}
                onEdit={() =>
                    router.push({
                        pathname: '/workouts/edit',
                        params: { id: item.id },
                    })
                }
                onRemove={() => onRemove(item.id, item.name)}
            />
        );
    };

    return (
        <View style={s.container}>
            {/* header + search + list (unchanged) */}
            <Text style={s.h1}>Workouts</Text>
            <View style={s.searchRow}>
                <TextInput
                    placeholder="Search workouts"
                    placeholderTextColor="#6B7280"
                    value={q}
                    onChangeText={setQ}
                    style={s.search}
                />
                <Link href="/workouts/edit" asChild>
                    <Pressable
                        style={({ pressed }) => [
                            s.newBtn,
                            pressed && { opacity: 0.9 },
                        ]}
                    >
                        <Text style={s.newBtnText}>＋ New</Text>
                    </Pressable>
                </Link>
            </View>

            <FlatList
                data={data}
                keyExtractor={(w) => w.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
                ListEmptyComponent={
                    <Text style={s.empty}>No workouts yet</Text>
                }
            />

            <ConfirmDialog
                visible={!!confirm}
                title="Remove workout"
                message={
                    confirm
                        ? `Are you sure you want to remove “${confirm.name}”?`
                        : undefined
                }
                confirmLabel="Remove"
                cancelLabel="Cancel"
                destructive
                onConfirm={onConfirmRemove}
                onCancel={() => setConfirm(null)}
            />
        </View>
    );
};

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B0C', padding: 16 },
    h1: { color: '#F2F2F2', fontSize: 24, fontWeight: '700', marginBottom: 8 },
    searchRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        marginBottom: 8,
    },
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
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    newBtnText: { color: '#fff', fontWeight: '700' },
    empty: { color: '#A1A1AA', marginTop: 24, textAlign: 'center' },
});

export default WorkoutsScreen;
