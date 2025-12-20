import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { AppText } from '@src/components/ui/Typography/AppText';
import { HomeActionTile } from './components/HomeActionTile/HomeActionTile';
import { useStyles } from './HomeScreen.styles';
import { useTheme } from '@src/theme/ThemeProvider';

const HomeScreen = () => {
    const router = useRouter();
    const { theme } = useTheme();
    const st = useStyles();

    return (
        <MainContainer title="Home" gap={theme.layout.mainContainer.gap}>
            <View style={st.headerContainer}>
                <AppText variant="title3" style={st.heading}>
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

            {/* Primary action */}
            <View style={st.gridContainer}>
                <HomeActionTile
                    title="Quick Workout"
                    subtitle="Start immediately"
                    icon="play"
                    variant="primary"
                    onPress={() => router.push('/run')}
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
        </MainContainer>
    );
};

export default HomeScreen;
