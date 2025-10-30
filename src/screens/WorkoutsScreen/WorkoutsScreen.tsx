import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MainContainer } from '@components/layout/MainContainer';
import { useAllWorkouts, useWorkouts } from '@state/useWorkouts';
import ConfirmDialog from '@src/components/modals/ConfirmDialog';
import { WorkoutItem } from '@components/workouts/WorkoutItem';
import st from './styles';

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
        <MainContainer title="Workouts">
            <View style={st.container}>
                <View style={st.headerRow}>
                    <TextInput
                        value={q}
                        onChangeText={setQ}
                        placeholder="Search workouts"
                        placeholderTextColor="#6B7280"
                        style={st.search}
                    />
                    <Pressable
                        onPress={() => router.push('/workouts/edit')}
                        style={({ pressed }) => [
                            st.newBtn,
                            pressed && st.pressed,
                        ]}
                    >
                        <Text style={st.newBtnText}>＋ New</Text>
                    </Pressable>
                </View>

                <FlatList
                    data={data}
                    keyExtractor={(w) => w.id}
                    renderItem={({ item }) =>
                        item ? (
                            <WorkoutItem
                                item={item}
                                onPress={() =>
                                    router.push(`/workouts/${item.id}`)
                                }
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
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 8 }} />
                    )}
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
        </MainContainer>
    );
};

export default WorkoutsScreen;
