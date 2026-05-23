import {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import type {
    DropdownLayout,
    DropdownPosition,
    DropdownProps,
} from './Dropdown.interfaces';
import { resolveDropdownLayout } from './Dropdown.helpers';
import { useDropdownStyles } from './Dropdown.styles';
import { useDropdownPortal } from './DropdownPortal';

export const Dropdown = ({
    visible,
    children,
    onClose,
    anchorRef,
    position,
    matchAnchorWidth = false,
    dismissMode = 'outside-press',
    surfaceStyle,
}: DropdownProps) => {
    const id = useId();
    const portal = useDropdownPortal();
    const st = useDropdownStyles();
    const shouldMeasureDropdownRef = useRef(false);
    const [anchorLayout, setAnchorLayout] = useState<DropdownLayout | null>(
        null,
    );
    const [dropdownLayout, setDropdownLayout] =
        useState<DropdownLayout | null>(null);
    const [portalLayout, setPortalLayout] = useState<DropdownLayout | null>(
        null,
    );
    const entering = useMemo(() => FadeIn.duration(120), []);
    const exiting = useMemo(() => FadeOut.duration(90), []);

    useEffect(() => {
        if (!visible) return;

        anchorRef.current?.measureInWindow(
            (x: number, y: number, width: number, height: number) => {
                portal.measureInWindow(
                    (
                        portalX: number,
                        portalY: number,
                        portalWidth: number,
                        portalHeight: number,
                    ) => {
                        setPortalLayout({
                            x: 0,
                            y: 0,
                            width: portalWidth,
                            height: portalHeight,
                        });
                        setAnchorLayout({
                            x: x - portalX,
                            y: y - portalY,
                            width,
                            height,
                        });
                    },
                );
            },
        );
    }, [anchorRef, portal, visible]);

    useEffect(() => {
        if (visible) return;

        setAnchorLayout(null);
        setDropdownLayout(null);
        setPortalLayout(null);
        shouldMeasureDropdownRef.current = false;
    }, [visible]);

    const onDropdownLayout = useCallback((event: LayoutChangeEvent) => {
        if (!shouldMeasureDropdownRef.current) return;

        const { width, height } = event.nativeEvent.layout;

        setDropdownLayout({
            x: 0,
            y: 0,
            width,
            height,
        });
        shouldMeasureDropdownRef.current = false;
    }, []);

    const resolvedPosition = useMemo<DropdownPosition | undefined>(() => {
        if (!anchorLayout || !dropdownLayout || !portalLayout) {
            return position;
        }

        const side = position?.side ?? 'bottom';
        const offsetY = position?.offset?.y ?? 0;
        const bottomTop = anchorLayout.y + anchorLayout.height + offsetY;
        const topTop = anchorLayout.y - dropdownLayout.height + offsetY;
        const doesBottomFit =
            bottomTop + dropdownLayout.height <= portalLayout.height;
        const doesTopFit = topTop >= 0;

        if (side === 'bottom' && !doesBottomFit && doesTopFit) {
            return {
                ...position,
                offset: {
                    ...position?.offset,
                    y: -offsetY,
                },
                side: 'top',
            };
        }

        if (side === 'top' && !doesTopFit && doesBottomFit) {
            return {
                ...position,
                offset: {
                    ...position?.offset,
                    y: -offsetY,
                },
                side: 'bottom',
            };
        }

        return position;
    }, [anchorLayout, dropdownLayout, portalLayout, position]);

    const resolvedLayout = useMemo(
        () =>
            resolveDropdownLayout({
                anchorLayout,
                dropdownLayout,
                position: resolvedPosition,
                matchAnchorWidth,
            }),
        [anchorLayout, dropdownLayout, matchAnchorWidth, resolvedPosition],
    );

    const dropdownContent = useMemo(() => {
        if (!visible || !anchorLayout) return null;

        shouldMeasureDropdownRef.current = resolvedLayout == null;
        const measuringWidth = matchAnchorWidth
            ? { width: anchorLayout.width }
            : null;

        return (
            <View style={st.dropdownContent} pointerEvents="box-none">
                {dismissMode === 'outside-press' ? (
                    <Pressable style={st.dismissLayer} onPress={onClose} />
                ) : null}

                {resolvedLayout ? (
                    <View style={[st.surfaceWrapper, resolvedLayout]}>
                        <Animated.View
                            entering={entering}
                            exiting={exiting}
                            style={[st.surface, surfaceStyle]}
                        >
                            {children}
                        </Animated.View>
                    </View>
                ) : (
                    <View
                        style={[
                            st.surfaceWrapper,
                            st.surfaceMeasuringWrapper,
                            measuringWidth,
                        ]}
                    >
                        <View
                            onLayout={onDropdownLayout}
                            style={[st.surface, surfaceStyle]}
                        >
                            {children}
                        </View>
                    </View>
                )}
            </View>
        );
    }, [
        children,
        dismissMode,
        entering,
        exiting,
        anchorLayout,
        matchAnchorWidth,
        onClose,
        onDropdownLayout,
        st.dismissLayer,
        st.dropdownContent,
        st.surface,
        st.surfaceMeasuringWrapper,
        st.surfaceWrapper,
        resolvedLayout,
        surfaceStyle,
        visible,
    ]);

    useEffect(() => {
        if (!dropdownContent) {
            portal.hide(id);
            return;
        }

        portal.show(id, dropdownContent);

        return () => {
            portal.hide(id);
        };
    }, [dropdownContent, id, portal]);

    return null;
};
