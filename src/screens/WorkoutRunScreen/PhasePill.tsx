import React, { useEffect, useRef } from 'react';
import { Animated, Text, type TextStyle, type ViewStyle } from 'react-native';

type PhasePillProps = {
    label: string;
    color: string;
    containerStyle: ViewStyle;
    textStyle: TextStyle;
};

export const PhasePill = ({
    label,
    color,
    containerStyle,
    textStyle,
}: PhasePillProps) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;

    // Whenever label or color changes, play a quick fade+scale-in
    useEffect(() => {
        opacity.setValue(0);
        scale.setValue(0.9);

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    }, [label, color, opacity, scale]);

    return (
        <Animated.View
            style={[
                containerStyle,
                {
                    backgroundColor: color,
                    opacity,
                    transform: [{ scale }],
                },
            ]}
        >
            <Text style={textStyle}>{label}</Text>
        </Animated.View>
    );
};
