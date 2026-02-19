import React, { useEffect, useState } from 'react';
import { TextInput, View, Text } from 'react-native';

import type { TextFieldProps } from './TextField.interfaces';
import { useTextFieldStyles } from './TextField.styles';
import { useTheme } from '@src/theme/ThemeProvider';
import { FieldLabel } from '../FieldLabel/FieldLabel';

export const TextField: React.FC<TextFieldProps> = ({
    label,
    labelTone = 'primary',
    helperText,
    errorText,
    containerStyle,
    inputStyle,
    rightAccessory,
    multiline,
    autoHideErrorOnChange = true,
    onFocus,
    onBlur,
    ...inputProps
}) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [squelched, setSquelched] = useState(false);

    // Extract onChangeText so we can wrap it
    const { onChangeText, ...restInputProps } = inputProps;

    // Reset squelch whenever the external error changes / clears
    useEffect(() => {
        if (!errorText) {
            setSquelched(false);
        }
    }, [errorText]);

    const hasError = !!errorText && !(autoHideErrorOnChange && squelched);

    const st = useTextFieldStyles({
        hasError,
        isFocused,
        multiline,
    });

    const showHelper = !!helperText && !hasError;
    const showError = hasError;

    const handleChangeText = (value: string) => {
        if (autoHideErrorOnChange && errorText && !squelched) {
            setSquelched(true);
        }

        if (onChangeText) {
            onChangeText(value);
        }
    };

    return (
        <View style={[st.container, containerStyle]}>
            {label ? (
                <View style={st.labelRow}>
                    <FieldLabel label={label} tone={labelTone} />
                </View>
            ) : null}

            <TextInput
                {...restInputProps}
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
                onChangeText={handleChangeText}
            />

            {rightAccessory ? (
                <View style={st.rightAccessoryContainer}>{rightAccessory}</View>
            ) : null}

            {showHelper && <Text style={st.helperText}>{helperText}</Text>}
            {showError && <Text style={st.errorText}>{errorText}</Text>}
        </View>
    );
};
