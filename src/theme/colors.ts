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
        border: '#1F1F23',
        text: '#A1A1AA',
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
        300: '#dfe2fc',
        200: '#EEF2FF', // subtle background / chip
        100: '#f9fbff',
        dark: '#171544',
    },

    cyan: {
        600: '#0891B2',
        500: '#06B6D4', // main brand accent (light mode)
        400: '#22D3EE', // softer accent (dark mode)
        300: '#CFFAFE',
        200: '#E0F7FA', // subtle background / chip
        100: '#f9fbfb',
        dark: '#083344',
    },
    amber: {
        600: '#D97706',
        500: '#F59E0B', // main brand accent (light mode)
        400: '#FBBF24', // softer accent (dark mode)
        300: '#FEF3C7',
        200: '#FFFBEB', // subtle background / chip
        100: '#fafafa',
        dark: '#612a0b',
    },
    classic: {
        600: '#B8956A',
        500: '#D7C19A', // main brand accent
        400: '#E5D4B0', // softer accent
        300: '#F0E6D2',
        200: '#F6F3EB', // subtle background / chip
        100: '#FAF8F4',
        dark: '#23272A',
    },
    neutral: {
        600: '#4B5563',
        500: '#6B7280', // main brand accent
        400: '#9CA3AF', // softer accent
        300: '#D1D5DB',
        200: '#E5E7EB', // subtle background / chip
        100: '#F3F4F6',
        dark: '#111827',
    },
    overlay: {
        scrim: 'rgba(0,0,0,0.45)',
    },
} as const;

export type Colors = typeof colors;
