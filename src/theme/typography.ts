import type { TextStyle } from 'react-native';

export type TextVariant =
    | 'display'
    | 'title'
    | 'subtitle'
    | 'body'
    | 'bodySmall'
    | 'caption'
    | 'overline';

export const typography: Record<TextVariant, TextStyle> = {
    display: {
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 32,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 24,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 20,
    },
    body: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
    },
    bodySmall: {
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 18,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.2,
    },
    overline: {
        fontSize: 11,
        fontWeight: '600',
        lineHeight: 14,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
};
