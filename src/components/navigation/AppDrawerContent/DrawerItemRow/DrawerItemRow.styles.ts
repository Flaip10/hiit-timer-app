import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useDrawerItemRowStyles = createStyles((theme) =>
    StyleSheet.create({
        pressableBase: {
            marginRight: 56,

            paddingVertical: 14,
            paddingLeft: 16,
            paddingRight: 24,

            borderTopRightRadius: 999,
            borderBottomRightRadius: 100,
        },

        pressableActive: {
            backgroundColor: theme.palette.accent.primary,
        },

        pressableInactive: {
            backgroundColor: 'transparent',
        },

        contentRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },

        labelActive: {
            color: theme.palette.text.inverted,
            fontWeight: 700,
        },

        labelInactive: {
            color: theme.palette.text.muted,
            fontWeight: 400,
        },
    })
);
