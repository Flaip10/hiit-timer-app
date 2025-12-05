import { colors } from './colors';

export interface Palette {
    background: string;
    surface: string;
    surfaceAlt: string;
    borderSubtle: string;

    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    accent: string;
    accentSoft: string;
    danger: string;
    dangerSoft: string;

    chipBg: string;
    chipText: string;
}

export const lightPalette: Palette = {
    background: colors.gray[50],
    surface: '#FFFFFF',
    surfaceAlt: colors.gray[100],
    borderSubtle: colors.gray[200],

    textPrimary: colors.gray[900],
    textSecondary: colors.gray[600],
    textMuted: colors.gray[400],

    accent: colors.emerald[500],
    accentSoft: 'rgba(34, 197, 94, 0.12)',
    danger: colors.red[500],
    dangerSoft: 'rgba(239, 68, 68, 0.12)',

    chipBg: colors.gray[200],
    chipText: colors.gray[900],
};

export const darkPalette: Palette = {
    background: colors.slate[900],
    surface: colors.gray[900],
    surfaceAlt: colors.gray[950],
    borderSubtle: colors.gray[800],

    textPrimary: colors.gray[50],
    textSecondary: colors.gray[400],
    textMuted: colors.gray[500],

    accent: colors.emerald[500],
    accentSoft: 'rgba(34, 197, 94, 0.24)',
    danger: colors.orange[500],
    dangerSoft: 'rgba(249, 115, 22, 0.24)',

    chipBg: colors.gray[800],
    chipText: colors.gray[50],
};
