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
            },
            labelRow: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
            },

            input: {
                width: '100%',
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
                marginVertical: 6,
            },

            inputAnchor: {
                width: '100%',
            },
            rightAccessoryContainer: {
                marginLeft: 8,
                alignSelf: 'center',
            },
            suggestionsSurface: {
                backgroundColor: theme.palette.background.primary,
                borderColor: theme.palette.accent.primary,
                borderWidth: 0,
            },
            suggestionRow: {
                justifyContent: 'center',
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderTopWidth: 1,
                borderColor: theme.palette.border.subtle,
            },
            suggestionRowPressed: {
                opacity: 0.55,
            },
            suggestionLabel: {
                flexShrink: 1,
            },
            helperText: {
                fontSize: 12,
                color: theme.palette.text.muted,
            },
            errorText: {
                fontSize: 12,
                color: theme.palette.feedback.errorText,
            },
        }),
);
