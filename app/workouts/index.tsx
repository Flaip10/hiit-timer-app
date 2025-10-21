import { useMemo, useState } from 'react';
import {
    FlatList,
    Pressable,
    Text,
    TextInput,
    View,
    StyleSheet,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import type { Workout } from '../../src/core/entities';
import { WorkoutCard } from '../../src/components/WorkoutCard';

const MOCK: Workout[] = [
    {
        id: 'w1',
        name: 'Lower Body A',
        blocks: [
            {
                id: 'b1',
                title: 'Main',
                restBetweenExercisesSec: 45,
                exercises: [
                    {
                        id: 'e1',
                        name: 'Goblet Squat',
                        pace: { type: 'reps', reps: 10 },
                        setScheme: { sets: 3, restBetweenSetsSec: 60 },
                    },
                    {
                        id: 'e2',
                        name: 'RDL',
                        pace: { type: 'reps', reps: 8 },
                        setScheme: { sets: 3, restBetweenSetsSec: 75 },
                    },
                ],
            },
        ],
    },
    {
        id: 'w2',
        name: 'HIIT 10-20',
        blocks: [
            {
                id: 'b1',
                restBetweenExercisesSec: 15,
                exercises: [
                    {
                        id: 'e1',
                        name: 'Jump Rope',
                        pace: { type: 'time', workSec: 20 },
                        setScheme: { sets: 8, restBetweenSetsSec: 10 },
                    },
                    {
                        id: 'e2',
                        name: 'Rest',
                        pace: { type: 'time', workSec: 10 },
                        setScheme: { sets: 8, restBetweenSetsSec: 0 },
                    },
                ],
            },
        ],
    },
];

const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

// naive ETA: sum time-based work/rest; ignore reps (shown as “~”)
const estimateDurationSec = (w: Workout) => {
    let sec = 0;
    w.blocks.forEach((b) => {
        b.exercises.forEach((ex) => {
            if (ex.pace.type === 'time')
                sec +=
                    ex.pace.workSec * ex.setScheme.sets +
                    ex.setScheme.restBetweenSetsSec * (ex.setScheme.sets - 1);
            // inter-exercise rest
        });
        const transitions = Math.max(0, b.exercises.length - 1);
        sec += transitions * b.restBetweenExercisesSec;
    });
    return sec;
};

const WorkoutsScreen = () => {
    const router = useRouter();
    const [q, setQ] = useState('');

    const data = useMemo(
        () =>
            MOCK.filter((w) =>
                w.name.toLowerCase().includes(q.trim().toLowerCase())
            ),
        [q]
    );

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
                onPress={() => router.push(`/run/${item.id}`)}
                onMore={() =>
                    router.push({
                        pathname: '/workouts/edit',
                        params: { id: item.id },
                    })
                }
            />
        );
    };

    return (
        <View style={s.container}>
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
