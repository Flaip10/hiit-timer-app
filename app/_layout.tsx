import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@src/theme/ThemeProvider';
import { useAppFonts } from '@src/theme/typography';
import { initializeI18n } from '@src/i18n';

const RootLayout = () => {
    const [fontsLoaded] = useAppFonts();
    const [isI18nReady, setIsI18nReady] = useState(false);

    useEffect(() => {
        initializeI18n()
            .catch((error: unknown) => {
                console.error('i18n init failed', error);
            })
            .finally(() => {
                setIsI18nReady(true);
            });
    }, []);

    if (!fontsLoaded || !isI18nReady) return null;

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
