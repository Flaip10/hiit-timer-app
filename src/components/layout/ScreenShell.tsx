import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
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
            style={[st.container, { backgroundColor: theme.palette.background.primary }]}
            edges={hasTopBar ? ['left', 'right'] : ['top', 'left', 'right']}
        >
            {children}
        </SafeAreaView>
    );
};

const st = StyleSheet.create({
    container: {
        flex: 1,
    },
});
