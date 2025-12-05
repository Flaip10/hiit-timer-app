import React from 'react';
import { View, Pressable } from 'react-native';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { useSettingsStyles } from './SettingsScreen.styles';

const SettingsScreen = () => {
    const { theme, preference, themeName, setPreference } = useTheme();
    const st = useSettingsStyles();

    return (
        <MainContainer title="Settings">
            <View style={st.section}>
                <AppText variant="title1">Appearance</AppText>

                <AppText variant="bodySmall" tone="muted">
                    Current theme: {themeName} ({preference})
                </AppText>

                <View style={st.switchRow}>
                    {(['light', 'dark', 'system'] as const).map((opt) => {
                        const isActive = preference === opt;

                        return (
                            <Pressable
                                key={opt}
                                onPress={() => setPreference(opt)}
                                style={[
                                    st.pill,
                                    isActive && {
                                        borderColor:
                                            theme.palette.accent.primary,
                                        backgroundColor:
                                            theme.palette.accent.soft,
                                    },
                                ]}
                            >
                                <AppText
                                    variant="bodySmall"
                                    tone={isActive ? 'primary' : 'muted'}
                                >
                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </MainContainer>
    );
};

export default SettingsScreen;
