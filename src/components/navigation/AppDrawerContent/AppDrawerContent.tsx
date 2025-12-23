import React from 'react';
import { ScrollView, View } from 'react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import DrawerItemRow from './DrawerItemRow/DrawerItemRow';
import { useStyles } from './AppDrawerContent.styles';

const resolveLabel = (
    routeName: string,
    options?: { title?: string; drawerLabel?: unknown }
) => {
    if (typeof options?.title === 'string') return options.title;
    if (typeof options?.drawerLabel === 'string') return options.drawerLabel;
    return routeName;
};

const ICONS_BY_ROUTE: Record<
    string,
    React.ComponentProps<typeof import('@expo/vector-icons').Ionicons>['name']
> = {
    index: 'home-outline',
    'workouts/index': 'barbell-outline',
    'history/index': 'time-outline',
    'settings/index': 'settings-outline',
};

const DrawerHeader = () => {
    const st = useStyles();

    return (
        <View style={st.header}>
            <AppText variant="title1" style={st.headerTitle}>
                ARC Timer
            </AppText>
            <AppText
                variant="bodySmall"
                style={st.headerSubtitle}
                numberOfLines={1}
            >
                Quick access
            </AppText>
        </View>
    );
};

const AppDrawerContent = ({
    state,
    navigation,
    descriptors,
}: DrawerContentComponentProps) => {
    const st = useStyles();
    const { theme } = useTheme();

    const activeTintColor = theme.palette.text.inverted;
    const inactiveTintColor = theme.palette.text.muted;
    const activeBgColor = theme.palette.accent.primary;

    return (
        <View style={st.root}>
            <DrawerHeader />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={st.listContent}
            >
                {state.routes.map((route, index) => {
                    const focused = state.index === index;
                    const options = descriptors[route.key]?.options;

                    const label = resolveLabel(route.name, {
                        title: options?.title,
                        drawerLabel: options?.drawerLabel,
                    });

                    const iconName = ICONS_BY_ROUTE[route.name];

                    return (
                        <DrawerItemRow
                            key={route.key}
                            label={label}
                            focused={focused}
                            iconName={iconName}
                            activeTintColor={activeTintColor}
                            inactiveTintColor={inactiveTintColor}
                            activeBgColor={activeBgColor}
                            onPress={() => {
                                navigation.navigate(route.name as never);
                                navigation.closeDrawer();
                            }}
                        />
                    );
                })}

                {/* Bottom safe-area spacing */}
                <View style={st.footerSpacer} />
            </ScrollView>
        </View>
    );
};

export default AppDrawerContent;
