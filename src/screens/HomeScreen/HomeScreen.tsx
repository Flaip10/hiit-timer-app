import { StyleSheet } from 'react-native';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { AppText } from '@src/components/ui/Typography/AppText';

const HomeScreen = () => (
    <MainContainer title="Home">
        <AppText variant="title2" style={st.heading}>
            Welcome
        </AppText>

        <AppText variant="bodySmall" tone="secondary">
            Use the menu to navigate to your workouts.
        </AppText>
    </MainContainer>
);

const st = StyleSheet.create({
    heading: {
        marginBottom: 4,
    },
});

export default HomeScreen;
