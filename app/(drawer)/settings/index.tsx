import { StyleSheet, Text, View } from 'react-native';
import { TopBar } from '../../../src/components/navigation/TopBar';

const SettingsScreen = () => (
    <View style={st.container}>
        <TopBar title="Settings" />
        <View style={st.content}>
            <Text style={st.h1}>Settings</Text>
            <Text style={st.p}>Coming soon.</Text>
        </View>
    </View>
);

const st = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B0C' },
    content: { flex: 1, padding: 16, gap: 8 },
    h1: { color: '#F2F2F2', fontSize: 22, fontWeight: '700' },
    p: { color: '#A1A1AA' },
});

export default SettingsScreen;
