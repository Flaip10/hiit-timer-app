import React from 'react';
import { StatusBar, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useRouter, useSegments } from 'expo-router';

import { IconButton } from '../ui/IconButton/IconButton';
import { AppText } from '@src/components/ui/Typography/AppText';
import { createStyles } from '@src/theme/createStyles';
import { useTheme } from '@src/theme/ThemeProvider';

type Props = {
    title?: string;
    right?: React.ReactNode;
    forceBack?: boolean;
    onTitlePress?: () => void;
};

const useStyles = createStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.primary,
        borderBottomWidth: 1,
        borderBottomColor: theme.palette.border.subtle,
    },
    bar: {
        height: 56,
        backgroundColor: theme.palette.background.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        gap: 8,
    },
    titleWrapper: {
        flex: 1,
    },
    titleInteractive: {
        opacity: 0.95,
    },
    right: {
        width: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    leftPlaceholder: {
        width: 36,
        height: 36,
    },
}));

export const TopBar = ({
    title,
    right,
    forceBack = false,
    onTitlePress,
}: Props) => {
    const nav = useNavigation();
    const router = useRouter();
    const segments = useSegments();
    const { theme, themeName } = useTheme();
    const st = useStyles();

    const isInDrawer = segments[0] === '(drawer)';

    const canGoBack =
        forceBack || (typeof nav.canGoBack === 'function' && nav.canGoBack());

    const showHamburger = isInDrawer;
    const showBack = !isInDrawer && canGoBack;

    const onBack = () => {
        try {
            router.back();
        } catch {
            if (typeof nav.goBack === 'function' && nav.canGoBack?.()) {
                nav.goBack();
            }
        }
    };

    const onOpenDrawer = () => {
        try {
            nav.dispatch?.(DrawerActions.openDrawer());
        } catch {}
    };

    const iconColor = theme.palette.text.primary;
    const barStyle = themeName === 'dark' ? 'light-content' : 'dark-content';

    return (
        <View style={st.root}>
            <StatusBar barStyle={barStyle} />
            <View style={st.bar}>
                {showBack ? (
                    <IconButton onPress={onBack}>
                        <Ionicons
                            name="chevron-back"
                            size={22}
                            color={iconColor}
                        />
                    </IconButton>
                ) : showHamburger ? (
                    <IconButton onPress={onOpenDrawer}>
                        <Ionicons name="menu" size={22} color={iconColor} />
                    </IconButton>
                ) : (
                    <View style={st.leftPlaceholder} />
                )}

                <View style={st.titleWrapper}>
                    <AppText
                        variant="title2"
                        align="center"
                        numberOfLines={1}
                        onPress={onTitlePress}
                        style={onTitlePress ? st.titleInteractive : undefined}
                    >
                        {title ?? ''}
                    </AppText>
                </View>

                <View style={st.right}>
                    {right ?? <View style={{ width: 22, height: 22 }} />}
                </View>
            </View>
        </View>
    );
};
