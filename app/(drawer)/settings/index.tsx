import { StyleSheet, Text } from 'react-native';
import { MainContainer } from '@src/components/layout/MainContainer';

const SettingsScreen = () => (
    <MainContainer title="Home">
        <Text style={st.h1}>Settings</Text>
        <Text style={st.p}>Coming soon.</Text>
    </MainContainer>
);

const st = StyleSheet.create({
    h1: { color: '#F2F2F2', fontSize: 22, fontWeight: '700' },
    p: { color: '#A1A1AA' },
});

export default SettingsScreen;
