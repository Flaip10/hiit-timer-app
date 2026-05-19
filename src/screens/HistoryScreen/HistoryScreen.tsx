import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { AppText } from '@src/components/ui/Typography/AppText';
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

    return (
        <MainContainer title={t('history.title')} scroll={false} noPadding>
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
                        <Button
                            title={t('history.clear')}
                            variant="secondary"
                            onPress={() => setConfirmClear(true)}
                            disabled={data.length === 0}
                        />
                    </View>
                }
                stickyHeaderIndices={[0]}
                renderItem={({ item }) => (
                    <SessionListItem
                        session={item}
                        onPress={() => router.push(`/history/${item.id}`)}
                    />
                )}
                ListEmptyComponent={
                    <View style={st.empty}>
                        <AppText variant="title3">
                            {t('history.emptyTitle')}
                        </AppText>
                        <AppText variant="bodySmall" tone="secondary">
                            {t('history.emptyDescription')}
                        </AppText>
                    </View>
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
        </MainContainer>
    );
};

export default HistoryScreen;
