import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useButtonStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        base: {
            borderRadius: 999,
            paddingVertical: 14,
            paddingHorizontal: 14,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 6,
        },

        // Variants

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
            borderWidth: 1,
            borderColor: theme.palette.button.danger,
        },
        ghost: {
            backgroundColor: 'transparent',
        },

        // Text
        text: {
            fontWeight: '700',
        },
        text_primary: {
            color: theme.palette.text.inverted,
        },
        text_secondary: {
            color: theme.palette.button.text.secondary,
        },
        text_danger: {
            color: theme.palette.text.danger,
        },
        text_ghost: {
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
