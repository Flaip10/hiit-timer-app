import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useBlockEditStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        sectionContentGap: {
            gap: 10,
        },
        exercisesGap: {
            gap: 10,
        },

        addMinor: {
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
            backgroundColor: theme.palette.button.secondary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        pressed: {
            opacity: 0.9,
        },

        errorBox: {
            marginTop: 10,
            padding: 10,
            borderRadius: 10,
            borderWidth: 1,
            backgroundColor: theme.palette.feedback.errorBg,
            borderColor: theme.palette.feedback.errorBorder,
            gap: 4,
        },
        err: {
            marginBottom: 12,
        },
    })
);
