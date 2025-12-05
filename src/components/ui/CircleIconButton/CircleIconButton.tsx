import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { useCircleIconButtonStyles } from './CircleIconButton.styles';

type CircleIconButtonProps = {
    onPress: () => void;
    children: React.ReactNode;

    variant?: 'primary' | 'secondary';
    size?: number; // outer size (width = height = size)
    backgroundColor?: string; // optional override, e.g. phaseColor
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};

export const CircleIconButton = ({
    onPress,
    children,
    variant = 'secondary',
    size,
    backgroundColor,
    disabled = false,
    style,
}: CircleIconButtonProps) => {
    const st = useCircleIconButtonStyles();

    const baseSize = size ?? (variant === 'primary' ? 76 : 56);
    const baseStyle =
        variant === 'primary' ? st.primaryCircle : st.secondaryCircle;

    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            style={({ pressed }) => [
                baseStyle,
                {
                    width: baseSize,
                    height: baseSize,
                    borderRadius: baseSize / 2,
                },
                backgroundColor ? { backgroundColor } : null,
                pressed &&
                    !disabled &&
                    (variant === 'primary'
                        ? { transform: [{ scale: 0.95 }] }
                        : { opacity: 0.6 }),
                disabled && { opacity: 0.4 },
                style,
            ]}
        >
            {children}
        </Pressable>
    );
};
