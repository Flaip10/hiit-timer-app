import React, { useEffect } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    interpolateColor,
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
    cancelAnimation,
} from 'react-native-reanimated';

import { AppText } from '@src/components/ui/Typography/AppText';
import { usePhasePillStyles } from './PhasePill.styles';

type PhasePillProps = {
    label: string;
    color: string;
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
};

export const PhasePill = ({
    label,
    color,
    containerStyle,
    textStyle,
}: PhasePillProps) => {
    const st = usePhasePillStyles();

    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    // color interpolation: fromColor -> toColor with progress 0..1
    const fromColor = useSharedValue(color);
    const toColor = useSharedValue(color);
    const colorProgress = useSharedValue(1);

    useEffect(() => {
        // Ignore initial PREP label
        if (label === 'Prepare') return;

        // Cancel any in-flight animations before starting a new transition
        cancelAnimation(opacity);
        cancelAnimation(scale);
        cancelAnimation(colorProgress);

        fromColor.value = toColor.value;
        toColor.value = color;
        colorProgress.value = 0;

        // Color cross-fade
        colorProgress.value = withDelay(
            75,
            withTiming(1, {
                duration: 250,
                easing: Easing.inOut(Easing.quad),
            })
        );

        // Opacity pulse
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

        // Scale pulse
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
    }, [label, color, opacity, scale, colorProgress, fromColor, toColor]);

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

    const containerCombined = containerStyle
        ? [st.container, containerStyle, animatedStyle]
        : [st.container, animatedStyle];

    const textCombined = textStyle
        ? [st.phasePillText, textStyle]
        : [st.phasePillText];

    return (
        <Animated.View
            layout={LinearTransition.springify().duration(400)}
            style={containerCombined}
        >
            <AppText variant="subtitle" style={textCombined}>
                {label}
            </AppText>
        </Animated.View>
    );
};
