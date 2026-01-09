import type { EdgeInsets } from 'react-native-safe-area-context';
import {
    buildLightPalette,
    buildDarkPalette,
    type ThemePalette,
    type AccentTokens,
} from './palette';
import { createLayout, type ThemeLayout } from './layout';
import { VIOLET_ACCENT } from './palette';

export type ThemeName = 'light' | 'dark';
export type ThemePreference = ThemeName | 'system';

export interface AppTheme {
    name: ThemeName;
    palette: ThemePalette;
    layout: ThemeLayout;
    uiScale: number;
    insets: EdgeInsets;
}

// Default for provider
export const DEFAULT_UI_SCALE = 1;

export const buildTheme = ({
    name,
    uiScale,
    insets,
    accent = VIOLET_ACCENT,
}: {
    name: ThemeName;
    uiScale: number;
    insets: EdgeInsets;
    accent?: AccentTokens;
}): AppTheme => {
    const palette =
        name === 'dark' ? buildDarkPalette(accent) : buildLightPalette(accent);

    return {
        name,
        palette,
        uiScale,
        layout: createLayout(uiScale),
        insets,
    };
};
