import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

interface TextFieldStyleProps {
    hasError: boolean;
    isFocused: boolean;
    multiline?: boolean;
}

export const useTextFieldStyles = createStyles(
    (theme: AppTheme, props: TextFieldStyleProps) =>
        StyleSheet.create({
            container: {
                width: '100%',
                gap: 10,
            },
            labelRow: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
            },
            label: {
                color: theme.palette.text.secondary,
                fontSize: 14,
                fontWeight: '500',
            },
            input: {
                flexDirection: 'row',
                alignItems: props.multiline ? 'flex-start' : 'center',
                borderRadius: 999,
                paddingHorizontal: 18,
                paddingVertical: 12,
                backgroundColor: theme.palette.background.card,
                borderWidth: 1,
                color: theme.palette.text.primary,
                borderColor: props.hasError
                    ? theme.palette.feedback.errorBorder
                    : props.isFocused
                      ? theme.palette.accent.primary
                      : theme.palette.border.subtle,
                textAlignVertical: props.multiline ? 'top' : 'center',
            },

            rightAccessoryContainer: {
                marginLeft: 8,
                alignSelf: 'center',
            },
            helperText: {
                fontSize: 12,
                color: theme.palette.text.muted,
            },
            errorText: {
                fontSize: 12,
                color: theme.palette.feedback.errorText,
            },
        })
);
