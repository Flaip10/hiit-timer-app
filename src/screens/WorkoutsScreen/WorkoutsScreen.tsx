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
import { useTranslation } from 'react-i18next';

interface ImportErrorTranslationMap {
    INVALID_EXTENSION: 'workouts.import.errors.invalidExtension';
    INVALID_KIND: 'workouts.import.errors.invalidKind';
    INVALID_SHAPE: 'workouts.import.errors.invalidShape';
    PARSE_FAILED: 'workouts.import.errors.parseFailed';
    READ_FAILED: 'workouts.import.errors.readFailed';
}

const EmptyWorkouts = ({ onPressButton }: { onPressButton: () => void }) => {
    const st = useWorkoutsScreenStyles();
    const { t } = useTranslation();

    return (
        <View style={st.emptyContainer}>
            <AppText variant="title3">{t('workouts.emptyTitle')}</AppText>

            <AppText
                variant="bodySmall"
                tone="secondary"
                style={st.emptyDescription}
            >
                {t('workouts.emptyDescription')}
            </AppText>

            <Button
                title={t('workouts.createButton')}
                variant="primary"
                onPress={onPressButton}
                style={st.emptyButton}
            />
        </View>
    );
};

const WorkoutsScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const list = useAllWorkouts();
    const { remove, startDraftFromImported, toggleFavorite } = useWorkouts();

    const [search, setSearch] = useState('');
    const [toRemove, setToRemove] = useState<string | null>(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);

    const st = useWorkoutsScreenStyles();

    const data = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();
        if (!searchTerm) return list;
        return list.filter((w) => w.name.toLowerCase().includes(searchTerm));
    }, [list, search]);

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

                const messageByError: Record<
                    Exclude<typeof result.error, 'CANCELLED'>,
                    ImportErrorTranslationMap[keyof ImportErrorTranslationMap]
                > = {
                    INVALID_EXTENSION:
                        'workouts.import.errors.invalidExtension',
                    INVALID_KIND: 'workouts.import.errors.invalidKind',
                    INVALID_SHAPE: 'workouts.import.errors.invalidShape',
                    PARSE_FAILED: 'workouts.import.errors.parseFailed',
                    READ_FAILED: 'workouts.import.errors.readFailed',
                };

                setImportError(t(messageByError[result.error]));
                return;
            }

            startDraftFromImported(result.workout);

            router.push({
                pathname: '/workouts/edit',
                params: { fromImport: '1' },
            });
        } catch (err) {
            console.warn('Import failed (unexpected)', err);
            setImportError(t('workouts.import.errors.unexpected'));
        } finally {
            setImporting(false);
            closeModal();
        }
    };

    return (
        <MainContainer title={t('workouts.title')} scroll={false} noPadding>
            <FlatList
                data={data}
                keyExtractor={(w) => w.id}
                style={st.list}
                contentContainerStyle={st.listContent}
                ListHeaderComponent={
                    <View style={st.headerContainer}>
                        <View style={st.headerRow}>
                            <SearchField
                                value={search}
                                onChangeText={setSearch}
                                fullWidth
                                placeholder={t('workouts.searchPlaceholder')}
                            />

                            <Button
                                title={t('workouts.newButton')}
                                variant="primary"
                                onPress={() => setModalVisible(true)}
                                style={st.newButton}
                            />
                        </View>
                        <AppearingView visible={!!importError}>
                            <ErrorBanner
                                message={importError ?? ''}
                                onClose={() => setImportError(null)}
                            />
                        </AppearingView>
                    </View>
                }
                stickyHeaderIndices={[0]} // make headerRow stick to the top
                renderItem={({ item }) => (
                    <WorkoutItem
                        item={item}
                        onPress={() => router.push(`/workouts/${item.id}`)}
                        onRemove={() => setToRemove(item.id)}
                        onToggleFavorite={() => toggleFavorite(item.id)}
                    />
                )}
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
                title={t('workouts.confirmRemove.title')}
                message={t('workouts.confirmRemove.message')}
                confirmLabel={t('workouts.confirmRemove.confirm')}
                cancelLabel={t('workouts.confirmRemove.cancel')}
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
