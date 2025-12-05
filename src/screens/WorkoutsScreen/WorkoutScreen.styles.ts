import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useWorkoutsScreenStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
        },

        search: {
            flex: 1,
            borderRadius: 999,
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: theme.palette.background.card,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
            color: theme.palette.text.primary,
            height: '100%',
        },

        newButton: {
            paddingHorizontal: 14,
        },

        listContent: {
            paddingBottom: 24,
            gap: 10,
        },

        separator: {
            height: 8,
        },

        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 32,
            gap: 8,
        },

        emptyDescription: {
            textAlign: 'center',
        },

        emptyButton: {
            marginTop: 8,
        },
    })
);
