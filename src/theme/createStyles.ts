import { useMemo } from 'react';
import type { AppTheme } from './theme';
import { useTheme } from './ThemeProvider';

export const createStyles = <T extends object>(
    styleFactory: (theme: AppTheme) => T
) => {
    return (): T => {
        const { theme } = useTheme();
        return useMemo(() => styleFactory(theme), [theme]);
    };
};
