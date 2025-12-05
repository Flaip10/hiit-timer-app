import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextStyle,
    ViewStyle,
} from 'react-native';
import { useTheme } from '@src/theme/ThemeProvider';
import { useButtonStyles } from './Button.styles';

type ButtonVariant = 'default' | 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    flex?: number | boolean;
};

export const Button = ({
    title,
    onPress,
    variant = 'default',
    disabled = false,
    loading = false,
    textStyle,
    style,
    flex,
}: ButtonProps) => {
    const { theme } = useTheme();
    const st = useButtonStyles();

    const isDisabled = disabled || loading;

    const spinnerColor =
        variant === 'primary' || variant === 'danger'
            ? theme.palette.text.inverted
            : theme.palette.text.primary;

    return (
        <Pressable
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
                <Text
                    style={[
                        st.text,
                        variant === 'primary' && st.textPrimary,
                        variant === 'secondary' && st.textSecondary,
                        variant === 'ghost' && st.textGhost,
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
            )}
        </Pressable>
    );
};
