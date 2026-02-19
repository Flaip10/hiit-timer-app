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
import { useTranslation } from 'react-i18next';
import { useSystemBackHandler } from '@src/hooks/navigation/useSystemBackHandler';

const HomeScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { theme } = useTheme();
    const st = useStyles();

    useSystemBackHandler({
        onSystemBack: () => true,
        isGestureBackDisabled: true,
    });

    const recent = useRecentSessions(5);

    const onOpenSession = (sessionId: string) => {
        router.push(`/history/${sessionId}`);
    };

    return (
        <MainContainer
            title={t('home.title')}
            gap={theme.layout.mainContainer.gap}
            scroll={false}
        >
            <View style={st.headerContainer}>
                <AppLogo size={60} />
                <View style={st.headerTextContainer}>
                    <AppText variant="title1" style={st.heading}>
                        {t('home.welcome')}
                    </AppText>

                    <AppText
                        variant="bodySmall"
                        tone="secondary"
                        style={st.subheading}
                    >
                        {t('home.subtitle')}
                    </AppText>
                </View>
            </View>

            {/* Primary action */}
            <View style={st.gridContainer}>
                <HomeActionTile
                    title={t('home.quickWorkout')}
                    subtitle={t('home.startImmediately')}
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
                            title={t('drawer.workouts')}
                            icon="barbell-outline"
                            onPress={() => router.push('/workouts')}
                        />
                    </View>

                    <View style={st.gridItem}>
                        <HomeActionTile
                            title={t('drawer.history')}
                            icon="time-outline"
                            onPress={() => router.push('/history')}
                        />
                    </View>
                </View>
            </View>

            <ScreenSection title={t('home.recentWorkouts')} flex>
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
                            {t('home.noSessionsYet')}
                        </AppText>
                    }
                />
            </ScreenSection>
        </MainContainer>
    );
};

export default HomeScreen;
