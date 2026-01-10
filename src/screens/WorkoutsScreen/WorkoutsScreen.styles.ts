import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useWorkoutsScreenStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        headerContainer: {
            gap: theme.layout.listItem.gap,
        },
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },

        list: {
            flex: 1,
            width: '100%',
            padding: theme.layout.screen.padding,
        },

        listContent: {
            gap: theme.layout.listItem.gap,
            paddingBottom: theme.insets.bottom,
        },

        emptyContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 40,
            gap: 8,
        },
        emptyDescription: {
            textAlign: 'center',
            maxWidth: 260,
        },
        emptyButton: {
            marginTop: 8,
        },
        newButton: {
            alignSelf: 'flex-start',
        },
    })
);
