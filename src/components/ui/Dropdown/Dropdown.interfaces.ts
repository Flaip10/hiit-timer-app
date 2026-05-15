import type { ReactNode, RefObject } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { View } from 'react-native';

export interface DropdownResolvedLayout {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    width?: number;
}

export interface DropdownLayout {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type DropdownDismissMode = 'outside-press' | 'pass-through';
export type DropdownSide = 'top' | 'right' | 'bottom' | 'left';
export type DropdownAlign = 'start' | 'center' | 'end';

export interface DropdownOffset {
    x?: number;
    y?: number;
}

export interface DropdownPosition {
    side?: DropdownSide;
    align?: DropdownAlign;
    offset?: DropdownOffset;
}

export interface ResolveDropdownLayoutArgs {
    anchorLayout: DropdownLayout | null;
    position?: DropdownPosition;
    windowWidth: number;
    matchAnchorWidth: boolean;
}

export interface DropdownProps {
    visible: boolean;
    children: ReactNode;
    onClose: () => void;
    anchorRef?: RefObject<View | null>;
    position?: DropdownPosition;
    matchAnchorWidth?: boolean;
    dismissMode?: DropdownDismissMode;
    surfaceStyle?: StyleProp<ViewStyle>;
}
