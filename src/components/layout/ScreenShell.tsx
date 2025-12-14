// src/components/layout/ScreenShell.tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReactNode } from 'react';
import { useTheme } from '@src/theme/ThemeProvider';

type ScreenShellProps = {
    children: ReactNode;
    hasTopBar: boolean;
};

export const ScreenShell = ({
    children,
    hasTopBar = false,
}: ScreenShellProps) => {
    const { theme } = useTheme();

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: theme.palette.background.primary,
            }}
            edges={hasTopBar ? ['left', 'right'] : ['top', 'left', 'right']}
        >
            {children}
        </SafeAreaView>
    );
};
