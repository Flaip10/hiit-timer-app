// src/theme/ThemeProvider.tsx

import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    AppTheme,
    ThemeName,
    ThemePreference,
    lightTheme,
    darkTheme,
} from './theme';

type ThemeContextValue = {
    theme: AppTheme;
    themeName: ThemeName;
    preference: ThemePreference;
    setPreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = 'app-theme-v1';

const getThemeObject = (name: ThemeName): AppTheme =>
    name === 'dark' ? darkTheme : lightTheme;

const normalizeScheme = (scheme: ColorSchemeName): ThemeName =>
    scheme === 'dark' ? 'dark' : 'light';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [systemScheme, setSystemScheme] = useState<ThemeName>('light');
    const [preference, setPreferenceState] =
        useState<ThemePreference>('system');

    // Track OS theme (for 'system' mode)
    useEffect(() => {
        const current = Appearance.getColorScheme();
        setSystemScheme(normalizeScheme(current));

        const sub = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemScheme(normalizeScheme(colorScheme));
        });

        return () => sub.remove();
    }, []);

    // Load persisted preference
    useEffect(() => {
        const load = async () => {
            try {
                const stored = await AsyncStorage.getItem(THEME_KEY);
                if (
                    stored === 'light' ||
                    stored === 'dark' ||
                    stored === 'system'
                ) {
                    setPreferenceState(stored);
                }
            } catch {
                // ignore, default is 'system'
            }
        };

        load();
    }, []);

    const setPreference = (pref: ThemePreference) => {
        setPreferenceState(pref);
        AsyncStorage.setItem(THEME_KEY, pref).catch(() => {});
    };

    // Resolve actual theme name from preference + system
    const themeName: ThemeName =
        preference === 'system' ? systemScheme : (preference as ThemeName);

    const theme = useMemo(() => getThemeObject(themeName), [themeName]);

    const value = useMemo(
        () => ({
            theme,
            themeName,
            preference,
            setPreference,
        }),
        [theme, themeName, preference]
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextValue => {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used inside ThemeProvider');
    }
    return ctx;
};
