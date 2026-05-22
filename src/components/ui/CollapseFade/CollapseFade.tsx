import React, { useEffect, useRef } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import { st } from './CollapseFade.styles';

interface CollapseFadeProps {
    visible: boolean;
    children: React.ReactNode;
    duration?: number;
    contentStyle?: StyleProp<ViewStyle>;
}

export const CollapseFade = ({
    visible,
    children,
    duration = 200,
    contentStyle,
}: CollapseFadeProps) => {
    const height = useSharedValue(0);
    const opacity = useSharedValue(visible ? 1 : 0);

    // Refs avoid the setState → re-render → useEffect chain; inside a Modal
    // layout fires repeatedly during the open animation, which restarts
    // withTiming each time and makes the expansion feel laggy.
    const contentHeightRef = useRef(0);
    const visibleRef = useRef(visible);
    visibleRef.current = visible;
    const durationRef = useRef(duration);
    durationRef.current = duration;

    const handleContentLayout = (event: LayoutChangeEvent) => {
        // Math.ceil prevents sub-pixel float differences triggering spurious re-fires.
        const measured = Math.ceil(event.nativeEvent.layout.height);
        if (measured <= 0 || measured === contentHeightRef.current) return;
        contentHeightRef.current = measured;

        if (visibleRef.current) {
            height.value = withTiming(measured, { duration: durationRef.current });
            opacity.value = withTiming(1, { duration: durationRef.current });
        }
    };

    useEffect(() => {
        const h = contentHeightRef.current;
        // Wait for layout if not yet measured; handleContentLayout will start the animation.
        if (visible && h <= 0) return;
        height.value = withTiming(visible ? h : 0, { duration });
        opacity.value = withTiming(visible ? 1 : 0, { duration });
    }, [visible, duration, height, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: height.value,
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[st.clip, animatedStyle]}>
            <View
                onLayout={handleContentLayout}
                pointerEvents={visible ? 'auto' : 'none'}
                style={[st.content, contentStyle]}
            >
                {children}
            </View>
        </Animated.View>
    );
};
