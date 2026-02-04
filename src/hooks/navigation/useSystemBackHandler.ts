import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';
import type { EventArg } from '@react-navigation/native';

export interface UseSystemBackHandlerArgs {
    onSystemBack: () => boolean; // true => block default back
    isGestureBackDisabled?: boolean;
}

export const useSystemBackHandler = ({
    onSystemBack,
    isGestureBackDisabled = true,
}: UseSystemBackHandlerArgs): { allowNextBack: () => void } => {
    const navigation = useNavigation();
    const allowNextBackRef = useRef(false);

    const allowNextBack = () => {
        allowNextBackRef.current = true;
    };

    // Disable iOS swipe-back gesture
    useLayoutEffect(() => {
        navigation.setOptions({
            gestureEnabled: !isGestureBackDisabled,
        });
    }, [navigation, isGestureBackDisabled]);

    // Android hardware back button
    useFocusEffect(
        useCallback(() => {
            if (Platform.OS !== 'android') return;

            const sub = BackHandler.addEventListener('hardwareBackPress', () =>
                onSystemBack()
            );

            return () => sub.remove();
        }, [onSystemBack])
    );

    // Intercept navigation back actions (iOS back swipe / header back / goBack)
    useFocusEffect(
        useCallback(() => {
            const unsub = navigation.addListener(
                'beforeRemove',
                (
                    e: EventArg<
                        'beforeRemove',
                        true,
                        { action: { type: string } }
                    >
                ) => {
                    const actionType = e.data.action.type;
                    const isBackAction =
                        actionType === 'POP' || actionType === 'GO_BACK';

                    if (!isBackAction) return;

                    if (allowNextBackRef.current) {
                        allowNextBackRef.current = false;
                        return;
                    }

                    const handled = onSystemBack();
                    if (handled) e.preventDefault();
                }
            );

            return () => unsub();
        }, [navigation, onSystemBack])
    );

    return { allowNextBack };
};
