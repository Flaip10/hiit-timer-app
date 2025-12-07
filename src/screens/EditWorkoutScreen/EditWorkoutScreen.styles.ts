import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useEditWorkoutScreenStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        errorBox: {
            backgroundColor: theme.palette.feedback.errorBg,
            borderColor: theme.palette.feedback.errorBorder,
            borderWidth: 1,
            padding: 10,
            borderRadius: 10,
            marginTop: 8,
            gap: 4,
        },
        errorText: {
            color: theme.palette.feedback.errorText,
            fontSize: 14,
        },
    })
);
