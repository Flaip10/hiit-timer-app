import { ReactNode, useEffect, useRef, useState } from 'react';
import { Modal as RNModal, View, Animated, Easing } from 'react-native';
import { useModalStyles } from './Modal.styles';
import GuardedPressable from '../ui/GuardedPressable/GuardedPressable';

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

    const st = useModalStyles();

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
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onRequestClose}
            statusBarTranslucent
        >
            <Animated.View style={[st.backdrop, { opacity: fade }]}>
                <GuardedPressable
                    style={st.backdropPress}
                    onPress={dismissOnBackdrop ? onRequestClose : undefined}
                />
            </Animated.View>

            <View style={st.centerWrap} pointerEvents="box-none">
                <Animated.View
                    style={[
                        st.sheet,
                        { transform: [{ scale }], opacity: fade },
                    ]}
                >
                    {children}
                </Animated.View>
            </View>
        </RNModal>
    );
};
