import type { EdgeInsets } from 'react-native-safe-area-context';
import { lightPalette, darkPalette, type ThemePalette } from './palette';
import { createLayout, type ThemeLayout } from './layout';

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
}: {
    name: ThemeName;
    uiScale: number;
    insets: EdgeInsets;
}): AppTheme => {
    const palette = name === 'dark' ? darkPalette : lightPalette;

    return {
        name,
        palette,
        uiScale,
        layout: createLayout(uiScale),
        insets,
    };
};
