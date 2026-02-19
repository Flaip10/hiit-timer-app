import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useBlockEditStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        setupGroup: {
            gap: 8,
        },
        setupGroupCard: {
            gap: 10,
            padding: 12,
            paddingTop: 18,
            borderRadius: theme.layout.card.borderRadius,
            borderWidth: 1,
            borderColor: theme.palette.accent.primary,
            backgroundColor: 'transparent',
        },
        setupGroupBody: {
            gap: 8,
        },
        setupGroupLegend: {
            position: 'absolute',
            top: -12,
            left: 12,
            paddingHorizontal: 10,
            backgroundColor: theme.palette.background.primary,
            zIndex: 1,
            fontWeight: '600',
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
