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

export const createTypography = (theme: AppTheme): TypographyMap => ({
    title1: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: 0.2,
        color: theme.palette.text.primary,
    },
    title2: {
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: 0.15,
        color: theme.palette.text.primary,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.1,
        color: theme.palette.text.secondary,
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
        letterSpacing: 0.1,
        color: theme.palette.text.primary,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400',
        letterSpacing: 0,
        color: theme.palette.text.secondary,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
        letterSpacing: 0,
        color: theme.palette.text.muted,
    },
});
