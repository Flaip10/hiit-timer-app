import 'react-native-gesture-handler';
import { Stack } from 'expo-router';

const RootLayout = () => {
    return (
        <Stack
            initialRouteName="(drawer)" // <— ensure we start at the drawer
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0B0B0C' },
            }}
        >
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen
                name="workouts/[id]"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="workouts/edit"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="workouts/block-edit"
                options={{ headerShown: false }}
            />
        </Stack>
    );
};

export default RootLayout;
