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
        surfaces: string;
    };
    button: {
        primary: string;
        secondary: string;
        danger: string;
        text: {
            secondary: string;
        };
    };
    surface: {
        navigation: string; // top bar / bottom bar / drawers
    };
    feedback: {
        errorBg: string;
        errorBorder: string;
        errorIcon: string;
        errorText: string;
    };
    metaCard: {
        container: {
            background: string;
            border: string;
        };
        topLeftContent: {
            background: string;
            border: string;
            text: string;
        };
        statusBadge: {
            background: string;
            text: string;
        };
        actionButton: {
            background: string;
            border: string;
            icon: string;
        };
        actionStrip: {
            background: string;
            icon: string;
        };
    };
    overlay: {
        scrim: string;
    };
}

export const lightPalette: Palette = {
    background: {
        primary: colors.gray[50],
        card: colors.violet[200],
    },
    text: {
        primary: colors.gray[900],
        secondary: colors.gray.text,
        muted: colors.gray[400],
        inverted: colors.gray[50],
        danger: colors.red.errorBgDark,
        success: colors.emerald[600],
        header: colors.textHeader.light,
    },
    border: {
        subtle: colors.gray[200],
        strong: colors.gray[300],
    },
    accent: {
        primary: colors.violet[400],
        soft: colors.violet[300],
        surfaces: colors.gray[900],
    },
    button: {
        primary: colors.violet[400],
        secondary: colors.violet[300],
        danger: colors.red[300],
        text: {
            secondary: colors.violet.dark,
        },
    },
    surface: {
        navigation: colors.navigation.light,
    },
    feedback: {
        errorBg: colors.red[50], // soft red background
        errorBorder: colors.red[300], // light red border
        errorIcon: colors.red[600], // strong red icon
        errorText: colors.red[700], // readable error text
    },
    metaCard: {
        container: {
            background: colors.violet[200],
            border: colors.violet[200],
        },
        topLeftContent: {
            background: colors.violet[400],
            border: colors.violet[400],
            text: colors.gray[50],
        },
        statusBadge: {
            background: colors.violet[500],
            text: colors.white.main,
        },
        actionButton: {
            background: colors.violet[200],
            border: colors.violet[300],
            icon: colors.violet[400],
        },
        actionStrip: {
            background: colors.violet[500],
            icon: colors.violet[300],
        },
    },
    overlay: {
        scrim: colors.overlay.scrim,
    },
};

export const darkPalette: Palette = {
    background: {
        primary: colors.black.main, // OLED black
        card: colors.gray.background,
    },
    text: {
        primary: colors.gray[50],
        secondary: colors.gray.text,
        muted: colors.gray[400],
        inverted: colors.black.main,
        danger: colors.gray[50],
        success: colors.emerald[500],
        header: colors.textHeader.dark,
    },
    border: {
        subtle: colors.gray.border,
        strong: colors.gray[700],
    },
    accent: {
        primary: colors.violet[400],
        soft: colors.gray[900],
        surfaces: colors.gray[900],
    },
    button: {
        primary: colors.violet[400],
        secondary: colors.gray.secondaryButton,
        danger: colors.red[600],
        text: {
            secondary: colors.gray[50],
        },
    },
    surface: {
        navigation: colors.navigation.dark,
    },
    feedback: {
        errorBg: colors.red.errorBgDark, // deep red background
        errorBorder: colors.red[700], // strong red border
        errorIcon: colors.red[300], // light red icon
        errorText: colors.red[200], // soft red text
    },
    metaCard: {
        container: {
            background: colors.gray.background,
            border: colors.gray.border,
        },
        topLeftContent: {
            background: colors.violet[400],
            border: colors.violet[400],
            text: colors.black.main,
        },
        statusBadge: {
            background: colors.violet[500],
            text: colors.gray[50],
        },
        actionButton: {
            background: colors.gray.secondaryButton,
            border: colors.gray.border,
            icon: colors.violet[400],
        },
        actionStrip: {
            background: colors.gray.secondaryButton,
            icon: colors.red[500],
        },
    },
    overlay: {
        scrim: colors.overlay.scrim,
    },
};
