import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './resources/en';
import { ptPT } from './resources/ptPT';
import {
    normalizeLanguageCode,
    resolveInitialLanguage,
    type LanguageCode,
} from './language';

export const resources = {
    en: { translation: en },
    'pt-PT': { translation: ptPT },
} as const;

let i18nInitializationPromise: Promise<LanguageCode> | null = null;

export const initializeI18n = async (): Promise<LanguageCode> => {
    if (i18next.isInitialized) {
        const runtimeLanguage = i18next.resolvedLanguage ?? i18next.language;
        return normalizeLanguageCode(runtimeLanguage) ?? 'en';
    }

    i18nInitializationPromise ??= (async () => {
        const initialLanguage = await resolveInitialLanguage();

        await i18next.use(initReactI18next).init({
            resources,
            lng: initialLanguage,
            fallbackLng: 'en',
            interpolation: { escapeValue: false },
            returnNull: false,
        });

        return initialLanguage;
    })().catch((error) => {
        i18nInitializationPromise = null;
        throw error;
    });

    return i18nInitializationPromise;
};

export default i18next;
