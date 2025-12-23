import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { AppText } from '@src/components/ui/Typography/AppText';
import { Button } from '@src/components/ui/Button/Button';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { useWorkoutHistory } from '@src/state/stores/useWorkoutHistory';
import { useStyles } from './HistoryScreen.styles';
import SessionListItem from './components/SessionListitem/SessionListItem';
import { SearchField } from '@src/components/ui/SearchField/SearchField';

const HistoryScreen = () => {
    const router = useRouter();
    const st = useStyles();

    const [search, setSearch] = useState('');
    const order = useWorkoutHistory((s) => s.order);
    const sessions = useWorkoutHistory((s) => s.sessions);
    const clearAll = useWorkoutHistory((s) => s.clearAll);

    const [confirmClear, setConfirmClear] = useState(false);

    const data = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        if (!searchTerm) return order.map((id) => sessions[id]).filter(Boolean);
        return order
            .map((id) => sessions[id])
            .filter(Boolean)
            .filter((session) =>
                session?.workoutNameSnapshot?.toLowerCase().includes(searchTerm)
            );
    }, [order, search, sessions]);

    return (
        <MainContainer title="History" scroll={false} noPadding>
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
                            placeholder="Search workouts"
                        />
                        <Button
                            title="Clear"
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
                        <AppText variant="title3">No sessions yet</AppText>
                        <AppText variant="bodySmall" tone="secondary">
                            Run a workout and it will appear here.
                        </AppText>
                    </View>
                }
            />

            <ConfirmDialog
                visible={confirmClear}
                title="Clear history?"
                message="This will remove all workout sessions."
                confirmLabel="Clear"
                cancelLabel="Cancel"
                destructive
                onConfirm={() => {
                    clearAll();
                    setConfirmClear(false);
                }}
                onCancel={() => setConfirmClear(false)}
            />
        </MainContainer>
    );
};

export default HistoryScreen;
