import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18next from 'i18next';

export type LanguageCode = 'en' | 'pt-PT';

const LANGUAGE_STORAGE_KEY = 'app-language';

export const normalizeLanguageCode = (
    input: string | null | undefined
): LanguageCode | null => {
    if (!input) return null;

    const value = input.toLowerCase();

    if (value === 'pt' || value.startsWith('pt-')) return 'pt-PT';
    if (value === 'en' || value.startsWith('en-')) return 'en';

    return null;
};

export const getDeviceLanguage = (): LanguageCode => {
    const languageTag = getLocales()[0]?.languageTag || '';
    return normalizeLanguageCode(languageTag) ?? 'en';
};

export const resolveInitialLanguage = async (): Promise<LanguageCode> => {
    const stored = normalizeLanguageCode(
        await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
    );

    return stored ?? getDeviceLanguage();
};

export const getCurrentLanguage = (): LanguageCode => {
    const lang = i18next.resolvedLanguage ?? i18next.language;
    return normalizeLanguageCode(lang) ?? 'en';
};

export const setLanguage = async (language: LanguageCode): Promise<void> => {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);

    if (i18next.isInitialized) {
        await i18next.changeLanguage(language);
    }
};
