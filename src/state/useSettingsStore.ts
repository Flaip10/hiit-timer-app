import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

export type LanguageCode = 'en' | 'pt';

interface SettingsState {
    isSoundEnabled: boolean;
    language: LanguageCode;

    setIsSoundEnabled: (isEnabled: boolean) => void;
    setLanguage: (language: LanguageCode) => void;
}

const getDefaultLanguageFromDevice = (): LanguageCode => {
    const primaryLocale = getLocales()[0];
    const languageCode = primaryLocale?.languageCode?.toLowerCase();

    return languageCode === 'pt' ? 'pt' : 'en';
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            isSoundEnabled: true,
            language: getDefaultLanguageFromDevice(),

            setIsSoundEnabled: (isEnabled) =>
                set({ isSoundEnabled: isEnabled }),
            setLanguage: (language) => set({ language }),
        }),
        {
            name: 'app-settings-v1',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
