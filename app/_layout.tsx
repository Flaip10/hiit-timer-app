import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@src/theme/ThemeProvider';
import { useAppFonts } from '@src/theme/typography';
import { initializeI18n } from '@src/i18n';
import { initializeDatabase } from '@src/db';

const SPLASH_MIN_DURATION_MS = 1000;
const splashStartedAtMs = Date.now();

SplashScreen.setOptions({
    duration: Platform.OS === 'ios' ? 1000 : 0,
    fade: Platform.OS === 'ios',
});

SplashScreen.preventAutoHideAsync().catch((error: unknown) => {
    console.error('splash prevent auto hide failed', error);
});

const RootLayout = () => {
    const [fontsLoaded] = useAppFonts();
    const [isI18nReady, setIsI18nReady] = useState(false);
    const [isDatabaseReady, setIsDatabaseReady] = useState(false);
    const [databaseError, setDatabaseError] = useState<unknown | null>(null);
    const isDatabaseBootstrapComplete =
        isDatabaseReady || databaseError != null;
    const isBootstrapReady =
        fontsLoaded && isI18nReady && isDatabaseBootstrapComplete;

    useEffect(() => {
        initializeI18n()
            .catch((error: unknown) => {
                console.error('i18n init failed', error);
            })
            .finally(() => {
                setIsI18nReady(true);
            });
    }, []);

    useEffect(() => {
        initializeDatabase()
            .then(() => {
                setIsDatabaseReady(true);
            })
            .catch((error: unknown) => {
                console.error('database init failed', error);
                setDatabaseError(error);
            });
    }, []);

    useEffect(() => {
        if (isBootstrapReady) {
            const hideSplash = async () => {
                const elapsedMs = Date.now() - splashStartedAtMs;
                const remainingMs = Math.max(
                    0,
                    SPLASH_MIN_DURATION_MS - elapsedMs
                );

                if (remainingMs > 0) {
                    await new Promise<void>((resolve) => {
                        setTimeout(resolve, remainingMs);
                    });
                }

                await SplashScreen.hideAsync();
            };

            hideSplash().catch((error: unknown) => {
                console.error('splash hide failed', error);
            });
        }
    }, [isBootstrapReady]);

    if (!isBootstrapReady) return null;

    return (
        <ThemeProvider>
            <SafeAreaProvider>
                <Stack
                    initialRouteName="(drawer)" // <— ensure we start at the drawer
                    screenOptions={{
                        headerShown: false,
                        animation:
                            Platform.OS === 'android'
                                ? 'slide_from_right'
                                : 'default',
                        contentStyle: { backgroundColor: '#0B0B0C' },
                    }}
                >
                    <Stack.Screen
                        name="(drawer)"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="history/[sessionId]"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="workouts/[id]"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="workouts/edit"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="workouts/edit-block"
                        options={{ headerShown: false }}
                    />
                </Stack>
            </SafeAreaProvider>
        </ThemeProvider>
    );
};

export default RootLayout;
