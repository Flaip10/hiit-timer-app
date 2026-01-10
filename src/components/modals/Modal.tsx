import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
    Modal as RNModal,
    View,
    Animated,
    Easing,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { useModalStyles } from './Modal.styles';
import GuardedPressable from '../ui/GuardedPressable/GuardedPressable';

type ModalProps = {
    visible: boolean;
    onRequestClose: () => void;
    children: ReactNode;
    dismissOnBackdrop?: boolean;
    solidBackground?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
    animationType?: 'none' | 'slide' | 'fade';
};

export const Modal = ({
    visible,
    onRequestClose,
    children,
    dismissOnBackdrop = true,
    solidBackground = false,
    containerStyle,
    contentStyle,
    animationType = 'none',
}: ModalProps) => {
    const fade = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.96)).current;

    // This controls RNModal visibility (keep mounted while animating out)
    const [mounted, setMounted] = useState(visible);

    // guard stale callbacks
    const animTokenRef = useRef(0);

    const st = useModalStyles({ solidBackground });

    useEffect(() => {
        animTokenRef.current += 1;
        const token = animTokenRef.current;

        fade.stopAnimation();
        scale.stopAnimation();

        if (visible) {
            // ensure RNModal is shown first
            if (!mounted) setMounted(true);

            // reset baseline for a clean open (prevents “state saved” feeling)
            fade.setValue(0);
            scale.setValue(0.96);

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
            return;
        }

        // If we’re not mounted, nothing to close
        if (!mounted) return;

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
        ]).start(({ finished }) => {
            if (!finished) return;
            if (animTokenRef.current !== token) return; // stale
            // parent still wants it closed -> unmount
            setMounted(false);
        });
    }, [visible, mounted, fade, scale]);

    if (!mounted) return null;

    return (
        <RNModal
            visible={mounted} // IMPORTANT: not `visible`
            transparent
            animationType={animationType}
            onRequestClose={onRequestClose}
            statusBarTranslucent
        >
            <Animated.View style={[st.backdrop, { opacity: fade }]}>
                <GuardedPressable
                    style={st.backdropPress}
                    onPress={dismissOnBackdrop ? onRequestClose : undefined}
                />
            </Animated.View>

            <View
                style={[st.centerWrap, containerStyle]}
                pointerEvents="box-none"
            >
                <Animated.View
                    style={[
                        contentStyle,
                        { transform: [{ scale }], opacity: fade },
                    ]}
                >
                    {children}
                </Animated.View>
            </View>
        </RNModal>
    );
};
