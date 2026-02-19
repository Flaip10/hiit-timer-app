import React, { useEffect } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
    cancelAnimation,
} from 'react-native-reanimated';

import { AppText } from '@src/components/ui/Typography/AppText';
import { usePhasePillStyles } from './PhasePill.styles';
import type { Phase } from '@src/core/timer';

type PhasePillProps = {
    phase: Phase;
    label: string;
    color: string;
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
};

export const PhasePill = ({
    phase,
    label,
    color,
    containerStyle,
    textStyle,
}: PhasePillProps) => {
    const st = usePhasePillStyles();

    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    useEffect(() => {
        // Ignore initial PREP phase
        if (phase === 'PREP') return;

        // Cancel any in-flight animations before starting a new transition
        cancelAnimation(opacity);
        cancelAnimation(scale);

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
    }, [phase, label, opacity, scale]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ scale: scale.value }],
            backgroundColor: color,
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
