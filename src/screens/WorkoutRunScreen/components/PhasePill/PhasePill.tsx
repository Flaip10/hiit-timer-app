import React, { useEffect } from 'react';
import { Text, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
    Easing,
    interpolateColor,
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

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
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    // color interpolation: fromColor -> toColor with progress 0..1
    const fromColor = useSharedValue(color);
    const toColor = useSharedValue(color);
    const colorProgress = useSharedValue(1);

    useEffect(() => {
        if (label !== 'Prepare') {
            fromColor.value = toColor.value;
            toColor.value = color;
            colorProgress.value = 0;

            colorProgress.value = withDelay(
                75,
                withTiming(1, {
                    duration: 250,
                    easing: Easing.inOut(Easing.quad),
                })
            );

            opacity.value = withSequence(
                withTiming(0.7, {
                    duration: 250,
                    easing: Easing.inOut(Easing.quad),
                }),
                withTiming(1, {
                    duration: 250,
                    easing: Easing.inOut(Easing.quad),
                })
            );

            scale.value = withSequence(
                withTiming(0.9, {
                    duration: 250,
                    easing: Easing.inOut(Easing.quad),
                }),
                withTiming(1, {
                    duration: 250,
                    easing: Easing.inOut(Easing.quad),
                })
            );
        }
    }, [label, color, fromColor, toColor, colorProgress, opacity, scale]);

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            colorProgress.value,
            [0, 1],
            [fromColor.value, toColor.value]
        );

        return {
            opacity: opacity.value,
            transform: [{ scale: scale.value }],
            backgroundColor,
        };
    });

    return (
        <Animated.View
            // smooth width/position changes when label length changes
            layout={LinearTransition.springify().duration(400)}
            style={[containerStyle, animatedStyle]}
        >
            <Text style={textStyle}>{label}</Text>
        </Animated.View>
    );
};
