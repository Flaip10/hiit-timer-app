import { colors } from './colors';

export interface ThemePalette {
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
        datePill: {
            background: string;
            icon: string;
        };
    };
    overlay: {
        scrim: string;
    };
}

export type AccentId = 'violet' | 'cyan' | 'amber';

export interface AccentTokens {
    primary: string;
    primaryStrong: string;
    soft: string;
    surface: string;
    darkInk: string;
}

export interface AccentDefinition {
    id: AccentId;
    label: string;
    tokens: AccentTokens;
}

export const VIOLET_ACCENT: AccentTokens = {
    primary: colors.violet[400],
    primaryStrong: colors.violet[500],
    soft: colors.violet[300],
    surface: colors.violet[100],
    darkInk: colors.violet.dark,
};

export const CYAN_ACCENT: AccentTokens = {
    primary: colors.cyan[500],
    primaryStrong: colors.cyan[500],
    soft: colors.cyan[300],
    surface: colors.cyan[100],
    darkInk: colors.cyan.dark,
};

export const AMBER_ACCENT: AccentTokens = {
    primary: colors.amber[500],
    primaryStrong: colors.amber[500],
    soft: colors.amber[300],
    surface: colors.amber[100],
    darkInk: colors.amber.dark,
};

export const COLOR_ACCENTS: Record<AccentId, AccentDefinition> = {
    violet: {
        id: 'violet',
        label: 'Violet',
        tokens: VIOLET_ACCENT,
    },
    cyan: {
        id: 'cyan',
        label: 'Cyan',
        tokens: CYAN_ACCENT,
    },
    amber: {
        id: 'amber',
        label: 'Amber',
        tokens: AMBER_ACCENT,
    },
};

export const buildLightPalette = (accent: AccentTokens): ThemePalette => ({
    background: {
        primary: colors.white.main,
        card: accent.surface,
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
        primary: accent.primary,
        soft: accent.soft,
        surfaces: colors.gray[900],
    },
    button: {
        primary: accent.primary,
        secondary: accent.soft,
        danger: colors.red[300],
        text: {
            secondary: accent.darkInk,
        },
    },
    surface: {
        navigation: colors.navigation.light,
    },
    feedback: {
        errorBg: colors.red[50],
        errorBorder: colors.red[300],
        errorIcon: colors.red[600],
        errorText: colors.red[700],
    },
    metaCard: {
        container: {
            background: accent.surface,
            border: accent.soft,
        },
        topLeftContent: {
            background: accent.primary,
            border: accent.primary,
            text: colors.gray[50],
        },
        statusBadge: {
            background: accent.primaryStrong,
            text: colors.white.main,
        },
        actionButton: {
            background: accent.surface,
            border: accent.soft,
            icon: accent.primary,
        },
        actionStrip: {
            background: accent.soft,
            icon: accent.darkInk,
        },
        datePill: {
            background: accent.soft,
            icon: accent.darkInk,
        },
    },
    overlay: {
        scrim: colors.overlay.scrim,
    },
});

export const buildDarkPalette = (accent: AccentTokens): ThemePalette => ({
    background: {
        primary: colors.black.main,
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
        primary: accent.primary,
        soft: colors.gray[900],
        surfaces: colors.gray[900],
    },
    button: {
        primary: accent.primary,
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
        errorBg: colors.red.errorBgDark,
        errorBorder: colors.red[700],
        errorIcon: colors.red[300],
        errorText: colors.red[200],
    },
    metaCard: {
        container: {
            background: colors.gray.background,
            border: colors.gray.border,
        },
        topLeftContent: {
            background: accent.primary,
            border: accent.primary,
            text: colors.black.main,
        },
        statusBadge: {
            background: colors.gray[300],
            text: colors.black.main,
        },
        actionButton: {
            background: colors.gray.secondaryButton,
            border: colors.gray.border,
            icon: accent.primary,
        },
        actionStrip: {
            background: colors.gray.secondaryButton,
            icon: colors.red[500],
        },
        datePill: {
            background: colors.gray.secondaryButton,
            icon: colors.gray[50],
        },
    },
    overlay: {
        scrim: colors.overlay.scrim,
    },
});
