import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useEditWorkoutScreenStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        label: {
            color: theme.palette.text.secondary,
            marginBottom: 6,
        },
        input: {
            backgroundColor: theme.palette.background.card,
            color: theme.palette.text.primary,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
        },
        sectionTitle: {
            color: theme.palette.text.header,
            fontWeight: '700',
            fontSize: 16,
            marginTop: 12,
            marginBottom: 6,
        },

        errorBox: {
            backgroundColor: theme.palette.feedback.errorBg,
            borderColor: theme.palette.feedback.errorBorder,
            borderWidth: 1,
            padding: 10,
            borderRadius: 14,
            marginTop: 8,
            gap: 4,
        },
        errorText: {
            color: theme.palette.feedback.errorText,
        },
    })
);
