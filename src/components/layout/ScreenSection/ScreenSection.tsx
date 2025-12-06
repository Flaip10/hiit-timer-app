import React from 'react';
import { View, Text } from 'react-native';

import type { ScreenSectionProps } from './ScreenSection.interfaces';
import { useScreenSectionStyles } from './ScreenSection.styles';

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
                    <Text style={st.title}>{title}</Text>
                    {rightAccessory ?? null}
                </View>
            ) : null}

            {children}
        </View>
    );
};
