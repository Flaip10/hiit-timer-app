import type { TextStyle } from 'react-native';
import type { AppTheme } from './theme';

export type TextVariant =
    | 'title1'
    | 'title2'
    | 'subtitle'
    | 'body'
    | 'bodySmall'
    | 'caption';

type TypographyMap = Record<TextVariant, TextStyle>;

/**
 * Theme is passed in so we *can* use it later (e.g. fontFamily per theme),
 * but right now we keep typography purely structural (no colors).
 */
export const createTypography = (_theme: AppTheme): TypographyMap => ({
    title1: {
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 32,
        letterSpacing: 0.2,
    },
    title2: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
        letterSpacing: 0.15,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
        letterSpacing: 0.1,
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 22,
        letterSpacing: 0.1,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0,
    },
});
