import { Palette, lightPalette, darkPalette } from './palette';

export type ThemeName = 'light' | 'dark';
export type ThemePreference = ThemeName | 'system';

export interface AppTheme {
    name: 'light' | 'dark';
    palette: Palette;
}

export const lightTheme: AppTheme = {
    name: 'light',
    palette: lightPalette,
};

export const darkTheme: AppTheme = {
    name: 'dark',
    palette: darkPalette,
};
