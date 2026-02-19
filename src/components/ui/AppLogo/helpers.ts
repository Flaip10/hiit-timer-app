import type { AppTheme } from '@src/theme/theme';
import { colors } from '@src/theme/colors';
import {
    buildLightPalette,
    buildDarkPalette,
    COLOR_ACCENTS,
    CLASSIC_ACCENT,
} from '@src/theme/palette';

export type LogoMode = 'theme' | 'neutral-light' | 'neutral-dark';

export const resolveLogoColors = (params: {
    theme: AppTheme;
    mode: LogoMode;
    useOppositeTheme?: boolean; // if true, use the other theme's palette
}) => {
    const { theme, mode, useOppositeTheme = false } = params;

    if (mode === 'neutral-dark') {
        return {
            base: colors.gray[50],
            ink: colors.gray[900],
            accent: colors.gray[400],
        };
    }

    if (mode === 'neutral-light') {
        return {
            base: colors.gray.background,
            ink: colors.gray[100],
            accent: colors.gray[300],
        };
    }

    // mode === 'theme'
    const accentTokens =
        Object.values(COLOR_ACCENTS).find(
            (accent) => accent.tokens.primary === theme.palette.accent.primary
        )?.tokens ?? CLASSIC_ACCENT;

    const palette = useOppositeTheme
        ? theme.name === 'dark'
            ? buildLightPalette(accentTokens)
            : buildDarkPalette(accentTokens)
        : theme.palette;

    return {
        base: palette.background.primary,
        ink: palette.text.primary,
        accent: palette.accent.primary,
    };
};

export const degToRad = (deg: number) => ((deg - 90) * Math.PI) / 180;

export const polar = (cx: number, cy: number, r: number, deg: number) => {
    const t = degToRad(deg);
    return { x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) };
};

export const normalizeDeg = (deg: number) => ((deg % 360) + 360) % 360;

export const positiveSweepDeg = (startDeg: number, endDeg: number) =>
    (((endDeg - startDeg) % 360) + 360) % 360;
