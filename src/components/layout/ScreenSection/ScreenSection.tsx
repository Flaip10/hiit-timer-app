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
}) => {
    const st = useScreenSectionStyles({ topSpacing });

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

            {children}
        </View>
    );
};
