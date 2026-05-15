import type { IconId } from '@src/components/ui/Icon/AppIcon';

export type TopBarLeftMode = 'auto' | 'back' | 'drawer' | 'none';

export interface TopBarOption {
    id: string;
    label: string;
    icon?: IconId;
    destructive?: boolean;
    disabled?: boolean;
    onPress: () => void;
}

export interface TopBarProps {
    title?: string;
    leftMode?: TopBarLeftMode;
    options?: readonly TopBarOption[];
}

export interface TopPillPathParams {
    h: number;

    // independent (text container width)
    middleW: number;

    // proportional to height (side curvature zone)
    // if omitted, defaults to 2*h (matches your 80 when h=40)
    sideW?: number;

    // curve ratios inside sideW (from your template)
    cpTopRatio?: number; // 44/80
    cpBottomRatio?: number; // 41/80
}
