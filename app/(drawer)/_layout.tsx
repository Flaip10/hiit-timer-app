import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { useTheme } from '@src/theme/ThemeProvider';
import AppDrawerContent from '../../src/components/navigation/AppDrawerContent/AppDrawerContent';
import { useTranslation } from 'react-i18next';

const DrawerLayout = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();

    return (
        <Drawer
            drawerContent={AppDrawerContent}
            screenOptions={{
                headerShown: false,
                drawerType: 'front',
                drawerStyle: {
                    backgroundColor: theme.palette.background.card,
                    width: 280,
                    overflow: 'hidden',
                    borderRadius: 0,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                },
            }}
        >
            <Drawer.Screen name="index" options={{ title: t('drawer.home') }} />
            <Drawer.Screen
                name="workouts/index"
                options={{ title: t('drawer.workouts') }}
            />
            <Drawer.Screen
                name="history/index"
                options={{ title: t('drawer.history') }}
            />
            <Drawer.Screen
                name="settings/index"
                options={{ title: t('drawer.settings') }}
            />
        </Drawer>
    );
};

export default DrawerLayout;
