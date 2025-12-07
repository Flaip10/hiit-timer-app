import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { useAllWorkouts, useWorkouts } from '@state/useWorkouts';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { WorkoutItem } from '@components/workouts/WorkoutItem';
import { importWorkoutFromFile } from '@src/core/importWorkout/importWorkout';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';
import NewWorkoutModal from './components/NewWorkoutModal';

import { AppText } from '@src/components/ui/Typography/AppText';
import { Button } from '@src/components/ui/Button/Button';
import { useWorkoutsScreenStyles } from './WorkoutsScreen.styles';
import { SearchField } from '@src/components/ui/SearchField/SearchField';

const EmptyWorkouts = ({ onPressButton }: { onPressButton: () => void }) => {
    const st = useWorkoutsScreenStyles();

    return (
        <View style={st.emptyContainer}>
            <AppText variant="title2">No workouts yet</AppText>

            <AppText
                variant="bodySmall"
                tone="secondary"
                style={st.emptyDescription}
            >
                Create your first workout to get started.
            </AppText>

            <Button
                title="＋ Create workout"
                variant="primary"
                onPress={onPressButton}
                style={st.emptyButton}
            />
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

    const st = useWorkoutsScreenStyles();

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
        <MainContainer title="Workouts" scroll={false} noPadding>
            <FlatList
                data={data}
                keyExtractor={(w) => w.id}
                style={st.list}
                contentContainerStyle={st.listContent}
                ListHeaderComponent={
                    <View style={st.headerRow}>
                        <SearchField
                            value={q}
                            onChangeText={setQ}
                            fullWidth
                            placeholder="Search workouts"
                        />

                        <Button
                            title="＋ New"
                            variant="primary"
                            onPress={() => setModalVisible(true)}
                            style={st.newButton}
                        />

                        <AppearingView visible={!!importError}>
                            <ErrorBanner
                                message={importError ?? ''}
                                onClose={() => setImportError(null)}
                            />
                        </AppearingView>
                    </View>
                }
                stickyHeaderIndices={[0]} // make headerRow stick to the top
                renderItem={({ item }) =>
                    item ? (
                        <WorkoutItem
                            item={item}
                            onPress={() => router.push(`/workouts/${item.id}`)}
                            onRemove={() => setToRemove(item.id)}
                        />
                    ) : null
                }
                ListEmptyComponent={
                    <EmptyWorkouts
                        onPressButton={() => setModalVisible(true)}
                    />
                }
                keyboardShouldPersistTaps="handled"
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
