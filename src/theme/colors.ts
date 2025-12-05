export const colors = {
    black: { main: '#000000' },
    white: { main: '#FFFFFF' },

    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
        950: '#020617',
        secondaryButton: '#1C1C1F',
        background: '#131316',
    },

    // Neutral “surfaces” we often reuse
    navigation: {
        light: '#FFFFFF',
        dark: '#000000',
    },

    // “Header text” bases – palette maps them
    textHeader: {
        light: '#1F2937',
        dark: '#F3F4F6',
    },

    slate: {
        900: '#020617',
    },

    emerald: {
        500: '#22C55E',
        600: '#16A34A',
    },
    red: {
        50: '#FEF2F2',
        200: '#FECACA',
        300: '#FCA5A5',
        500: '#EF4444',
        600: '#DC2626',
        700: '#B91C1C',
        errorBgDark: '#451A1A',
    },

    violet: {
        600: '#2f2a89',
        500: '#4F46E5', // main brand accent (light mode)
        400: '#818CF8', // softer accent (dark mode)
        300: '#dcdffc',
        200: '#EEF2FF', // subtle background / chip
        dark: '#171544',
    },

    cyan: {
        500: '#06B6D4',
        300: '#CFFAFE',
    },
    amber: {
        500: '#F59E0B',
        300: '#FEF3C7',
    },
} as const;

export type Colors = typeof colors;
