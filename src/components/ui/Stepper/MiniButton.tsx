import React from 'react';
import { Text, ViewStyle, TextStyle } from 'react-native';
import GuardedPressable from '../GuardedPressable/GuardedPressable';

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
    <GuardedPressable
        preventDoublePress={false}
        onPress={disabled ? undefined : onPress}
        style={({ pressed }) => [
            buttonStyle,
            disabled && disabledStyle,
            pressed && !disabled && pressedStyle,
        ]}
    >
        <Text style={textStyle}>{label}</Text>
    </GuardedPressable>
);
