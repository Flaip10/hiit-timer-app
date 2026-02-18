import React from 'react';
import { View } from 'react-native';
import * as Application from 'expo-application';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { useSettingsStyles } from './SettingsScreen.styles';
import { useSettingsStore } from '@src/state/useSettingsStore';
import { AppLogo } from '@src/components/ui/AppLogo/AppLogo';
import { SettingsSection } from './components/SettingsSection';
import { SettingsSubSection } from './components/SettingsSubSection';
import { OptionPills } from './components/OptionPills';
import { type AccentId, COLOR_ACCENTS } from '@src/theme/palette';
import { useTranslation } from 'react-i18next';
import {
    getCurrentLanguage,
    setLanguage,
    type LanguageCode,
} from '@src/i18n/language';

interface LanguageOption {
    value: LanguageCode;
    labelKey: 'settings.languages.en' | 'settings.languages.ptPT';
    flag: string;
}

interface AccentLabelKeys {
    classic: 'settings.accents.classic';
    violet: 'settings.accents.violet';
    cyan: 'settings.accents.cyan';
    amber: 'settings.accents.amber';
    neutral: 'settings.accents.neutral';
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
    { value: 'en', labelKey: 'settings.languages.en', flag: '🇬🇧' },
    { value: 'pt-PT', labelKey: 'settings.languages.ptPT', flag: '🇵🇹' },
];

const ACCENT_LABEL_KEYS: AccentLabelKeys = {
    classic: 'settings.accents.classic',
    violet: 'settings.accents.violet',
    cyan: 'settings.accents.cyan',
    amber: 'settings.accents.amber',
    neutral: 'settings.accents.neutral',
};

const APP_VERSION = Application.nativeApplicationVersion ?? '1.0.0';
const APP_NAME = Application.applicationName ?? 'ARC Timer';

const SettingsScreen = () => {
    const { t } = useTranslation();
    const { preference, setPreference } = useTheme();
    const {
        isSoundEnabled,
        accentPreference,
        setIsSoundEnabled,
        setAccentPreference,
    } = useSettingsStore();
    const st = useSettingsStyles();

    const themeOptions = [
        { value: 'light' as const, label: t('settings.theme.light') },
        { value: 'dark' as const, label: t('settings.theme.dark') },
        { value: 'system' as const, label: t('settings.theme.system') },
    ];

    const soundOptions = [
        { value: 'on' as const, label: t('settings.sound.on') },
        { value: 'off' as const, label: t('settings.sound.off') },
    ];

    const languageOptions = LANGUAGE_OPTIONS.map(
        ({ value, labelKey, flag }) => ({
            value,
            label: t(labelKey),
            leftSlot: (
                <AppText variant="bodySmall" style={st.flagEmoji}>
                    {flag}
                </AppText>
            ),
        })
    );

    const colorAccentOptions = (Object.keys(COLOR_ACCENTS) as AccentId[]).map(
        (id) => {
            return {
                value: id,
                label: t(ACCENT_LABEL_KEYS[id]),
            };
        }
    );

    const currentLanguage = getCurrentLanguage();

    const handleSelectLanguage = (languageCode: LanguageCode) => {
        setLanguage(languageCode).catch((error: unknown) => {
            console.error('setLanguage failed', error);
        });
    };

    return (
        <MainContainer title={t('settings.title')}>
            <SettingsSection
                iconId="appearance"
                title={t('settings.sections.appearance')}
            >
                <SettingsSubSection
                    description={t('settings.descriptions.theme')}
                >
                    <OptionPills
                        options={themeOptions}
                        selectedValue={preference}
                        onSelect={setPreference}
                    />
                </SettingsSubSection>
                <SettingsSubSection
                    description={t('settings.descriptions.accent')}
                >
                    <OptionPills
                        options={colorAccentOptions}
                        selectedValue={accentPreference}
                        onSelect={setAccentPreference}
                    />
                </SettingsSubSection>
            </SettingsSection>

            <View style={st.separator} />

            <SettingsSection
                iconId="sound"
                title={t('settings.sections.sound')}
            >
                <SettingsSubSection
                    description={t('settings.descriptions.sound')}
                >
                    <OptionPills
                        options={soundOptions}
                        selectedValue={isSoundEnabled ? 'on' : 'off'}
                        onSelect={(value) => setIsSoundEnabled(value === 'on')}
                    />
                </SettingsSubSection>
            </SettingsSection>

            <View style={st.separator} />

            <SettingsSection
                iconId="language"
                title={t('settings.sections.language')}
            >
                <SettingsSubSection
                    description={t('settings.descriptions.language')}
                >
                    <OptionPills
                        options={languageOptions}
                        selectedValue={currentLanguage}
                        onSelect={handleSelectLanguage}
                    />
                </SettingsSubSection>
            </SettingsSection>

            <View style={st.separator} />

            <SettingsSection iconId="info" title={t('settings.sections.about')}>
                <View style={st.aboutContent}>
                    <AppLogo size={64} withBackground />
                    <View style={st.aboutInfo}>
                        <AppText variant="subtitle" style={st.appName}>
                            {APP_NAME}
                        </AppText>
                        <AppText variant="bodySmall" tone="muted">
                            {t('settings.about.version', {
                                version: APP_VERSION,
                            })}
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
