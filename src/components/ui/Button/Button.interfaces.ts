import type { PressableProps, TextStyle, ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface ButtonProps
    extends Omit<PressableProps, 'style' | 'children' | 'onPress'> {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    flex?: number | boolean;
}
