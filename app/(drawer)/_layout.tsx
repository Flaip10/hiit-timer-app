import { Drawer } from 'expo-router/drawer';

const DrawerLayout = () => {
    return (
        <Drawer
            id="root-drawer"
            initialRouteName="index"
            sceneContainerStyle={{ backgroundColor: '#0B0B0C' }}
            screenOptions={{
                headerShown: false,
                drawerType: 'front',
                drawerStyle: { backgroundColor: '#0B0B0C', width: 280 },
                drawerActiveTintColor: '#FFFFFF',
                drawerInactiveTintColor: '#A1A1AA',
            }}
        >
            <Drawer.Screen name="index" options={{ title: 'Home' }} />
            <Drawer.Screen
                name="workouts/index"
                options={{ title: 'Workouts' }}
            />
            <Drawer.Screen
                name="settings/index"
                options={{ title: 'Settings' }}
            />
        </Drawer>
    );
};

export default DrawerLayout;
