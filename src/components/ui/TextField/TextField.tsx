import React, { useState } from 'react';
import { TextInput, View, Text } from 'react-native';

import type { TextFieldProps } from './TextField.interfaces';
import { useTextFieldStyles } from './TextField.styles';
import { useTheme } from '@src/theme/ThemeProvider';

export const TextField: React.FC<TextFieldProps> = ({
    label,
    helperText,
    errorText,
    containerStyle,
    inputStyle,
    rightAccessory,
    multiline,
    onFocus,
    onBlur,
    ...inputProps
}) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const hasError = !!errorText;
    const st = useTextFieldStyles({
        hasError,
        isFocused,
        multiline,
    });

    const showHelper = !!helperText && !hasError;
    const showError = hasError;

    return (
        <View style={[st.container, containerStyle]}>
            {label ? (
                <View style={st.labelRow}>
                    <Text style={st.label}>{label}</Text>
                </View>
            ) : null}

            <TextInput
                {...inputProps}
                multiline={multiline}
                style={[st.input, inputStyle]}
                placeholderTextColor={theme.palette.text.muted}
                onFocus={(e) => {
                    setIsFocused(true);
                    onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    onBlur?.(e);
                }}
            />
            {rightAccessory ? (
                <View style={st.rightAccessoryContainer}>{rightAccessory}</View>
            ) : null}

            {showHelper && <Text style={st.helperText}>{helperText}</Text>}
            {showError && <Text style={st.errorText}>{errorText}</Text>}
        </View>
    );
};
