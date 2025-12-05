import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useConfirmDialogStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        container: {
            gap: 10,
        },
        textContainer: {
            padding: 4,
            gap: 6,
        },
        message: {
            marginTop: 4,
            color: theme.palette.text.secondary,
        },
        title: {},
        row: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 8,
        },
        button: {
            flex: 1,
        },
    })
);
