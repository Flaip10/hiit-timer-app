import { lightPalette, darkPalette, type ThemePalette } from './palette';
import { createLayout, type ThemeLayout } from './layout';

export type ThemeName = 'light' | 'dark';
export type ThemePreference = ThemeName | 'system';

export interface AppTheme {
    name: ThemeName;
    palette: ThemePalette;
    layout: ThemeLayout;
    /**
     * Global density / size factor.
     * 1 = default, >1 = more spacious / larger, <1 = more compact.
     */
    uiScale: number;
}

const DEFAULT_UI_SCALE = 1;

export const lightTheme: AppTheme = {
    name: 'light',
    palette: lightPalette,
    uiScale: DEFAULT_UI_SCALE,
    layout: createLayout(DEFAULT_UI_SCALE),
};

export const darkTheme: AppTheme = {
    name: 'dark',
    palette: darkPalette,
    uiScale: DEFAULT_UI_SCALE,
    layout: createLayout(DEFAULT_UI_SCALE),
};
