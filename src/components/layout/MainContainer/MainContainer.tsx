import React, { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { TopBar } from '@src/components/navigation/TopBar/TopBar';
import type {
    TopBarLeftMode,
    TopBarOption,
} from '@src/components/navigation/TopBar/TopBar.interfaces';
import { ScreenShell } from '../ScreenShell';
import { useMainContainerStyles } from './MainContainer.styles';
import { MainContainerScrollProvider } from './MainContainerScrollContext';
import { useKeyboardAwareScroll } from './useKeyboardAwareScroll';

type MainContainerProps = {
    title?: string;
    children: ReactNode;
    scroll?: boolean;
    gap?: number;
    noPadding?: boolean;
    topBarOptions?: readonly TopBarOption[];
    topBarLeftMode?: TopBarLeftMode;
};

export const MainContainer = ({
    title,
    children,
    scroll = true,
    gap = 8,
    noPadding = false,
    topBarOptions,
    topBarLeftMode,
}: MainContainerProps) => {
    const st = useMainContainerStyles({ gap, noPadding });
    const {
        handleScroll,
        scrollContextValue,
        scrollViewRef,
        viewportRef,
    } = useKeyboardAwareScroll();

    const content = scroll ? (
        <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={st.content}
            keyboardShouldPersistTaps="handled"
            onScroll={handleScroll}
            scrollEventThrottle={16}
        >
            {children}
        </ScrollView>
    ) : (
        <View style={st.content}>{children}</View>
    );

    return (
        <ScreenShell hasTopBar={!!title}>
            {title ? (
                <TopBar
                    title={title}
                    leftMode={topBarLeftMode}
                    options={topBarOptions}
                />
            ) : null}

            <MainContainerScrollProvider value={scrollContextValue}>
                <KeyboardAvoidingView
                    style={st.kav}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View ref={viewportRef} style={st.viewport}>
                        {content}
                    </View>
                </KeyboardAvoidingView>
            </MainContainerScrollProvider>
        </ScreenShell>
    );
};
