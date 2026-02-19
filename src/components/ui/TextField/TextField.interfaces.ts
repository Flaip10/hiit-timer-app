import type { ReactNode } from 'react';
import type {
    TextInputProps,
    StyleProp,
    ViewStyle,
    TextStyle,
} from 'react-native';
import type { TextTone } from '../Typography/AppText';

export interface TextFieldProps extends TextInputProps {
    label?: string;
    labelTone?: TextTone;
    helperText?: string;
    errorText?: string;
    autoHideErrorOnChange?: boolean;

    containerStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
    rightAccessory?: ReactNode;
}
