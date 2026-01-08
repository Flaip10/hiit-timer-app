import React, { useMemo } from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

import { useTheme } from '@src/theme/ThemeProvider';

import type { LogoMode } from './helpers';
import {
    normalizeDeg,
    polar,
    positiveSweepDeg,
    resolveLogoColors,
} from './helpers';

interface AppLogoProps {
    size?: number;

    logoMode?: LogoMode;

    withBackground?: boolean;
    /**
     * If omitted, it scales with size (same shape regardless of render size).
     * If provided, it overrides the proportional radius.
     */
    bgRadius?: number;
    bgColor?: string;

    splitDeg?: number;

    separatorGapDeg?: number;
    separatorGapPx?: number;

    useOppositeTheme?: boolean;

    watermarkMode?: 'none' | 'subtle' | 'medium';

    // Manual overrides (optional)
    darkColor?: string;
    progressColor?: string;
}

/**
 * Empty insets between the 512×512 SVG viewBox and the painted logo geometry.
 *
 * The logo paths do not fill the viewBox:
 * - Horizontal margins are equal (outer radius = 200)
 * - Vertical margins differ due to the downward center shift (cy = 300)
 *
 * Used to derive proportional visual offsets (e.g. for watermarks).
 * Must be updated if the SVG geometry changes.
 */
export const LOGO_CONTENT_INSETS_512 = {
    top: 100,
    right: 56,
    bottom: 112,
    left: 56,
} as const;

export const LOGO_VIEWBOX_SIZE = 512;

// Fixed geometry (final SVG geometry)
const OUTER_CX = 256;
const OUTER_CY = 300;
const OUTER_R_OUT = 200;
const OUTER_R_IN = 155;

const DARK_START_DEG = 240;
const PROGRESS_END_DEG = 120;

// Your previous default bgRadius=26 when size=128 -> keep the same ratio.
const DEFAULT_BG_RADIUS_AT_128 = 26;
const DEFAULT_BG_RADIUS_RATIO = DEFAULT_BG_RADIUS_AT_128 / 128;

const arcRingPath = (params: {
    cx: number;
    cy: number;
    rOuter: number;
    rInner: number;
    startDeg: number;
    endDeg: number;
}) => {
    const { cx, cy, rOuter, rInner, startDeg, endDeg } = params;

    const sweep = positiveSweepDeg(startDeg, endDeg);
    const largeArcFlag: 0 | 1 = sweep > 180 ? 1 : 0;

    const p0 = polar(cx, cy, rOuter, startDeg);
    const p1 = polar(cx, cy, rOuter, endDeg);
    const p2 = polar(cx, cy, rInner, endDeg);
    const p3 = polar(cx, cy, rInner, startDeg);

    return [
        `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`,
        `A ${rOuter.toFixed(2)} ${rOuter.toFixed(2)} 0 ${largeArcFlag} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
        `L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
        `A ${rInner.toFixed(2)} ${rInner.toFixed(2)} 0 ${largeArcFlag} 0 ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
        `Z`,
    ].join(' ');
};

export const AppLogo: React.FC<AppLogoProps> = ({
    size = 128,

    logoMode,

    withBackground = false,
    bgRadius,
    bgColor,

    splitDeg = 33,

    separatorGapDeg = 8,
    separatorGapPx = 6,

    useOppositeTheme = false,

    watermarkMode = 'none',

    darkColor,
    progressColor,
}: AppLogoProps) => {
    const { theme } = useTheme();

    const isWatermark = watermarkMode !== 'none';

    const resolvedWithBackground = isWatermark ? false : withBackground;

    const watermarkOpacity =
        watermarkMode === 'subtle'
            ? theme.name === 'dark'
                ? 0.2
                : 0.17
            : watermarkMode === 'medium'
              ? theme.name === 'dark'
                  ? 0.23
                  : 0.2
              : 1;

    const resolvedLogoMode: LogoMode = isWatermark
        ? theme.name === 'dark'
            ? 'neutral-light'
            : 'neutral-dark'
        : (logoMode ?? 'theme');

    const { ink, accent, base } = resolveLogoColors({
        theme,
        mode: resolvedLogoMode,
        useOppositeTheme,
    });

    const resolvedBgColor = bgColor ?? base;
    const resolvedDarkColor = darkColor ?? ink;
    const resolvedProgressColor = progressColor ?? accent;

    const defaultScaledRadius = Math.round(size * DEFAULT_BG_RADIUS_RATIO);
    const resolvedBgRadius = bgRadius ?? defaultScaledRadius;

    // Convert px gap to degrees using midline radius: arc length s = r * theta
    const midRadius = (OUTER_R_OUT + OUTER_R_IN) / 2;
    const gapDegFromPx =
        separatorGapPx > 0 ? (separatorGapPx / midRadius) * (180 / Math.PI) : 0;

    const totalGapDeg = Math.max(0, separatorGapDeg + gapDegFromPx);
    const halfGap = totalGapDeg / 2;

    // Gap is centered at splitDeg -> move BOTH sides by half-gap
    const darkEndDeg = normalizeDeg(splitDeg - halfGap);
    const progressStartDeg = normalizeDeg(splitDeg + halfGap);

    const { darkOuterPath, progressOuterPath } = useMemo(() => {
        return {
            darkOuterPath: arcRingPath({
                cx: OUTER_CX,
                cy: OUTER_CY,
                rOuter: OUTER_R_OUT,
                rInner: OUTER_R_IN,
                startDeg: DARK_START_DEG,
                endDeg: darkEndDeg,
            }),
            progressOuterPath: arcRingPath({
                cx: OUTER_CX,
                cy: OUTER_CY,
                rOuter: OUTER_R_OUT,
                rInner: OUTER_R_IN,
                startDeg: progressStartDeg,
                endDeg: PROGRESS_END_DEG,
            }),
        };
    }, [darkEndDeg, progressStartDeg]);

    // Inner path: kept literal (final SVG)
    const innerPath = `M 141.06,301.06
         A 100.00,100.00 0 1 1 370.94,301.06
         L 346.21,300
         A 100.00,60.00 0 0 0 165.79,300
         Z`;

    return (
        <Svg
            width={size}
            height={size}
            viewBox={`0 0 ${LOGO_VIEWBOX_SIZE} ${LOGO_VIEWBOX_SIZE}`}
            // Only clip/round when we actually render a rounded background.
            style={
                resolvedWithBackground
                    ? {
                          borderRadius: resolvedBgRadius,
                          opacity: watermarkOpacity,
                      }
                    : watermarkOpacity !== 1
                      ? { opacity: watermarkOpacity }
                      : undefined
            }
        >
            {resolvedWithBackground && (
                <Rect
                    width={LOGO_VIEWBOX_SIZE}
                    height={LOGO_VIEWBOX_SIZE}
                    rx={LOGO_VIEWBOX_SIZE * DEFAULT_BG_RADIUS_RATIO}
                    ry={LOGO_VIEWBOX_SIZE * DEFAULT_BG_RADIUS_RATIO}
                    fill={resolvedBgColor}
                />
            )}

            <Path d={darkOuterPath} fill={resolvedDarkColor} />
            <Path d={progressOuterPath} fill={resolvedProgressColor} />
            <Path d={innerPath} fill={resolvedDarkColor} />
        </Svg>
    );
};
