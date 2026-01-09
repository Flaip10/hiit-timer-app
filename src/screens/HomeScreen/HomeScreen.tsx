import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { AppText } from '@src/components/ui/Typography/AppText';
import { HomeActionTile } from './components/HomeActionTile/HomeActionTile';
import { useStyles } from './HomeScreen.styles';
import { useTheme } from '@src/theme/ThemeProvider';
import { useWorkouts } from '@src/state/useWorkouts';
import { useRecentSessions } from '@src/state/stores/useWorkoutHistory';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import SessionListItem from '../HistoryScreen/components/SessionListitem/SessionListItem';
import { AppLogo } from '@src/components/ui/AppLogo/AppLogo';

const HomeScreen = () => {
    const router = useRouter();
    const { theme } = useTheme();
    const st = useStyles();

    const recent = useRecentSessions(5);

    const onOpenSession = (sessionId: string) => {
        router.push(`/history/${sessionId}`);
    };

    return (
        <MainContainer
            title="Home"
            gap={theme.layout.mainContainer.gap}
            scroll={false}
        >
            <View style={st.headerContainer}>
                <AppLogo size={60} />
                <View style={st.headerTextContainer}>
                    <AppText variant="title1" style={st.heading}>
                        Welcome
                    </AppText>

                    <AppText
                        variant="bodySmall"
                        tone="secondary"
                        style={st.subheading}
                    >
                        Get started with your training.
                    </AppText>
                </View>
            </View>

            {/* Primary action */}
            <View style={st.gridContainer}>
                <HomeActionTile
                    title="Quick Workout"
                    subtitle="Start immediately"
                    icon="play"
                    variant="primary"
                    onPress={() => {
                        useWorkouts.getState().startDraftQuick();

                        const b0 = useWorkouts.getState().draft?.blocks[0];
                        if (!b0) return;

                        router.push(
                            `/workouts/edit-block?blockId=${b0.id}&quick=1`
                        );
                    }}
                />

                {/* Secondary actions */}
                <View style={st.grid}>
                    <View style={st.gridItem}>
                        <HomeActionTile
                            title="Workouts"
                            icon="barbell-outline"
                            onPress={() => router.push('/workouts')}
                        />
                    </View>

                    <View style={st.gridItem}>
                        <HomeActionTile
                            title="History"
                            icon="time-outline"
                            onPress={() => router.push('/history')}
                        />
                    </View>
                </View>
            </View>

            <ScreenSection title="Recent Workouts" flex>
                <FlatList
                    data={recent}
                    keyExtractor={(s) => s.id}
                    contentContainerStyle={st.listContent}
                    style={st.list}
                    renderItem={({ item }) => (
                        <SessionListItem
                            session={item}
                            onPress={() => onOpenSession(item.id)}
                        />
                    )}
                    ListEmptyComponent={
                        <AppText variant="bodySmall" tone="secondary">
                            No sessions yet.
                        </AppText>
                    }
                />
            </ScreenSection>
        </MainContainer>
    );
};

export default HomeScreen;
