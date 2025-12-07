import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
    AppTheme,
    ThemeName,
    ThemePreference,
    buildTheme,
    DEFAULT_UI_SCALE,
} from './theme';

const THEME_KEY = 'app-theme-v1';

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

    const [systemTheme, setSystemTheme] = useState<ThemeName>('light');
    const [preference, setPreferenceState] =
        useState<ThemePreference>('system');

    // Track OS theme
    useEffect(() => {
        setSystemTheme(normalize(Appearance.getColorScheme()));

        const sub = Appearance.addChangeListener(({ colorScheme }) =>
            setSystemTheme(normalize(colorScheme))
        );

        return () => sub.remove();
    }, []);

    // Load user preference
    useEffect(() => {
        AsyncStorage.getItem(THEME_KEY).then((stored) => {
            if (!stored) return;
            if (
                stored === 'light' ||
                stored === 'dark' ||
                stored === 'system'
            ) {
                setPreferenceState(stored);
            }
        });
    }, []);

    const setPreference = (p: ThemePreference) => {
        setPreferenceState(p);
        AsyncStorage.setItem(THEME_KEY, p).catch(() => {});
    };

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
