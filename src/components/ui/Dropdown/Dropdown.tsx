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
    const entering = useMemo(() => FadeIn.duration(120), []);
    const exiting = useMemo(() => FadeOut.duration(90), []);

    useEffect(() => {
        if (!visible) return;

        anchorRef.current?.measureInWindow(
            (x: number, y: number, width: number, height: number) => {
                setAnchorLayout({
                    x,
                    y,
                    width,
                    height,
                });
            },
        );
    }, [anchorRef, visible]);

    useEffect(() => {
        if (visible) return;

        setAnchorLayout(null);
        setDropdownLayout(null);
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

    const resolvedLayout = useMemo(
        () =>
            resolveDropdownLayout({
                anchorLayout,
                dropdownLayout,
                position,
                matchAnchorWidth,
            }),
        [anchorLayout, dropdownLayout, matchAnchorWidth, position],
    );

    const dropdownContent = useMemo(() => {
        if (!visible || !anchorLayout) return null;

        const surfaceLayout = resolvedLayout ?? {
            opacity: 0,
            top: 0,
            left: 0,
            width: matchAnchorWidth ? anchorLayout.width : undefined,
        };

        shouldMeasureDropdownRef.current = resolvedLayout == null;

        return (
            <View style={st.dropdownContent} pointerEvents="box-none">
                {dismissMode === 'outside-press' ? (
                    <Pressable style={st.dismissLayer} onPress={onClose} />
                ) : null}

                <Animated.View
                    entering={entering}
                    exiting={exiting}
                    onLayout={onDropdownLayout}
                    style={[st.surface, surfaceLayout, surfaceStyle]}
                >
                    {children}
                </Animated.View>
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
