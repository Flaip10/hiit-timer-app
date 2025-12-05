import React, {
    FC,
    ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Animated,
    Easing,
    LayoutChangeEvent,
    View,
    ViewProps,
} from 'react-native';
import type { MinHeightCollapseProps } from './MinHeightCollapse.interfaces';
import { st } from './MinHeightCollapse.styles';

const MinHeightCollapse: FC<MinHeightCollapseProps> = ({
    expanded,
    minHeight = 0,
    children,
    timeout = 300,
    withBottomFade = false,
    bottomFadeHeight = 32,
}) => {
    // We treat minHeight === 0 as "no collapse behaviour"
    const safeMin = typeof minHeight === 'number' ? minHeight : 0;

    const [contentHeight, setContentHeight] = useState(0);
    const [hasMeasured, setHasMeasured] = useState(false);

    const heightAnim = useRef(new Animated.Value(0)).current;
    const hasAnimatedOnceRef = useRef(false);

    const hasCollapse = useMemo(() => safeMin > 0, [safeMin]);

    // Measure child height
    const handleLayout = useCallback(
        (e: LayoutChangeEvent) => {
            const h = e.nativeEvent.layout.height;
            if (h <= 0) return;

            // If we've already measured and the height hasn't changed meaningfully,
            // avoid re-setting state / restarting logic.
            if (hasMeasured && Math.abs(h - contentHeight) < 0.5) {
                return;
            }

            setHasMeasured(true);
            setContentHeight(h);

            // On first measurement, set a sensible starting value *without* animation
            if (!hasCollapse) {
                // Non-collapsible → always full height
                heightAnim.setValue(h);
            } else if (!hasAnimatedOnceRef.current) {
                const collapsedHeight = safeMin;
                heightAnim.setValue(expanded ? h : collapsedHeight);
                // We do not mark hasAnimatedOnce here; we let the effect
                // do that once it has all info (contentHeight + expanded).
            }
        },
        [expanded, hasCollapse, safeMin, heightAnim, hasMeasured, contentHeight]
    );

    // Animate on expanded / height changes
    useEffect(() => {
        if (!hasMeasured) return;

        if (!hasCollapse) {
            // No collapse behaviour → always full height, no animation
            heightAnim.setValue(contentHeight);
            return;
        }

        const collapsedHeight = safeMin;

        // First time we have enough info: snap to correct state, don't animate
        if (!hasAnimatedOnceRef.current) {
            heightAnim.setValue(expanded ? contentHeight : collapsedHeight);
            hasAnimatedOnceRef.current = true;
            return;
        }

        const toValue = expanded ? contentHeight : collapsedHeight;

        // Important: do **not** reset fromValue here. Animated.timing will
        // interpolate from the current animated value, which avoids jitter/loops.
        Animated.timing(heightAnim, {
            toValue,
            duration: timeout,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false, // layout property
        }).start();
    }, [
        expanded,
        contentHeight,
        hasMeasured,
        hasCollapse,
        safeMin,
        timeout,
        heightAnim,
    ]);

    // Inject our onLayout into children
    const childrenWithOnLayout = useMemo(() => {
        return React.Children.map(children, (child) => {
            if (!React.isValidElement<ViewProps>(child)) return child;

            const existingOnLayout = child.props.onLayout;

            const mergedOnLayout = (e: LayoutChangeEvent) => {
                handleLayout(e);
                existingOnLayout?.(e);
            };

            return React.cloneElement(child as ReactElement<ViewProps>, {
                onLayout: mergedOnLayout,
            });
        });
    }, [children, handleLayout]);

    const containerStyle = useMemo(() => {
        // Before we know the height, let it size naturally (no animation).
        if (!hasMeasured) return {};

        // Non-collapsible case: height is intrinsic; we just let it be.
        if (!hasCollapse) return {};

        // Collapsible + measured → drive height with Animated.Value
        return { height: heightAnim };
    }, [hasMeasured, hasCollapse, heightAnim]);

    const showFade = withBottomFade && hasCollapse && !expanded;

    return (
        <Animated.View style={[st.container, containerStyle]}>
            {childrenWithOnLayout}
            {showFade && (
                <View
                    pointerEvents="none"
                    style={[st.bottomFade, { height: bottomFadeHeight }]}
                />
            )}
        </Animated.View>
    );
};

export default MinHeightCollapse;
