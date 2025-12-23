import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
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
        empty: {
            paddingVertical: 40,
            alignItems: 'center',
            gap: 8,
        },
    })
);
