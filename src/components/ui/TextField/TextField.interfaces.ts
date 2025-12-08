import type { ReactNode } from 'react';
import type {
    TextInputProps,
    StyleProp,
    ViewStyle,
    TextStyle,
} from 'react-native';

export interface TextFieldProps extends TextInputProps {
    label?: string;
    helperText?: string;
    errorText?: string;
    autoHideErrorOnChange?: boolean;

    containerStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
    rightAccessory?: ReactNode;
}
