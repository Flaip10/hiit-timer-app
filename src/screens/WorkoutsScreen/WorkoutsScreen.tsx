import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MainContainer } from '@components/layout/MainContainer';
import { useAllWorkouts, useWorkouts } from '@state/useWorkouts';
import ConfirmDialog from '@src/components/modals/ConfirmDialog';
import { WorkoutItem } from '@components/workouts/WorkoutItem';
import st from './styles';
import { importWorkoutFromFile } from '@src/core/importWorkout/importWorkout';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';
import NewWorkoutModal from './components/NewWorkoutModal';

const EmptyWorkouts = () => {
    const router = useRouter();

    return (
        <View style={st.emptyContainer}>
            <Text style={st.emptyText}>No workouts yet</Text>
            <Pressable
                onPress={() => router.push('/workouts/edit')}
                style={({ pressed }) => [st.newBtn, pressed && st.pressed]}
            >
                <Text style={st.newBtnText}>＋ Create your first workout</Text>
            </Pressable>
        </View>
    );
};

const WorkoutsScreen = () => {
    const router = useRouter();
    const list = useAllWorkouts();
    const { remove, startDraftFromImported } = useWorkouts();

    const [q, setQ] = useState('');
    const [toRemove, setToRemove] = useState<string | null>(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);

    const data = useMemo(() => {
        const qq = q.trim().toLowerCase();
        if (!qq) return list;
        return list.filter((w) => w?.name.toLowerCase().includes(qq));
    }, [list, q]);

    const closeModal = () => {
        setModalVisible(false);
    };

    const handleImportFromFile = async () => {
        if (importing) return;
        setImportError(null);
        setImporting(true);

        try {
            const result = await importWorkoutFromFile();

            if (!result.ok) {
                // ignore silent cancel
                if (result.error === 'CANCELLED') return;

                if (result.error === 'INVALID_KIND') {
                    setImportError(
                        'That file is not a HIIT Timer workout (.hitw).'
                    );
                } else if (result.error === 'PARSE_FAILED') {
                    setImportError('The file is corrupted or not valid JSON.');
                } else if (result.error === 'READ_FAILED') {
                    setImportError('Could not read the selected file.');
                }
                return;
            }

            // ok === true → we have a Workout
            startDraftFromImported(result.workout);

            router.push({
                pathname: '/workouts/edit',
                params: { fromImport: '1' },
            });
        } catch (err) {
            console.warn('Import failed (unexpected)', err);
            setImportError('Import failed due to an unexpected error.');
            closeModal();
        } finally {
            setImporting(false);
            closeModal();
        }
    };

    return (
        <MainContainer title="Workouts" scroll={false}>
            <View style={st.headerRow}>
                <TextInput
                    value={q}
                    onChangeText={setQ}
                    placeholder="Search workouts"
                    placeholderTextColor="#6B7280"
                    style={st.search}
                />
                <Pressable
                    onPress={() => {
                        setModalVisible(true);
                    }}
                    style={({ pressed }) => [st.newBtn, pressed && st.pressed]}
                >
                    <Text style={st.newBtnText}>＋ New</Text>
                </Pressable>
            </View>

            <AppearingView visible={!!importError}>
                <ErrorBanner
                    message={importError ?? ''}
                    onClose={() => setImportError(null)}
                />
            </AppearingView>

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
                ListEmptyComponent={EmptyWorkouts}
            />

            <NewWorkoutModal
                visible={modalVisible}
                closeModal={closeModal}
                handleImportFromFile={handleImportFromFile}
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
        </MainContainer>
    );
};

export default WorkoutsScreen;
