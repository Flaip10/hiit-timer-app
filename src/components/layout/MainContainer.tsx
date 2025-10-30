// src/components/layout/MainContainer.tsx
import { View, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { TopBar } from '../navigation/TopBar';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
    title?: string;
    children: ReactNode;
}

export const MainContainer = ({ title, children }: Props) => (
    <View style={st.container}>
        <TopBar title={title} />
        {/* Bottom safe area so lists/buttons don't sit under the home indicator */}
        <SafeAreaView edges={['bottom']} style={st.safeBottom}>
            <View style={st.content}>{children}</View>
        </SafeAreaView>
    </View>
);

const st = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B0C' },
    safeBottom: { flex: 1, backgroundColor: '#0B0B0C' },
    content: { flex: 1 },
});
