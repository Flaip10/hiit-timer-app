import type { PressableProps, StyleProp, ViewStyle } from 'react-native';

export type HoldButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface HoldToConfirmButtonProps
    extends Omit<
        PressableProps,
        | 'style'
        | 'children'
        | 'onPress'
        | 'onPressIn'
        | 'onPressOut'
        | 'onLongPress'
        | 'delayLongPress'
    > {
    title: string;
    onConfirmed: () => void;
    holdDurationMs?: number;
    variant?: HoldButtonVariant;
    style?: StyleProp<ViewStyle>;
}
