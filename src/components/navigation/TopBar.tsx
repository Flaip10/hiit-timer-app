import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StatusBar, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useRouter, useSegments } from 'expo-router';

import { IconButton } from '../ui/IconButton/IconButton';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { PILL_H, useStyles } from './TopBar.styles';

type Props = {
    title?: string;
    right?: React.ReactNode;
    forceBack?: boolean;
    onTitlePress?: () => void;
};

type TopPillPathParams = {
    h: number;

    // independent (text container width)
    middleW: number;

    // proportional to height (side curvature zone)
    // if omitted, defaults to 2*h (matches your 80 when h=40)
    sideW?: number;

    // curve ratios inside sideW (from your template)
    cpTopRatio?: number; // 44/80
    cpBottomRatio?: number; // 41/80
};

export const buildTopPillPath = ({
    h,
    middleW,
    sideW,
    cpTopRatio = 44 / 80,
    cpBottomRatio = 41 / 80,
}: TopPillPathParams) => {
    const H = Math.max(1, h);
    const M = Math.max(0, middleW);

    const S = Math.max(0, sideW ?? Math.round(H * 2)); // proportional to height
    const W = 2 * S + M;

    const xL = S;
    const xR = S + M;

    // Left curve control points inside [0..S]
    const c1x = S * cpTopRatio; // ~44 when S=80
    const c2x = S * cpBottomRatio; // ~41 when S=80

    // Right curve control points inside [xR..W] (mirrored)
    const c3x = xR + S * (1 - cpBottomRatio); // ~233 when xR=194,S=80
    const c4x = xR + S * (1 - cpTopRatio); // ~230 when xR=194,S=80

    return [
        `M 0 0`,
        `C ${c1x} 0 ${c2x} ${H} ${xL} ${H}`,
        `L ${xR} ${H}`,
        `C ${c3x} ${H} ${c4x} 0 ${W} 0`,
        `L ${xR} 0`,
        `L ${xL} 0`,
        `L 0 0`,
        `Z`,
    ].join(' ');
};

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

    const [centerW, setCenterW] = useState(0);

    const onCenterLayout = (e: LayoutChangeEvent) => {
        const w = Math.floor(e.nativeEvent.layout.width);
        if (w !== centerW) setCenterW(w);
    };

    const pillPath = useMemo(() => {
        if (centerW <= 0) return '';

        const sideW = Math.round(PILL_H * 2); // or tweak 1.8..2.2
        const middleW = Math.max(0, centerW - 2 * sideW);

        return buildTopPillPath({ h: PILL_H, middleW, sideW });
    }, [centerW]);

    const onBack = () => {
        try {
            router.back();
        } catch {
            if (typeof nav.goBack === 'function' && nav.canGoBack?.())
                nav.goBack();
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
        <View style={[st.root, { paddingTop: theme.insets.top }]}>
            <StatusBar barStyle={barStyle} />

            {/* bar is relative so we can absolutely position actions */}
            <View style={st.bar}>
                {/* spacers define lateral space (SLOT_W). they don't own the buttons */}
                <View style={st.sideSpacer} pointerEvents="none" />
                <View style={st.center} onLayout={onCenterLayout}>
                    <View style={st.pillHost}>
                        {centerW > 0 && (
                            <Svg
                                width={centerW}
                                height={PILL_H}
                                style={st.pillSvg}
                            >
                                <Path
                                    d={pillPath}
                                    fill={theme.palette.accent.primary}
                                />
                            </Svg>
                        )}

                        <AppText
                            variant="title3"
                            align="center"
                            numberOfLines={1}
                            onPress={onTitlePress}
                            style={
                                onTitlePress ? st.titleInteractive : st.title
                            }
                        >
                            {title ?? ''}
                        </AppText>
                    </View>
                </View>
                <View style={st.sideSpacer} pointerEvents="none" />

                {/* actions are absolute so they are NOT constrained by SLOT_W */}
                <View
                    style={[st.action, st.leftAction]}
                    pointerEvents="box-none"
                >
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
                    ) : null}
                </View>

                <View
                    style={[st.action, st.rightAction]}
                    pointerEvents="box-none"
                >
                    {right ?? null}
                </View>
            </View>
        </View>
    );
};
