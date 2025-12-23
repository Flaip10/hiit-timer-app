import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        headerContainer: {
            width: '100%',
            gap: 8,
        },
        heading: {},
        subheading: {},
        gridContainer: { gap: 14 },

        grid: {
            flexDirection: 'row',
            gap: 14,
        },
        gridItem: {
            flex: 1,
        },

        list: {
            flex: 1,
            width: '100%',
        },

        listContent: {
            gap: theme.layout.listItem.gap,
            paddingBottom: theme.insets.bottom,
        },
    })
);
