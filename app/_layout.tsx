import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { ensureAndroidChannel, requestPermissions } from '../src/core/notify';

const RootLayout = () => {
    useEffect(() => {
        const init = async () => {
            await ensureAndroidChannel();
            await requestPermissions(); // prompts once on iOS
        };
        void init();
    }, []);

    return (
        <SafeAreaProvider>
            <Stack
                screenOptions={{
                    headerTitleAlign: 'center',
                    animation: 'fade_from_bottom',
                }}
            />
        </SafeAreaProvider>
    );
};

export default RootLayout;
