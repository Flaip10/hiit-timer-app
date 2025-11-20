import { ReactNode } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';

import { TopBar } from '@src/components/navigation/TopBar';
import { ScreenShell } from './ScreenShell';

type MainContainerProps = {
    title?: string;
    children: ReactNode;
    scroll?: boolean; // default true
};

export const MainContainer = ({
    title,
    children,
    scroll = true,
}: MainContainerProps) => {
    return (
        <ScreenShell>
            {title ? <TopBar title={title} /> : null}

            {scroll ? (
                <ScrollView
                    contentContainerStyle={st.content}
                    keyboardShouldPersistTaps="handled"
                >
                    {children}
                </ScrollView>
            ) : (
                <View style={st.content}>{children}</View>
            )}
        </ScreenShell>
    );
};

const st = StyleSheet.create({
    content: {
        flexGrow: 1,
        padding: 16,
        paddingHorizontal: 18,
        gap: 8,
        paddingBottom: 24,
    },
});
