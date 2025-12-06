import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface ScreenSectionProps {
    title?: string;
    rightAccessory?: ReactNode;
    children: ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
    topSpacing?: number; // optional override for marginTop
}
