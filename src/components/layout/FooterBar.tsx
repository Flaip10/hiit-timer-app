import { Platform, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReactNode } from 'react';

type FooterBarProps = {
    children: ReactNode;
};

export const FooterBar = ({ children }: FooterBarProps) => (
    <SafeAreaView edges={['bottom']} style={st.safe}>
        <View style={st.row}>{children}</View>
    </SafeAreaView>
);

const st = StyleSheet.create({
    safe: {
        backgroundColor: '#0B0B0C',
    },
    row: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'android' ? 16 : 0,
    },
});
