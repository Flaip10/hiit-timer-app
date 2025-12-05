import { colors } from './colors';

export interface Palette {
    background: {
        primary: string; // whole-screen background
        card: string; // cards / panels
    };
    text: {
        primary: string;
        secondary: string;
        muted: string;
        inverted: string;
        danger: string;
        success: string;
        header: string; // titles / top bar text
    };
    border: {
        subtle: string;
        strong: string;
    };
    accent: {
        primary: string; // brand color (buttons, key actions)
        soft: string; // low-emphasis accent bg (chips, pills)
    };
    surface: {
        navigation: string; // top bar / bottom bar / drawers
    };
}

export const lightPalette: Palette = {
    background: {
        primary: colors.gray[50], // page bg
        card: '#FFFFFF', // clean white cards
    },
    text: {
        primary: colors.gray[900],
        secondary: colors.gray[600],
        muted: colors.gray[400],
        inverted: colors.gray[50],
        danger: colors.red[600],
        success: colors.emerald[600],
        header: colors.textHeader.light,
    },
    border: {
        subtle: colors.gray[200],
        strong: colors.gray[300],
    },
    accent: {
        primary: colors.violet[500], // main accent
        soft: colors.violet[300], // soft pill background
    },
    surface: {
        navigation: colors.navigation.light,
    },
};

export const darkPalette: Palette = {
    background: {
        primary: '#000000', // OLED black
        card: colors.gray[900], // slightly lifted dark card
    },
    text: {
        primary: colors.gray[50],
        secondary: colors.gray[200],
        muted: colors.gray[400],
        inverted: '#000000',
        danger: colors.red[300],
        success: colors.emerald[500],
        header: colors.textHeader.dark,
    },
    border: {
        subtle: colors.gray[800],
        strong: colors.gray[700],
    },
    accent: {
        primary: colors.violet[400], // a bit softer in dark mode
        soft: colors.gray[900], // subtle pill on dark bg
    },
    surface: {
        navigation: colors.navigation.dark,
    },
};
