import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useRouter, useSegments } from 'expo-router';
import { IconButton } from './IconButton';

type Props = {
    title?: string;
    right?: React.ReactNode;
    forceBack?: boolean;
    onTitlePress?: () => void;
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

    // ✅ detect if we're in the drawer
    const isInDrawer = segments[0] === '(drawer)';

    // ✅ detect back availability
    // @ts-ignore
    const canGoBack =
        forceBack || (typeof nav.canGoBack === 'function' && nav.canGoBack());

    const showHamburger = isInDrawer;
    const showBack = !isInDrawer && canGoBack;

    const onBack = () => {
        try {
            router.back();
        } catch {
            // @ts-ignore fallback to nav if router fails
            if (typeof nav.goBack === 'function' && nav.canGoBack?.())
                nav.goBack();
        }
    };

    const onOpenDrawer = () => {
        try {
            // @ts-ignore safe dispatch
            nav.dispatch?.(DrawerActions.openDrawer());
        } catch {
            // no-op if drawer doesn't exist
        }
    };

    return (
        <View style={st.root}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView edges={['top']} style={st.safeTop} />
            <View style={st.bar}>
                {showBack ? (
                    <IconButton onPress={onBack}>
                        <Ionicons
                            name="chevron-back"
                            size={22}
                            color="#E5E7EB"
                        />
                    </IconButton>
                ) : showHamburger ? (
                    <IconButton onPress={onOpenDrawer}>
                        <Ionicons name="menu" size={22} color="#E5E7EB" />
                    </IconButton>
                ) : (
                    <View style={{ width: 36, height: 36 }} />
                )}

                <Text
                    numberOfLines={1}
                    onPress={onTitlePress}
                    style={[
                        st.title,
                        onTitlePress ? st.titleInteractive : null,
                    ]}
                >
                    {title ?? ''}
                </Text>

                <View style={st.right}>
                    {right ?? <View style={{ width: 22, height: 22 }} />}
                </View>
            </View>
        </View>
    );
};

const st = StyleSheet.create({
    root: {
        backgroundColor: '#0B0B0C',
        borderBottomWidth: 1,
        borderBottomColor: '#1F1F23',
    },
    safeTop: { backgroundColor: '#0B0B0C' },
    bar: {
        height: 56,
        backgroundColor: '#0B0B0C',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        gap: 8,
    },
    title: {
        flex: 1,
        color: '#F2F2F2',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    titleInteractive: { opacity: 0.95 },
    right: { width: 36, alignItems: 'center', justifyContent: 'center' },
});
