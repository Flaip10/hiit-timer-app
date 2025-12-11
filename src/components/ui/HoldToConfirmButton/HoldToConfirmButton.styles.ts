import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useHoldToConfirmButtonStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        container: {
            position: 'relative',
            width: '100%',
        },

        track: {
            position: 'absolute',
            inset: 0,
            borderRadius: 999,
            overflow: 'hidden',
            borderWidth: 1,
        },

        // track variants
        track_primary: {
            backgroundColor: theme.palette.button.primary,

            borderColor: theme.palette.button.primary,
        },
        track_secondary: {
            backgroundColor: theme.palette.button.secondary,

            borderColor: theme.palette.button.secondary,
        },
        track_danger: {
            backgroundColor: theme.palette.button.danger,

            borderColor: theme.palette.button.danger,
        },
        track_ghost: {
            backgroundColor: 'transparent',
        },

        // fill (animated progress)
        fill: {
            height: '100%',
            backgroundColor: theme.palette.background.primary,

            opacity: 0.15,
        },

        buttonWrapper: {
            position: 'relative',
        },

        // base button
        button: {
            width: '100%',
            borderRadius: 999,
            padding: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            margin: 1,
        },

        // text styles
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
            color: theme.palette.text.inverted,
        },
        text_ghost: {
            color: theme.palette.accent.primary,
        },

        // states
        buttonPressed: { opacity: 1 },
        buttonDisabled: { opacity: 0.5 },
    })
);
