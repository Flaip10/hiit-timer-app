import React, { useEffect, useState } from 'react';
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
    const [contentHeight, setContentHeight] = useState(0);

    const height = useSharedValue(0);
    const opacity = useSharedValue(visible ? 1 : 0);

    const handleContentLayout = (event: LayoutChangeEvent) => {
        const measured = event.nativeEvent.layout.height;
        if (measured <= 0) return;
        setContentHeight((prev) => (prev === measured ? prev : measured));
    };

    useEffect(() => {
        // Can't size the open state until the content has been measured.
        if (visible && contentHeight <= 0) return;

        height.value = withTiming(visible ? contentHeight : 0, { duration });
        opacity.value = withTiming(visible ? 1 : 0, { duration });
    }, [visible, contentHeight, duration, height, opacity]);

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
