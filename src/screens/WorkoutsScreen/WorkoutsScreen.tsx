import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { useWorkoutDraftStore } from '@src/state/stores/useWorkoutDraftStore';
import {
    useToggleFavoriteWorkout,
    useWorkouts,
} from '@src/data/workouts';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { WorkoutItem } from '@components/workouts/WorkoutItem';
import { importWorkoutFromFile } from '@src/core/importWorkout/importWorkout';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import NewWorkoutModal from './components/NewWorkoutModal';

import { Button } from '@src/components/ui/Button/Button';
import { useWorkoutsScreenStyles } from './WorkoutsScreen.styles';
import { SearchField } from '@src/components/ui/SearchField/SearchField';
import { useTranslation } from 'react-i18next';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import { useWorkoutsSelection } from './useWorkoutsSelection';

interface ImportErrorTranslationMap {
    INVALID_EXTENSION: 'workouts.import.errors.invalidExtension';
    INVALID_KIND: 'workouts.import.errors.invalidKind';
    INVALID_SHAPE: 'workouts.import.errors.invalidShape';
    PARSE_FAILED: 'workouts.import.errors.parseFailed';
    READ_FAILED: 'workouts.import.errors.readFailed';
}

const WorkoutsScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { data: list = [] } = useWorkouts();
    const toggleFavoriteWorkout = useToggleFavoriteWorkout();
    const startDraftFromImported = useWorkoutDraftStore(
        (state) => state.startDraftFromImported
    );

    const [search, setSearch] = useState('');

    const [modalVisible, setModalVisible] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);

    const st = useWorkoutsScreenStyles();

    const data = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();
        if (!searchTerm) return list;
        return list.filter((w) => w.name.toLowerCase().includes(searchTerm));
    }, [list, search]);
    const hasSearch = search.trim().length > 0;

    const {
        screenTitle,
        topBarOptions,
        topBarLeftAction,
        topBarRightAction,
        isSelectMode,
        isSelected,
        toggleItem,
        hasPendingRemoval,
        confirmTitle,
        confirmMessage,
        requestRemoval,
        confirmRemoval,
        cancelRemoval,
    } = useWorkoutsSelection();

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
        <MainContainer
            title={screenTitle}
            scroll={false}
            noPadding
            topBarOptions={topBarOptions}
            topBarLeftAction={topBarLeftAction}
            topBarRightAction={topBarRightAction}
        >
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
                            {!isSelectMode && (
                                <Button
                                    title={t('workouts.newButton')}
                                    variant="primary"
                                    onPress={() => setModalVisible(true)}
                                    style={st.newButton}
                                />
                            )}
                        </View>
                        <ErrorBanner
                            message={importError ?? ''}
                            onClose={() => setImportError(null)}
                        />
                    </View>
                }
                stickyHeaderIndices={[0]}
                renderItem={({ item }) => (
                    <WorkoutItem
                        item={item}
                        onPress={() => router.push(`/workouts/${item.id}`)}
                        onRemove={() => requestRemoval(item.id)}
                        onToggleFavorite={() =>
                            toggleFavoriteWorkout.mutate(item)
                        }
                        isSelectMode={isSelectMode}
                        isSelected={isSelected(item.id)}
                        onSelect={() => toggleItem(item.id)}
                    />
                )}
                ListEmptyComponent={
                    <ListEmptyState
                        title={
                            hasSearch
                                ? t('workouts.searchEmptyTitle')
                                : t('workouts.emptyTitle')
                        }
                        description={
                            hasSearch
                                ? t('workouts.searchEmptyDescription')
                                : t('workouts.emptyDescription')
                        }
                        actionLabel={
                            hasSearch ? undefined : t('workouts.createButton')
                        }
                        onPressAction={
                            hasSearch
                                ? undefined
                                : () => setModalVisible(true)
                        }
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
                visible={hasPendingRemoval}
                title={confirmTitle}
                message={confirmMessage}
                confirmLabel={t('workouts.confirmRemove.confirm')}
                cancelLabel={t('workouts.confirmRemove.cancel')}
                destructive
                onConfirm={confirmRemoval}
                onCancel={cancelRemoval}
            />
        </MainContainer>
    );
};

export default WorkoutsScreen;
