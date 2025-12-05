import { useMemo } from 'react';
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import type { AppTheme } from './theme';
import { useTheme } from './ThemeProvider';

// Same pattern as React Native's StyleSheet.NamedStyles
type NamedStyles<T> = {
    [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

export const createStyles = <T extends NamedStyles<T>>(
    styleFactory: (theme: AppTheme) => T
) => {
    return () => {
        const { theme } = useTheme();

        // StyleSheet.create keeps literals like 'row' narrow,
        // and also validates against ViewStyle/TextStyle/ImageStyle.
        return useMemo(() => StyleSheet.create(styleFactory(theme)), [theme]);
    };
};
