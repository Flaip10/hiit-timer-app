import React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';

import { useTheme } from '@src/theme/ThemeProvider';
import { useButtonStyles } from './Button.styles';
import type { ButtonProps } from './Button.interfaces';
import { AppText } from '../Typography/AppText';

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    style,
    textStyle,
    flex,
    disabled, // from PressableProps
    ...pressableProps
}) => {
    const { theme } = useTheme();
    const st = useButtonStyles();

    const isDisabled = disabled || loading;

    const spinnerColor =
        variant === 'primary' || variant === 'danger'
            ? theme.palette.text.inverted
            : theme.palette.text.primary;

    return (
        <Pressable
            {...pressableProps}
            onPress={isDisabled ? undefined : onPress}
            style={({ pressed }) => [
                st.base,
                st[variant],
                isDisabled && st.disabled,
                pressed && !isDisabled && st.pressed,
                flex
                    ? { flex: typeof flex === 'number' ? flex : 1 }
                    : undefined,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={spinnerColor} />
            ) : (
                <AppText
                    variant="bodySmall"
                    style={[st.text, st[`text_${variant}`], textStyle]}
                >
                    {title}
                </AppText>
            )}
        </Pressable>
    );
};
