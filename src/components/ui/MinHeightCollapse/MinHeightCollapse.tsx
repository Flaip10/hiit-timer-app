import type { FC } from 'react';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import type { LayoutChangeEvent, ViewProps } from 'react-native';
import { Animated, Easing, View } from 'react-native';
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
    // Collapsed height. 0 = fully collapsed.
    const safeMin =
        typeof minHeight === 'number' && minHeight >= 0 ? minHeight : 0;

    const [contentHeight, setContentHeight] = useState(0);
    const [contentVisible, setContentVisible] = useState(false);

    const heightAnim = useRef(new Animated.Value(0)).current;
    const hasInitialisedRef = useRef(false);

    /**
     * Measure the natural/full height of the children.
     * We only ever increase `contentHeight` (max seen),
     * so collapsing doesn't overwrite the real full height.
     */
    const handleLayout = useCallback(
        (e: LayoutChangeEvent) => {
            const h = e.nativeEvent.layout.height;
            if (h <= 0) return;

            setContentHeight((prev) => {
                const next = prev === 0 ? h : Math.max(prev, h);

                if (!hasInitialisedRef.current) {
                    // If content is smaller than minHeight, collapsed height
                    // must never be larger than the content itself.
                    const collapsedHeight = Math.min(safeMin, next);
                    const initial = expanded ? next : collapsedHeight;

                    heightAnim.setValue(initial);
                    hasInitialisedRef.current = true;
                    setContentVisible(true);
                }

                return next;
            });
        },
        [expanded, safeMin, heightAnim]
    );

    // Animate when expanded / heights / minHeight change
    useEffect(() => {
        if (!hasInitialisedRef.current) return;

        const collapsedHeight = Math.min(safeMin, contentHeight);
        const toValue = expanded ? contentHeight : collapsedHeight;

        Animated.timing(heightAnim, {
            toValue,
            duration: timeout,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false, // layout property
        }).start();
    }, [expanded, contentHeight, safeMin, timeout, heightAnim]);

    // Inject our onLayout into children
    const childrenWithOnLayout = useMemo(() => {
        return React.Children.map(children, (child) => {
            if (!React.isValidElement<ViewProps>(child)) return child;

            const existingOnLayout = child.props.onLayout;

            const mergedOnLayout = (e: LayoutChangeEvent) => {
                handleLayout(e);
                existingOnLayout?.(e);
            };

            return React.cloneElement(child, {
                onLayout: mergedOnLayout,
            });
        });
    }, [children, handleLayout]);

    const showFade =
        withBottomFade &&
        !expanded &&
        hasInitialisedRef.current &&
        contentHeight > safeMin &&
        bottomFadeHeight > 0;

    return (
        <Animated.View
            style={[
                st.container,
                hasInitialisedRef.current && { height: heightAnim },
                !contentVisible && st.hiddenContent,
            ]}
        >
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
