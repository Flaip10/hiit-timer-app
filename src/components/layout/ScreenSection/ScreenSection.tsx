import React from 'react';
import { View } from 'react-native';

import type { ScreenSectionProps } from './ScreenSection.interfaces';
import { useScreenSectionStyles } from './ScreenSection.styles';
import { AppText } from '@src/components/ui/Typography/AppText';

export const ScreenSection: React.FC<ScreenSectionProps> = ({
    title,
    rightAccessory,
    children,
    containerStyle,
    topSpacing,
    gap = 12,
}) => {
    const st = useScreenSectionStyles({ topSpacing, gap });

    return (
        <View style={[st.container, containerStyle]}>
            {title ? (
                <View style={st.headerRow}>
                    <AppText variant="subtitle" style={st.title}>
                        {title}
                    </AppText>
                    {rightAccessory ?? null}
                </View>
            ) : null}

            <View style={st.content}>{children}</View>
        </View>
    );
};
