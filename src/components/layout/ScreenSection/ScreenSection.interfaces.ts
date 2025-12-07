import type React from 'react';
import type { ViewStyle } from 'react-native';

export type ScreenSectionTopSpacing = 'none' | 'small' | 'medium' | 'large';

export interface ScreenSectionProps {
    title?: string;
    rightAccessory?: React.ReactNode;
    children: React.ReactNode;
    containerStyle?: ViewStyle;
    topSpacing?: ScreenSectionTopSpacing;
}
