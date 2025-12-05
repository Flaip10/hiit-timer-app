import { colors } from './colors';

export interface Palette {
    background: {
        primary: string;
        card: string;
    };
    text: {
        primary: string;
        secondary: string;
        muted: string;
        inverted: string;
        danger: string;
        success: string;
    };
    border: {
        subtle: string;
        strong: string;
    };
    accent: {
        primary: string;
        soft: string;
    };
}

export const lightPalette: Palette = {
    background: {
        primary: colors.gray[50],
        card: colors.gray[100],
    },
    text: {
        primary: colors.gray[900],
        secondary: colors.gray[600],
        muted: colors.gray[400],
        inverted: colors.gray[50],
        danger: colors.red[600],
        success: colors.emerald[600],
    },
    border: {
        subtle: colors.gray[200],
        strong: colors.gray[300],
    },
    accent: {
        primary: colors.violet[500],
        soft: colors.violet[300],
    },
};

export const darkPalette: Palette = {
    background: {
        primary: colors.gray[950],
        card: colors.gray[900],
    },
    text: {
        primary: colors.gray[50],
        secondary: colors.gray[200],
        muted: colors.gray[400],
        inverted: colors.gray[950],
        danger: colors.red[300],
        success: colors.emerald[500],
    },
    border: {
        subtle: colors.gray[800],
        strong: colors.gray[700],
    },
    accent: {
        primary: colors.violet[400],
        soft: colors.gray[900],
    },
};
