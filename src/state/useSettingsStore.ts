import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@src/theme/theme';
import type { AccentId } from '@src/theme/palette';

interface SettingsState {
    isSoundEnabled: boolean;
    accentPreference: AccentId;

    themePreference: ThemePreference;
    setThemePreference: (preference: ThemePreference) => void;

    setIsSoundEnabled: (isEnabled: boolean) => void;
    setAccentPreference: (preference: AccentId) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            isSoundEnabled: true,
            accentPreference: 'violet',

            themePreference: 'system',
            setThemePreference: (preference) =>
                set({ themePreference: preference }),

            setIsSoundEnabled: (isEnabled) =>
                set({ isSoundEnabled: isEnabled }),
            setAccentPreference: (preference) =>
                set({ accentPreference: preference }),
        }),
        {
            name: 'app-settings-v1',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
