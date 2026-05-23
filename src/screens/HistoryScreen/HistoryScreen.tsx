import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { Button } from '@src/components/ui/Button/Button';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import {
    useClearWorkoutSessions,
    useWorkoutSessions,
} from '@src/data/workoutSessions';
import { useStyles } from './HistoryScreen.styles';
import SessionListItem from './components/SessionListitem/SessionListItem';
import { SearchField } from '@src/components/ui/SearchField/SearchField';
import { useTranslation } from 'react-i18next';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import { useHistorySelection } from './useHistorySelection';

const HistoryScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const st = useStyles();

    const [search, setSearch] = useState('');
    const { data: sessions = [] } = useWorkoutSessions();
    const clearWorkoutSessions = useClearWorkoutSessions();

    const [confirmClear, setConfirmClear] = useState(false);

    const data = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        if (!searchTerm) return sessions;
        return sessions.filter((session) =>
            session.workoutSnapshot.name.toLowerCase().includes(searchTerm),
        );
    }, [search, sessions]);
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
        confirmRemoval,
        cancelRemoval,
    } = useHistorySelection();

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
                keyExtractor={(s) => s.id}
                style={st.list}
                contentContainerStyle={st.listContent}
                ListHeaderComponent={
                    <View style={st.headerRow}>
                        <SearchField
                            value={search}
                            onChangeText={setSearch}
                            fullWidth
                            placeholder={t('history.searchPlaceholder')}
                        />
                        {!isSelectMode && (
                            <Button
                                title={t('history.clear')}
                                variant="secondary"
                                onPress={() => setConfirmClear(true)}
                                disabled={sessions.length === 0}
                            />
                        )}
                    </View>
                }
                stickyHeaderIndices={[0]}
                renderItem={({ item }) => (
                    <SessionListItem
                        session={item}
                        onPress={() => router.push(`/history/${item.id}`)}
                        isSelectMode={isSelectMode}
                        isSelected={isSelected(item.id)}
                        onSelect={() => toggleItem(item.id)}
                    />
                )}
                ListEmptyComponent={
                    <ListEmptyState
                        title={
                            hasSearch
                                ? t('history.searchEmptyTitle')
                                : t('history.emptyTitle')
                        }
                        description={
                            hasSearch
                                ? t('history.searchEmptyDescription')
                                : t('history.emptyDescription')
                        }
                    />
                }
            />

            <ConfirmDialog
                visible={confirmClear}
                title={t('history.clearConfirm.title')}
                message={t('history.clearConfirm.message')}
                confirmLabel={t('history.clearConfirm.confirm')}
                cancelLabel={t('history.clearConfirm.cancel')}
                destructive
                onConfirm={() => {
                    clearWorkoutSessions.mutate();
                    setConfirmClear(false);
                }}
                onCancel={() => setConfirmClear(false)}
            />

            <ConfirmDialog
                visible={hasPendingRemoval}
                title={confirmTitle}
                message={confirmMessage}
                confirmLabel={t('historySession.actions.delete')}
                cancelLabel={t('common.actions.cancel')}
                destructive
                onConfirm={confirmRemoval}
                onCancel={cancelRemoval}
            />
        </MainContainer>
    );
};

export default HistoryScreen;
