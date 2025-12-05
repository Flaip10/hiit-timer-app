import React, { type ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyles } from '@src/theme/createStyles';

type FooterBarProps = {
    children: ReactNode;
};

const PADDING_BOTTOM = 20;

const useStyles = createStyles((theme) => ({
    safe: {
        backgroundColor: theme.palette.background.card,
        borderTopWidth: 1,
        borderTopColor: theme.palette.border.subtle,
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
}));

export const FooterBar = ({ children }: FooterBarProps) => {
    const st = useStyles();

    return (
        <SafeAreaView edges={['bottom']} style={st.safe}>
            <View style={st.row}>{children}</View>
        </SafeAreaView>
    );
};
