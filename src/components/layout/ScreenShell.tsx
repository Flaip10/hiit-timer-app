import { SafeAreaView } from 'react-native-safe-area-context';
import { ReactNode } from 'react';

type ScreenShellProps = {
    children: ReactNode;
};

export const ScreenShell = ({ children }: ScreenShellProps) => (
    <SafeAreaView
        style={{ flex: 1, backgroundColor: '#0B0B0C' }}
        edges={['top', 'left', 'right']}
    >
        {children}
    </SafeAreaView>
);
