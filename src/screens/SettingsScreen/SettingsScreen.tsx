import React from 'react';
import { View } from 'react-native';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { useSettingsStyles } from './SettingsScreen.styles';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppLogo } from '@src/components/ui/AppLogo/AppLogo';

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
                            <GuardedPressable
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
                            </GuardedPressable>
                        );
                    })}
                </View>
            </View>

            <View style={{ flexDirection: 'row' }}>
                <AppLogo size={96} withBackground />

                <AppLogo size={96} useOppositeTheme withBackground />

                <AppLogo size={96} />

                <AppLogo size={96} useOppositeTheme />
            </View>

            <View style={{ flexDirection: 'row' }}>
                <AppLogo size={96} logoMode="neutral-dark" withBackground />

                <AppLogo size={96} logoMode="neutral-light" withBackground />

                <AppLogo size={96} logoMode="neutral-dark" />

                <AppLogo size={96} logoMode="neutral-light" />
            </View>
        </MainContainer>
    );
};

export default SettingsScreen;
