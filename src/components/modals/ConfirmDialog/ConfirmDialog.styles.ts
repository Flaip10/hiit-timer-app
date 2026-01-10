import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useConfirmDialogStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        modalContainer: {
            padding: 20,
        },
        modalContent: {
            backgroundColor: theme.palette.background.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
            padding: 16,
            shadowColor: theme.palette.background.primary,
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
        },
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
