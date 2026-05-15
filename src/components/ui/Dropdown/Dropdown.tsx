import {
    useEffect,
    useId,
    useMemo,
    useState,
} from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
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
    const { width: windowWidth } = useWindowDimensions();
    const [anchorLayout, setAnchorLayout] = useState<DropdownLayout | null>(
        null,
    );
    const entering = useMemo(() => FadeIn.duration(120), []);
    const exiting = useMemo(() => FadeOut.duration(90), []);

    useEffect(() => {
        if (!visible || !anchorRef) return;

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

    const resolvedLayout = useMemo(
        () =>
            resolveDropdownLayout({
                anchorLayout,
                position,
                windowWidth,
                matchAnchorWidth,
            }),
        [anchorLayout, matchAnchorWidth, position, windowWidth],
    );

    const dropdownContent = useMemo(() => {
        if (!visible || !resolvedLayout) return null;

        return (
            <View style={st.dropdownContent} pointerEvents="box-none">
                {dismissMode === 'outside-press' ? (
                    <Pressable style={st.dismissLayer} onPress={onClose} />
                ) : null}

                <Animated.View
                    entering={entering}
                    exiting={exiting}
                    style={[st.surface, resolvedLayout, surfaceStyle]}
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
        onClose,
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
