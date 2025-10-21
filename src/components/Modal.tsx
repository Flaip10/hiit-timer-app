import { ReactNode, useEffect, useRef, useState } from 'react';
import {
    Modal as RNModal,
    View,
    Pressable,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';

type ModalProps = {
    visible: boolean;
    onRequestClose: () => void;
    children: ReactNode;
    dismissOnBackdrop?: boolean;
};

export const Modal = ({
    visible,
    onRequestClose,
    children,
    dismissOnBackdrop = true,
}: ModalProps) => {
    const fade = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.96)).current;
    const [rendered, setRendered] = useState(visible);

    useEffect(() => {
        if (visible) {
            setRendered(true);
            Animated.parallel([
                Animated.timing(fade, {
                    toValue: 1,
                    duration: 180,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                    bounciness: 6,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fade, {
                    toValue: 0,
                    duration: 180,
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 0.96,
                    duration: 180,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ]).start(() => setRendered(false));
        }
    }, [visible, fade, scale]);

    if (!rendered) return null;

    return (
        <RNModal
            visible
            transparent
            animationType="none"
            onRequestClose={onRequestClose}
            statusBarTranslucent
        >
            <Animated.View style={[s.backdrop, { opacity: fade }]}>
                <Pressable
                    style={s.backdropPress}
                    onPress={dismissOnBackdrop ? onRequestClose : undefined}
                />
            </Animated.View>

            <View style={s.centerWrap} pointerEvents="box-none">
                <Animated.View
                    style={[s.sheet, { transform: [{ scale }], opacity: fade }]}
                >
                    {children}
                </Animated.View>
            </View>
        </RNModal>
    );
};

const s = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    backdropPress: { flex: 1 },
    centerWrap: { flex: 1, justifyContent: 'center', padding: 24 },
    sheet: {
        backgroundColor: '#131316',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1F1F23',
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
});
