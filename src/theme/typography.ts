import type { TextStyle } from 'react-native';
import type { AppTheme } from './theme';
import { useFonts } from 'expo-font';
import { DaysOne_400Regular } from '@expo-google-fonts/days-one';

export const useAppFonts = () => {
    return useFonts({
        'DaysOne-Regular': DaysOne_400Regular,
    });
};

export type TextVariant =
    | 'title1'
    | 'title2'
    | 'title3'
    | 'subtitle'
    | 'body'
    | 'bodySmall'
    | 'caption'
    | 'captionSmall'
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
        // lineHeight: 24,
        letterSpacing: 0.2,
    },
    title2: {
        fontSize: 20,
        fontWeight: '700',
        // lineHeight: 20,
        letterSpacing: 0.17,
    },
    title3: {
        fontSize: 18,
        fontWeight: '700',
        // lineHeight: 18,
        letterSpacing: 0.15,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        // lineHeight: 16,
        letterSpacing: 0.1,
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
        // lineHeight: 18,
        letterSpacing: 0.1,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400',
        // lineHeight: 16,
        letterSpacing: 0,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
        // lineHeight: 12,
        letterSpacing: 0,
    },
    captionSmall: {
        fontSize: 11,
        fontWeight: '400',
        // lineHeight: 11,
        letterSpacing: 0,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        // lineHeight: 14,
        letterSpacing: 0.05,
    },
});
