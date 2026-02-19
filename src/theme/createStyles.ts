import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import type { AppTheme } from './theme';
import { useTheme } from './ThemeProvider';

type NamedStyles<T> = {
    [K in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

// 1) Overload surface type
export interface CreateStyles {
    // theme-only
    <T extends NamedStyles<T>>(styleFactory: (theme: AppTheme) => T): () => T;

    // theme + props
    <T extends NamedStyles<T>, P>(
        styleFactory: (theme: AppTheme, props: P) => T
    ): (props: P) => T;
}

// 2) Single arrow implementation
const _createStyles = <T extends NamedStyles<T>, P>(
    styleFactory: (theme: AppTheme, props?: P) => T
) => {
    return (props?: P) => {
        const { theme } = useTheme();

        return useMemo(
            () => StyleSheet.create(styleFactory(theme, props)),
            [theme, props]
        );
    };
};

// 3) Export with the overloaded type
export const createStyles: CreateStyles = _createStyles as CreateStyles;
