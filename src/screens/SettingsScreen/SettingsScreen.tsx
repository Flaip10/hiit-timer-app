import React from 'react';
import { View } from 'react-native';
import * as Application from 'expo-application';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { useSettingsStyles } from './SettingsScreen.styles';
import {
    useSettingsStore,
    type LanguageCode,
} from '@src/state/useSettingsStore';
import { AppLogo } from '@src/components/ui/AppLogo/AppLogo';
import { SettingsSection } from './components/SettingsSection';
import { SettingsSubSection } from './components/SettingsSubSection';
import { OptionPills } from './components/OptionPills';
import { type AccentId, COLOR_ACCENTS } from '@src/theme/palette';

const LANGUAGE_OPTIONS: { value: LanguageCode; label: string; flag: string }[] =
    [
        { value: 'en', label: 'English', flag: '🇬🇧' },
        { value: 'pt', label: 'Português', flag: '🇵🇹' },
    ];

const APP_VERSION = Application.nativeApplicationVersion ?? '1.0.0';
const APP_NAME = Application.applicationName ?? 'ARC Timer';

const SettingsScreen = () => {
    const { preference, setPreference } = useTheme();
    const {
        isSoundEnabled,
        language,
        accentPreference,
        setIsSoundEnabled,
        setLanguage,
        setAccentPreference,
    } = useSettingsStore();
    const st = useSettingsStyles();

    const themeOptions = [
        { value: 'light' as const, label: 'Light' },
        { value: 'dark' as const, label: 'Dark' },
        { value: 'system' as const, label: 'System' },
    ];

    const soundOptions = [
        { value: 'on' as const, label: 'On' },
        { value: 'off' as const, label: 'Off' },
    ];

    const languageOptions = LANGUAGE_OPTIONS.map(({ value, label, flag }) => ({
        value,
        label,
        leftSlot: (
            <AppText variant="bodySmall" style={st.flagEmoji}>
                {flag}
            </AppText>
        ),
    }));

    const colorAccentOptions = (Object.keys(COLOR_ACCENTS) as AccentId[]).map(
        (id) => {
            const accent = COLOR_ACCENTS[id];

            return {
                value: id,
                label: accent.label,
            };
        }
    );

    return (
        <MainContainer title="Settings">
            <SettingsSection iconId="appearance" title="Appearance">
                <SettingsSubSection description={'Select your preferred theme'}>
                    <OptionPills
                        options={themeOptions}
                        selectedValue={preference}
                        onSelect={setPreference}
                    />
                </SettingsSubSection>
                <SettingsSubSection description="Select your preferred color accent">
                    <OptionPills
                        options={colorAccentOptions}
                        selectedValue={accentPreference}
                        onSelect={setAccentPreference}
                    />
                </SettingsSubSection>
            </SettingsSection>

            <View style={st.separator} />

            <SettingsSection iconId="sound" title="Sound">
                <SettingsSubSection description="Enable sound effects and notifications">
                    <OptionPills
                        options={soundOptions}
                        selectedValue={isSoundEnabled ? 'on' : 'off'}
                        onSelect={(value) => setIsSoundEnabled(value === 'on')}
                    />
                </SettingsSubSection>
            </SettingsSection>

            <View style={st.separator} />

            <SettingsSection iconId="language" title="Language">
                <SettingsSubSection description="Select your preferred language">
                    <OptionPills
                        options={languageOptions}
                        selectedValue={language}
                        onSelect={setLanguage}
                    />
                </SettingsSubSection>
            </SettingsSection>

            <View style={st.separator} />

            <SettingsSection iconId="info" title="About">
                <View style={st.aboutContent}>
                    <AppLogo size={64} withBackground />
                    <View style={st.aboutInfo}>
                        <AppText variant="subtitle" style={st.appName}>
                            {APP_NAME}
                        </AppText>
                        <AppText variant="bodySmall" tone="muted">
                            Version {APP_VERSION}
                        </AppText>
                        <AppText
                            variant="bodySmall"
                            tone="muted"
                            style={st.copyright}
                        >
                            © {new Date().getFullYear()}
                        </AppText>
                    </View>
                </View>
            </SettingsSection>
        </MainContainer>
    );
};

export default SettingsScreen;
