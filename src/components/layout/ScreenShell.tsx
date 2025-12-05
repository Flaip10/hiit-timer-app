// src/components/layout/ScreenShell.tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReactNode } from 'react';
import { useTheme } from '@src/theme/ThemeProvider';

type ScreenShellProps = {
    children: ReactNode;
};

export const ScreenShell = ({ children }: ScreenShellProps) => {
    const { theme } = useTheme();

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: theme.palette.background.primary,
            }}
            edges={['top', 'left', 'right']}
        >
            {children}
        </SafeAreaView>
    );
};
