import React, { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { TopBar } from '@src/components/navigation/TopBar';
import { ScreenShell } from '../ScreenShell';
import { useMainContainerStyles } from './MainContainer.styles';

type MainContainerProps = {
    title?: string;
    children: ReactNode;
    scroll?: boolean;
    gap?: number;
};

export const MainContainer = ({
    title,
    children,
    scroll = true,
    gap = 8,
}: MainContainerProps) => {
    const st = useMainContainerStyles({ gap });

    const content = scroll ? (
        <ScrollView
            contentContainerStyle={st.content}
            keyboardShouldPersistTaps="handled"
        >
            {children}
        </ScrollView>
    ) : (
        <View style={st.content}>{children}</View>
    );

    return (
        <ScreenShell>
            {title ? <TopBar title={title} /> : null}

            <KeyboardAvoidingView
                style={st.kav}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {content}
            </KeyboardAvoidingView>
        </ScreenShell>
    );
};
