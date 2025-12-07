import React from 'react';
import { Pressable, Text, ViewStyle, TextStyle } from 'react-native';

type MiniButtonProps = {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    buttonStyle: ViewStyle;
    disabledStyle: ViewStyle;
    textStyle: TextStyle;
    pressedStyle: ViewStyle;
};

export const MiniButton: React.FC<MiniButtonProps> = ({
    label,
    onPress,
    disabled,
    buttonStyle,
    disabledStyle,
    textStyle,
    pressedStyle,
}) => (
    <Pressable
        onPress={disabled ? undefined : onPress}
        style={({ pressed }) => [
            buttonStyle,
            disabled && disabledStyle,
            pressed && !disabled && pressedStyle,
        ]}
    >
        <Text style={textStyle}>{label}</Text>
    </Pressable>
);
