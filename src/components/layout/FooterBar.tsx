import { Platform, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReactNode } from 'react';

type FooterBarProps = {
    children: ReactNode;
};

let PADDING_BOTTOM = 20;

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
        // base is 16 : 0 the added is literal bottom padding
        paddingBottom:
            Platform.OS === 'android'
                ? 16 + PADDING_BOTTOM
                : 0 + PADDING_BOTTOM,
    },
});
