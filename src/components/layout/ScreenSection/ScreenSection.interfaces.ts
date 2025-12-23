import type React from 'react';
import type { ViewStyle } from 'react-native';

export type ScreenSectionTopSpacing = 'none' | 'small' | 'medium' | 'large';

export interface ScreenSectionProps {
    title?: string;
    rightAccessory?: React.ReactNode;
    children?: React.ReactNode;
    contentContainerStyle?: ViewStyle;
    containerStyle?: ViewStyle;
    topSpacing?: ScreenSectionTopSpacing;
    gap?: number;
    flex?: boolean;
}
