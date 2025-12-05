import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface ActionStripProps {
    icon?: ReactNode;
    backgroundColor?: string;
    onPress?: () => void;
}

export interface StatusBadgeProps {
    label?: string;
    icon?: ReactNode;
    backgroundColor?: string;
    color?: string;
}

export interface ActionButtonProps {
    icon?: ReactNode;
    backgroundColor?: string;
    onPress?: () => void;
}

export interface TopLeftContentProps {
    text?: string;
    backgroundColor?: string;
    color?: string;
    borderColor?: string;
}

export interface MetaCardProps {
    /**
     * Optional style for the card container
     */
    containerStyle?: StyleProp<ViewStyle>;
    /**
     * The main content of the card
     */
    children: ReactNode;
    /**
     * Optional date to display in the pill format
     */
    date?: string | null;
    /**
     * Optional top left content to display in the card
     */
    topLeftContent?: TopLeftContentProps;
    /**
     * Optional status badge content
     */
    statusBadge?: StatusBadgeProps;
    /**
     * Optional action strip configuration
     */
    actionStrip?: ActionStripProps;
    /**
     * Optional action button configuration
     */
    actionButton?: ActionButtonProps;
    /**
     * Optional secondary action button configuration
     */
    secondaryActionButton?: ActionButtonProps;
    /**
     * Optional press handler for the entire card
     */
    onPress?: () => void;
    /**
     * Optional min height for the collapse area
     */
    minHeight?: number;
    /**
     * Optional bottom fade for the collapse
     */
    withBottomFade?: boolean;
    /**
     * Optional expandable flag for the card
     */
    expandable?: boolean;
    /**
     * Optional hide hours flag for the date
     */
    hideHours?: boolean;
    /**
     * Optional image url to display in the card
     */
    imageUrl?: string;
}
