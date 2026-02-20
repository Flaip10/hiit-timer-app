import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@src/theme/ThemeProvider';
import { useAppFonts } from '@src/theme/typography';
import { initializeI18n } from '@src/i18n';

const SPLASH_MIN_DURATION_MS = 1000;
const splashStartedAtMs = Date.now();

SplashScreen.setOptions({
    duration: 1000,
    fade: true,
});

SplashScreen.preventAutoHideAsync().catch((error: unknown) => {
    console.error('splash prevent auto hide failed', error);
});

const RootLayout = () => {
    const [fontsLoaded] = useAppFonts();
    const [isI18nReady, setIsI18nReady] = useState(false);
    const isBootstrapReady = fontsLoaded && isI18nReady;

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
