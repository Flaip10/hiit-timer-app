import type { TextStyle } from 'react-native';
import type { AppTheme } from './theme';

export type TextVariant =
    | 'title1'
    | 'title2'
    | 'subtitle'
    | 'body'
    | 'bodySmall'
    | 'caption'
    | 'label';

type TypographyMap = Record<TextVariant, TextStyle>;

/**
 * Theme is passed in so we *can* use it later (e.g. fontFamily per theme),
 * but right now we keep typography purely structural (no colors).
 */
export const createTypography = (_theme: AppTheme): TypographyMap => ({
    title1: {
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 24,
        letterSpacing: 0.2,
    },
    title2: {
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 18,
        letterSpacing: 0.15,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 16,
        letterSpacing: 0.1,
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 18,
        letterSpacing: 0.1,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 12,
        letterSpacing: 0,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 15,
        letterSpacing: 0.05,
    },
});
