export const colors = {
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
        headerLight: '#1F2937',
        headerDark: '#F3F4F6',
    },

    navigation: {
        light: '#FFFFFF',
        dark: '#111827',
    },
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
        500: '#EF4444',
        600: '#DC2626',
        300: '#FCA5A5',
    },

    violet: {
        500: '#4F46E5',
        300: '#EEF2FF',
        400: '#818CF8',
    },
} as const;

export type Colors = typeof colors;
