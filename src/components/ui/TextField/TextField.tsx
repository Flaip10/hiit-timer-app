import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View, Text } from 'react-native';

import type { TextFieldProps } from './TextField.interfaces';
import { useTextFieldStyles } from './TextField.styles';
import { useMainContainerScroll } from '@src/components/layout/MainContainer/MainContainerScrollContext';
import { useTheme } from '@src/theme/ThemeProvider';
import { FieldLabel } from '../FieldLabel/FieldLabel';
import { Dropdown } from '../Dropdown/Dropdown';
import { AppText } from '../Typography/AppText';
import { CollapseFade } from '../CollapseFade/CollapseFade';

interface FieldMessage {
    text: string;
    isError: boolean;
}

export const TextField = forwardRef<View, TextFieldProps>(({
    label,
    labelTone = 'primary',
    helperText,
    errorText,
    containerStyle,
    inputStyle,
    rightAccessory,
    suggestions = [],
    onSuggestionPress,
    multiline,
    autoHideErrorOnChange = true,
    onFocus,
    onBlur,
    ...inputProps
}, ref) => {
    const { theme } = useTheme();
    const scrollContext = useMainContainerScroll();
    const anchorRef = useRef<View | null>(null);
    const inputRef = useRef<TextInput | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [areSuggestionsDismissed, setAreSuggestionsDismissed] =
        useState(false);
    const [squelched, setSquelched] = useState(false);

    // Extract onChangeText so we can wrap it
    const { onChangeText, returnKeyType = 'done', ...restInputProps } = inputProps;

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
    let activeMessageText: string | undefined;
    if (showError) activeMessageText = errorText;
    else if (showHelper) activeMessageText = helperText;

    // Retain the last message so it stays readable while the slot collapses.
    // Updated synchronously during render (not via effect) so the text is
    // present in the same render where visible becomes true — avoiding an
    // empty-content onLayout measurement that clips the slot.
    const lastMessageRef = useRef<FieldMessage | null>(null);
    if (activeMessageText) {
        lastMessageRef.current = {
            text: activeMessageText,
            isError: showError,
        };
    }
    const renderedMessage = lastMessageRef.current;

    const canShowSuggestionsForKeyboard =
        !scrollContext || scrollContext.canShowInputDropdowns;
    const showSuggestions =
        isFocused &&
        canShowSuggestionsForKeyboard &&
        !areSuggestionsDismissed &&
        suggestions.length > 0 &&
        !!onSuggestionPress;

    const handleChangeText = (value: string) => {
        if (autoHideErrorOnChange && errorText && !squelched) {
            setSquelched(true);
        }

        setAreSuggestionsDismissed(false);
        if (onChangeText) {
            onChangeText(value);
        }
    };

    const closeSuggestions = () => {
        setAreSuggestionsDismissed(true);
    };

    return (
        <View ref={ref} style={[st.container, containerStyle]}>
            {!!label && (
                <View style={st.labelRow}>
                    <FieldLabel label={label} tone={labelTone} />
                </View>
            )}

            <View ref={anchorRef} style={st.inputAnchor}>
                <TextInput
                    {...restInputProps}
                    ref={inputRef}
                    multiline={multiline}
                    returnKeyType={returnKeyType}
                    style={[st.input, inputStyle]}
                    placeholderTextColor={theme.palette.text.muted}
                    onFocus={(e) => {
                        setIsFocused(true);
                        setAreSuggestionsDismissed(false);
                        scrollContext?.scrollFocusedInputIntoView(anchorRef);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        onBlur?.(e);
                    }}
                    onChangeText={handleChangeText}
                />

                {!!rightAccessory && (
                    <View style={st.rightAccessoryContainer}>
                        {rightAccessory}
                    </View>
                )}
            </View>

            {suggestions.length > 0 && !!onSuggestionPress && (
                <Dropdown
                    visible={showSuggestions}
                    anchorRef={anchorRef}
                    position={{
                        side: 'bottom',
                        align: 'start',
                        offset: {
                            y: 4,
                        },
                    }}
                    matchAnchorWidth
                    onClose={closeSuggestions}
                    surfaceStyle={st.suggestionsSurface}
                >
                    <View>
                        {suggestions.map((suggestion, index) => (
                            <Pressable
                                key={suggestion.id}
                                onPress={() => {
                                    setAreSuggestionsDismissed(true);
                                    onSuggestionPress(suggestion);
                                    inputRef.current?.blur();
                                }}
                                style={({ pressed }) => [
                                    st.suggestionRow,
                                    index === 0 ? st.suggestionRowFirst : null,
                                    pressed ? st.suggestionRowPressed : null,
                                ]}
                            >
                                <AppText
                                    variant="body"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    style={st.suggestionLabel}
                                >
                                    {suggestion.label}
                                </AppText>
                            </Pressable>
                        ))}
                    </View>
                </Dropdown>
            )}

            <CollapseFade visible={!!activeMessageText}>
                <Text
                    style={
                        renderedMessage?.isError ? st.errorText : st.helperText
                    }
                >
                    {renderedMessage?.text}
                </Text>
            </CollapseFade>
        </View>
    );
});

TextField.displayName = 'TextField';
