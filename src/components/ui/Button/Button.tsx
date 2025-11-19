import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextStyle,
    ViewStyle,
} from 'react-native';
import st from './styles';

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
    const isDisabled = disabled || loading;

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
                <ActivityIndicator color="#fff" />
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
