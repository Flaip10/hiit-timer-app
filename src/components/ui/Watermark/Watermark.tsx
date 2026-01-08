import React from 'react';
import { useWindowDimensions, View, type ViewStyle } from 'react-native';

import {
    AppLogo,
    LOGO_CONTENT_INSETS_512,
    LOGO_VIEWBOX_SIZE,
} from '@src/components/ui/AppLogo/AppLogo';
import { useWatermarkStyles } from './Watermark.styles';

export type WatermarkMode = 'none' | 'subtle' | 'medium';
export type WatermarkPosition = 'center' | 'bottom-right' | 'bottom-left';

export interface WatermarkProps {
    watermarkMode?: WatermarkMode;

    /**
     * Target VISIBLE ink width (not the SVG box size).
     * If 'auto', it scales with screen width.
     */
    watermarkSize?: number | 'auto';

    /**
     * Multiplier applied to the visible watermark size.
     * Useful for subtle tuning without touching base size.
     * @default 1
     */
    sizeScale?: number;

    watermarkPosition?: WatermarkPosition;

    /**
     * Offsets as a percentage of the visible ink width.
     * Range [0..1]. (Clamped)
     */
    offsetX?: number;
    offsetY?: number;

    style?: ViewStyle;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const Watermark: React.FC<WatermarkProps> = ({
    watermarkMode = 'none',
    watermarkSize = 'auto',
    watermarkPosition = 'center',
    sizeScale = 1,
    offsetX = 0,
    offsetY = 0,
    style,
}) => {
    const { width } = useWindowDimensions();

    const baseVisibleWidth =
        watermarkSize === 'auto'
            ? Math.max(150, Math.min(400, width * 0.7))
            : watermarkSize;

    const visibleWidthPx = baseVisibleWidth * sizeScale;

    // Convert visible width to required square SVG box size
    const contentWidth512 =
        LOGO_VIEWBOX_SIZE -
        LOGO_CONTENT_INSETS_512.left -
        LOGO_CONTENT_INSETS_512.right;

    const contentWidthRatio = contentWidth512 / LOGO_VIEWBOX_SIZE;

    const logoBoxSizePx = Math.round(visibleWidthPx / contentWidthRatio);

    // Insets in px at this rendered size (to compensate padding)
    const scale = logoBoxSizePx / LOGO_VIEWBOX_SIZE;

    const insetsPx = {
        top: LOGO_CONTENT_INSETS_512.top * scale,
        right: LOGO_CONTENT_INSETS_512.right * scale,
        bottom: LOGO_CONTENT_INSETS_512.bottom * scale,
        left: LOGO_CONTENT_INSETS_512.left * scale,
    };

    // Offsets are % of visible width (positive pushes outward for bottom corners)
    const offsetXPx = clamp01(offsetX) * visibleWidthPx;
    const offsetYPx = clamp01(offsetY) * visibleWidthPx;

    // Base compensation to align the content to the chosen edge/center
    const baseOffset = (() => {
        switch (watermarkPosition) {
            case 'bottom-right':
                return {
                    // Negative values here push the box outside so the content sits on the edge
                    x: -(insetsPx.right + offsetXPx),
                    y: -(insetsPx.bottom + offsetYPx),
                };

            case 'bottom-left':
                return {
                    x: -(insetsPx.left + offsetXPx),
                    y: -(insetsPx.bottom + offsetYPx),
                };

            case 'center':
            default:
                return {
                    // Center the content (not the box), then allow user translate
                    x: (insetsPx.left - insetsPx.right) / 2 + offsetXPx,
                    y: (insetsPx.top - insetsPx.bottom) / 2 + offsetYPx,
                };
        }
    })();

    const st = useWatermarkStyles({
        watermarkPosition,
        offsetX: baseOffset.x,
        offsetY: baseOffset.y,
    });

    if (watermarkMode === 'none') return null;

    return (
        <View style={[st.watermarkContainer, style]} pointerEvents="none">
            <AppLogo size={logoBoxSizePx} watermarkMode={watermarkMode} />
        </View>
    );
};
