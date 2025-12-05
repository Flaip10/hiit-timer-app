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
    },
    slate: {
        900: '#020617',
    },
    emerald: {
        500: '#22C55E',
    },
    orange: {
        500: '#F97316',
    },
    red: {
        500: '#EF4444',
    },
} as const;

export type Colors = typeof colors;
