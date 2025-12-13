import React, { useRef } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    cancelAnimation,
    Easing,
} from 'react-native-reanimated';

import type { HoldToConfirmButtonProps } from './HoldToConfirmButton.interfaces';
import { useHoldToConfirmButtonStyles } from './HoldToConfirmButton.styles';
import { AppText } from '../Typography/AppText';
import GuardedPressable from '../GuardedPressable/GuardedPressable';

export const HoldToConfirmButton: React.FC<HoldToConfirmButtonProps> = ({
    title,
    onConfirmed,
    holdDurationMs = 1200,
    disabled,
    variant = 'primary',
    style,
    ...pressableProps
}) => {
    const st = useHoldToConfirmButtonStyles();

    const progress = useSharedValue(0);
    const holdStartRef = useRef<number | null>(null);

    const handlePressIn = () => {
        if (disabled) return;

        holdStartRef.current = Date.now();

        cancelAnimation(progress);
        progress.value = 0;

        progress.value = withTiming(1, {
            duration: holdDurationMs,
            easing: Easing.linear,
        });
    };

    const handlePressOut = () => {
        if (disabled) return;

        const start = holdStartRef.current;
        holdStartRef.current = null;

        const elapsed = start != null ? Date.now() - start : 0;

        if (elapsed >= holdDurationMs) {
            progress.value = 1;
            onConfirmed();
            return;
        }

        cancelAnimation(progress);
        progress.value = withTiming(0, {
            duration: 150,
            easing: Easing.out(Easing.quad),
        });
    };

    const fillStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    return (
        <View style={st.container}>
            {/* progress track */}
            <View style={[st.track, st[`track_${variant}`]]}>
                <Animated.View style={[st.fill, fillStyle]} />
            </View>

            {/* button */}
            <View style={st.buttonWrapper}>
                <GuardedPressable
                    {...pressableProps}
                    disabled={disabled}
                    onPress={() => {}}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={({ pressed }) => [
                        st.button,
                        pressed && !disabled && st.buttonPressed,
                        disabled && st.buttonDisabled,
                        style,
                    ]}
                >
                    <AppText
                        variant="bodySmall"
                        style={[st.text, st[`text_${variant}`]]}
                    >
                        {title}
                    </AppText>
                </GuardedPressable>
            </View>
        </View>
    );
};
