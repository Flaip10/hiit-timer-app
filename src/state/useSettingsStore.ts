import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import type { ThemePreference } from '@src/theme/theme';
import type { AccentId } from '@src/theme/palette';

export type LanguageCode = 'en' | 'pt';

interface SettingsState {
    isSoundEnabled: boolean;
    language: LanguageCode;
    accentPreference: AccentId;

    themePreference: ThemePreference;
    setThemePreference: (preference: ThemePreference) => void;

    setIsSoundEnabled: (isEnabled: boolean) => void;
    setLanguage: (language: LanguageCode) => void;
    setAccentPreference: (preference: AccentId) => void;
}

const getDefaultLanguageFromDevice = (): LanguageCode => {
    const primaryLocale = getLocales()?.[0];
    const languageCode = primaryLocale?.languageCode?.toLowerCase();

    return languageCode === 'pt' ? 'pt' : 'en';
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            isSoundEnabled: true,
            language: getDefaultLanguageFromDevice(),
            accentPreference: 'violet',

            themePreference: 'system',
            setThemePreference: (preference) =>
                set({ themePreference: preference }),

            setIsSoundEnabled: (isEnabled) =>
                set({ isSoundEnabled: isEnabled }),
            setLanguage: (language) => set({ language }),
            setAccentPreference: (preference) =>
                set({ accentPreference: preference }),
        }),
        {
            name: 'app-settings-v1',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
