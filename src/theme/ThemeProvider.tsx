import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppTheme, ThemeName, ThemePreference } from './theme';
import { buildTheme, DEFAULT_UI_SCALE } from './theme';

import { useSettingsStore } from '@src/state/useSettingsStore';

type ThemeContextValue = {
    theme: AppTheme;
    themeName: ThemeName;
    preference: ThemePreference;
    setPreference: (p: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const normalize = (scheme: ColorSchemeName): ThemeName =>
    scheme === 'dark' ? 'dark' : 'light';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const insets = useSafeAreaInsets();

    const preference = useSettingsStore((s) => s.themePreference);
    const setPreference = useSettingsStore((s) => s.setThemePreference);

    const [systemTheme, setSystemTheme] = useState<ThemeName>('light');

    useEffect(() => {
        setSystemTheme(normalize(Appearance.getColorScheme()));

        const sub = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemTheme(normalize(colorScheme));
        });

        return () => sub.remove();
    }, []);

    const themeName: ThemeName =
        preference === 'system' ? systemTheme : preference;

    const theme = useMemo<AppTheme>(
        () =>
            buildTheme({
                name: themeName,
                uiScale: DEFAULT_UI_SCALE,
                insets,
            }),
        [themeName, insets]
    );

    return (
        <ThemeContext.Provider
            value={{ theme, themeName, preference, setPreference }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
    return ctx;
};
