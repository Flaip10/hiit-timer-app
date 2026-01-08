import React from 'react';
import { View } from 'react-native';

import { AppText } from '@src/components/ui/Typography/AppText';
import { useSettingsSubSectionStyles } from './SettingsSubSection.styles';

export interface SettingsSubSectionProps {
    description?: string;
    children: React.ReactNode;
}

export const SettingsSubSection: React.FC<SettingsSubSectionProps> = ({
    description,
    children,
}) => {
    const st = useSettingsSubSectionStyles();

    return (
        <View style={st.subSection}>
            {description && (
                <AppText
                    variant="bodySmall"
                    tone="muted"
                    style={st.description}
                >
                    {description}
                </AppText>
            )}
            {children}
        </View>
    );
};
