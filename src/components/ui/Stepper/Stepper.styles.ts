import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

type StepperStyleProps = {
    isFocused: boolean;
};

export const useStepperStyles = createStyles(
    (theme: AppTheme, props: StepperStyleProps) =>
        StyleSheet.create({
            wrap: {
                gap: 6,
            },
            row: {
                height: 41,
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 999,
                backgroundColor: theme.palette.background.card,
                borderWidth: 1,
                borderColor: props.isFocused
                    ? theme.palette.accent.primary
                    : theme.palette.border.subtle,
                gap: 6,
            },
            input: {
                flex: 1,
                textAlign: 'center',
                color: theme.palette.text.primary,
                paddingVertical: 12,
                paddingHorizontal: 8,
                backgroundColor: 'transparent',
            },

            pressed: {
                opacity: 0.8,
            },

            // MiniButton styles (used by Stepper's +/- buttons)
            miniButton: {
                height: '100%',
                borderRadius: 999,
                paddingHorizontal: 25,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.palette.button.secondary,
                borderWidth: 1,
                borderColor: theme.palette.button.secondary,
            },
            miniButtonDisabled: {
                opacity: 0.4,
            },
            miniButtonText: {
                color: theme.palette.button.text.secondary,
                fontWeight: '700',
                fontSize: 18,
            },
        })
);
