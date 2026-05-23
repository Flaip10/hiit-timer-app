import { colors } from './colors';

export interface ThemePalette {
    background: {
        primary: string; // whole-screen background
        card: string; // cards / panels
        error: string;
    };
    text: {
        primary: string;
        secondary: string;
        muted: string;
        inverted: string;
        error: string;
        success: string;
        header: string; // titles / top bar text
    };
    border: {
        subtle: string;
        strong: string;
        error: string;
    };
    icon: {
        error: string;
    };
    accent: AccentTokens;
    button: {
        primary: string;
        secondary: string;
        danger: string;
        text: {
            secondary: string;
            danger: string;
        };
    };
    surface: {
        navigation: string; // top bar / bottom bar / drawers
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
    fieldLabel: {
        icon: string;
        iconBackground: string;
    };
    overlay: {
        scrim: string;
    };
}

export type AccentId = 'classic' | 'violet' | 'cyan' | 'amber' | 'neutral';

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

export const CLASSIC_ACCENT: AccentTokens = {
    primary: colors.classic[500],
    primaryStrong: colors.classic[600],
    soft: colors.classic[300],
    surface: colors.classic[100],
    darkInk: colors.classic.dark,
};

export const NEUTRAL_ACCENT: AccentTokens = {
    primary: colors.neutral[500],
    primaryStrong: colors.neutral[600],
    soft: colors.neutral[300],
    surface: colors.neutral[100],
    darkInk: colors.neutral.dark,
};

export const COLOR_ACCENTS: Record<AccentId, AccentDefinition> = {
    classic: {
        id: 'classic',
        label: 'Classic',
        tokens: CLASSIC_ACCENT,
    },
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
    neutral: {
        id: 'neutral',
        label: 'Neutral',
        tokens: NEUTRAL_ACCENT,
    },
};

export const buildLightPalette = (accent: AccentTokens): ThemePalette => ({
    background: {
        primary: colors.white.main,
        card: colors.gray[100],
        error: colors.red[50],
    },
    text: {
        primary: colors.gray[900],
        secondary: colors.gray[500],
        muted: colors.gray[400],
        inverted: colors.gray[50],
        error: colors.red[700],
        success: colors.emerald[600],
        header: colors.textHeader.light,
    },
    border: {
        subtle: colors.gray[200],
        strong: colors.gray[300],
        error: colors.red[300],
    },
    icon: {
        error: colors.red[600],
    },
    accent: {
        primary: accent.primary,
        primaryStrong: accent.primaryStrong,
        soft: colors.gray[200],
        surface: colors.gray[100],
        darkInk: accent.darkInk,
    },
    button: {
        primary: accent.primary,
        secondary: colors.gray[200],
        danger: colors.red[500],
        text: {
            secondary: colors.gray[900],
            danger: colors.white.main,
        },
    },
    surface: {
        navigation: colors.navigation.light,
    },
    metaCard: {
        container: {
            background: colors.gray[100],
            border: colors.gray[200],
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
            background: colors.gray[100],
            border: colors.gray[200],
            icon: accent.primary,
        },
        actionStrip: {
            background: colors.gray[200],
            icon: colors.red[600],
        },
        datePill: {
            background: colors.gray[200],
            icon: colors.gray[700],
        },
    },
    fieldLabel: {
        icon: accent.primary,
        iconBackground: colors.gray[100],
    },
    overlay: {
        scrim: colors.overlay.scrim,
    },
});

export const buildDarkPalette = (accent: AccentTokens): ThemePalette => ({
    background: {
        primary: colors.black.main,
        card: colors.gray.background,
        error: colors.red.errorBgDark,
    },
    text: {
        primary: colors.gray[50],
        secondary: colors.gray.text,
        muted: colors.gray[400],
        inverted: colors.black.main,
        error: colors.red[200],
        success: colors.emerald[500],
        header: colors.textHeader.dark,
    },
    border: {
        subtle: colors.gray.border,
        strong: colors.gray[700],
        error: colors.red[700],
    },
    icon: {
        error: colors.red[300],
    },
    accent: {
        primary: accent.primary,
        primaryStrong: accent.primaryStrong,
        soft: colors.gray[900],
        surface: colors.gray[900],
        darkInk: accent.darkInk,
    },
    button: {
        primary: accent.primary,
        secondary: colors.gray.secondaryButton,
        danger: colors.red[600],
        text: {
            secondary: colors.gray[50],
            danger: colors.white.main,
        },
    },
    surface: {
        navigation: colors.navigation.dark,
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
    fieldLabel: {
        icon: accent.primary,
        iconBackground: colors.gray[900],
    },
    overlay: {
        scrim: colors.overlay.scrim,
    },
});
