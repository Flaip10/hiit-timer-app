import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        card: {
            width: '100%',
        },

        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
        },

        left: {
            flex: 1,
            minWidth: 0,
        },

        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },

        titleIcon: {
            width: 28,
            height: 28,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.button.secondary,
        },

        title: {
            color: theme.palette.text.primary,
            flex: 1,
            minWidth: 0,
        },

        durationPill: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 999,
            backgroundColor: theme.palette.metaCard.datePill.background,
        },

        durationText: {
            color: theme.palette.metaCard.datePill.icon,
        },
    })
);
