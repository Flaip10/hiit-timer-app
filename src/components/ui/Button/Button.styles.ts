import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useButtonStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        base: {
            borderRadius: 999,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 6,
        },

        // Variants
        default: {
            backgroundColor: theme.palette.background.card,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
        },
        primary: {
            backgroundColor: theme.palette.button.primary,
            borderWidth: 1,
            borderColor: theme.palette.button.primary,
        },
        secondary: {
            backgroundColor: theme.palette.button.secondary,
            borderWidth: 1,
            borderColor: theme.palette.button.secondary,
        },
        danger: {
            backgroundColor: theme.palette.button.danger,
        },
        ghost: {
            backgroundColor: 'transparent',
        },

        // Text
        text: {
            fontWeight: '700',
            fontSize: 14,
            color: theme.palette.text.primary,
        },
        textPrimary: {
            color: theme.palette.text.inverted,
        },
        textSecondary: {
            color: theme.palette.button.text.secondary,
        },
        textDanger: {
            color: theme.palette.text.danger,
        },
        textGhost: {
            color: theme.palette.accent.primary,
        },

        // States
        disabled: {
            opacity: 0.5,
        },
        pressed: {
            opacity: 0.85,
        },
    })
);
