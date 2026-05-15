import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { ThemeProvider } from '@src/theme/ThemeProvider';
import { useAppFonts } from '@src/theme/typography';
import { initializeI18n } from '@src/i18n';
import { initializeDatabase } from '@src/db';
import { AppQueryProvider } from '@src/data/QueryProvider';
import { sqliteDb } from '@src/db/client';
import { DatabaseBootstrapErrorScreen } from '@src/components/bootstrap/DatabaseBootstrapErrorScreen/DatabaseBootstrapErrorScreen';

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
    useDrizzleStudio(__DEV__ ? sqliteDb : null);

    const [fontsLoaded] = useAppFonts();
    const [isI18nReady, setIsI18nReady] = useState(false);
    const [isDatabaseReady, setIsDatabaseReady] = useState(false);
    const [databaseError, setDatabaseError] = useState<unknown | null>(null);
    const [databaseBootstrapAttempt, setDatabaseBootstrapAttempt] = useState(0);
    const isBootstrapReady = fontsLoaded && isI18nReady && isDatabaseReady;
    const shouldShowDatabaseBootstrapError =
        fontsLoaded && isI18nReady && databaseError != null;

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
        setIsDatabaseReady(false);
        setDatabaseError(null);

        initializeDatabase()
            .then(() => {
                setIsDatabaseReady(true);
            })
            .catch((error: unknown) => {
                console.error('database init failed', error);
                setDatabaseError(error);
            });
    }, [databaseBootstrapAttempt]);

    useEffect(() => {
        if (isBootstrapReady || shouldShowDatabaseBootstrapError) {
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
    }, [isBootstrapReady, shouldShowDatabaseBootstrapError]);

    const retryDatabaseBootstrap = () => {
        setDatabaseBootstrapAttempt((attempt) => attempt + 1);
    };

    if (shouldShowDatabaseBootstrapError) {
        return (
            <ThemeProvider>
                <SafeAreaProvider>
                    <DatabaseBootstrapErrorScreen
                        onRetry={retryDatabaseBootstrap}
                    />
                </SafeAreaProvider>
            </ThemeProvider>
        );
    }

    if (!isBootstrapReady) return null;

    return (
        <AppQueryProvider>
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
        </AppQueryProvider>
    );
};

export default RootLayout;
