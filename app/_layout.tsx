import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const RootLayout = () => (
    <SafeAreaProvider>
        <Stack
            screenOptions={{
                headerTitleAlign: 'center',
                animation: 'fade_from_bottom',
            }}
        />
    </SafeAreaProvider>
);

export default RootLayout;
