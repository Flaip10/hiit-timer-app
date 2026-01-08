import React from 'react';
import { View } from 'react-native';

import { AppText } from '@src/components/ui/Typography/AppText';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { useTheme } from '@src/theme/ThemeProvider';
import { useSettingsSectionStyles } from './SettingsSection.styles';
import type { IconId } from '@src/components/ui/Icon/AppIcon';

export interface SettingsSectionProps {
    iconId: IconId;
    title: string;
    children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
    iconId,
    title,
    children,
}) => {
    const { theme } = useTheme();
    const st = useSettingsSectionStyles();

    return (
        <View style={st.section}>
            <View style={st.sectionHeader}>
                <AppIcon
                    id={iconId}
                    size={20}
                    color={theme.palette.text.header}
                />
                <AppText variant="title1" style={st.sectionTitle}>
                    {title}
                </AppText>
            </View>

            {children}
        </View>
    );
};
