import React from 'react';
import { View } from 'react-native';

import type { ScreenSectionProps } from './ScreenSection.interfaces';
import { useScreenSectionStyles } from './ScreenSection.styles';
import { AppText } from '@src/components/ui/Typography/AppText';

export const ScreenSection: React.FC<ScreenSectionProps> = ({
    title,
    rightAccessory,
    children,
    contentContainerStyle,
    containerStyle,
    topSpacing,
    gap = 12,
    flex = false,
}) => {
    const st = useScreenSectionStyles({ topSpacing, gap, flex });

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

            <View style={[st.content, contentContainerStyle]}>{children}</View>
        </View>
    );
};
