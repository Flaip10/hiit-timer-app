import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { TopBar } from '@src/components/navigation/TopBar';

import { useMainContainerStyles } from './MainContainer.styles';
import { ScreenShell } from '../ScreenShell';

type MainContainerProps = {
    title?: string;
    children: ReactNode;
    scroll?: boolean;
};

export const MainContainer = ({
    title,
    children,
    scroll = true,
}: MainContainerProps) => {
    const st = useMainContainerStyles();

    if (scroll) {
        return (
            <ScreenShell>
                {title ? <TopBar title={title} /> : null}

                <ScrollView
                    contentContainerStyle={st.content}
                    keyboardShouldPersistTaps="handled"
                >
                    {children}
                </ScrollView>
            </ScreenShell>
        );
    }

    return (
        <ScreenShell>
            {title ? <TopBar title={title} /> : null}
            <View style={st.content}>{children}</View>
        </ScreenShell>
    );
};
