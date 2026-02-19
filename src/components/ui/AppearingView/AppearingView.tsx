import React, { useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';

type AppearingViewProps = {
    visible: boolean;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;

    /** slide offset in Y when hidden (default 12px) */
    offsetY?: number;
    /** slide offset in X when hidden (default 0px) */
    offsetX?: number;
    /** fade/slide duration in ms (default 260) */
    duration?: number;
    /** delay before *appearing* (no delay on exit) */
    delay?: number;
    /** forwarded to the root Animated.View – needed for MinHeightCollapse */
    onLayout?: (event: LayoutChangeEvent) => void;
};

export const AppearingView = ({
    visible,
    children,
    style,
    offsetY = 12,
    offsetX = 0,
    duration = 260,
    delay = 0,
    onLayout,
}: AppearingViewProps) => {
    const [isMounted, setIsMounted] = useState(visible);

    const opacity = useSharedValue(visible ? 1 : 0);
    const translateY = useSharedValue(visible ? 0 : offsetY);
    const translateX = useSharedValue(visible ? 0 : offsetX);

    const showTimeoutRef = useRef<number | null>(null);
    const hideTimeoutRef = useRef<number | null>(null);

    const clearTimers = () => {
        if (showTimeoutRef.current != null) {
            clearTimeout(showTimeoutRef.current);
            showTimeoutRef.current = null;
        }
        if (hideTimeoutRef.current != null) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, []);

    useEffect(() => {
        clearTimers();

        if (visible) {
            // ENTER
            const startEnterAnimation = () => {
                if (!isMounted) {
                    setIsMounted(true);
                }
                // start from hidden state
                opacity.value = 0;
                translateY.value = offsetY;
                translateX.value = offsetX;

                opacity.value = withTiming(1, { duration });
                translateY.value = withTiming(0, { duration });
                translateX.value = withTiming(0, { duration });
            };

            if (!isMounted && delay > 0) {
                // mount only *after* delay → avoids layout jump
                showTimeoutRef.current = setTimeout(
                    startEnterAnimation,
                    delay
                ) as unknown as number;
            } else {
                startEnterAnimation();
            }
        } else {
            // EXIT
            if (!isMounted) return;

            // animate out (no delay)
            opacity.value = withTiming(0, { duration });
            translateY.value = withTiming(offsetY, { duration });
            translateX.value = withTiming(offsetX, { duration });

            // unmount after the exit duration
            hideTimeoutRef.current = setTimeout(() => {
                setIsMounted(false);
            }, duration) as unknown as number;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, duration, delay, offsetY, offsetX, isMounted]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
        ],
    }));

    if (!isMounted) {
        return null;
    }

    return (
        <Animated.View style={[style, animatedStyle]} onLayout={onLayout}>
            {children}
        </Animated.View>
    );
};
