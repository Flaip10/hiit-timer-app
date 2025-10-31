import { MainContainer } from '@src/components/layout/MainContainer';
import { StyleSheet, Text } from 'react-native';

const HomeScreen = () => (
    <MainContainer title="Home">
        <Text style={st.h1}>Welcome</Text>
        <Text style={st.p}>Use the menu to navigate to your workouts.</Text>
    </MainContainer>
);

const st = StyleSheet.create({
    h1: { color: '#F2F2F2', fontSize: 22, fontWeight: '700' },
    p: { color: '#A1A1AA' },
});

export default HomeScreen;
