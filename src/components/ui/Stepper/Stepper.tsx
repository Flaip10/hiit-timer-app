import React, { useCallback, useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useStepperStyles } from './Stepper.styles';

type Props = {
    value: number;
    onChange: (next: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    testID?: string;
};

const clamp = (n: number, min?: number, max?: number) =>
    Math.max(
        min ?? Number.NEGATIVE_INFINITY,
        Math.min(max ?? Number.POSITIVE_INFINITY, n)
    );

export const Stepper = ({
    value,
    onChange,
    min = 0,
    max,
    step = 1,
    label,
    testID,
}: Props) => {
    const st = useStepperStyles();
    const ref = useRef<TextInput>(null);

    const inc = useCallback(
        () => onChange(clamp(value + step, min, max)),
        [onChange, value, step, min, max]
    );

    const dec = useCallback(
        () => onChange(clamp(value - step, min, max)),
        [onChange, value, step, min, max]
    );

    const onText = useCallback(
        (txt: string) => {
            const n = parseInt((txt || '0').replace(/\D+/g, ''), 10);
            if (Number.isFinite(n)) onChange(clamp(n, min, max));
        },
        [onChange, min, max]
    );

    return (
        <View style={st.wrap}>
            {label ? <Text style={st.label}>{label}</Text> : null}
            <View style={st.row}>
                <Pressable
                    onPress={dec}
                    style={({ pressed }) => [st.btn, pressed && st.pressed]}
                    accessibilityLabel={`${label ?? 'value'} decrement`}
                    testID={testID ? `${testID}-dec` : undefined}
                >
                    <Text style={st.btnText}>–</Text>
                </Pressable>

                <TextInput
                    ref={ref}
                    keyboardType="number-pad"
                    value={String(value)}
                    onChangeText={onText}
                    style={st.input}
                    returnKeyType="done"
                    testID={testID}
                />

                <Pressable
                    onPress={inc}
                    style={({ pressed }) => [st.btn, pressed && st.pressed]}
                    accessibilityLabel={`${label ?? 'value'} increment`}
                    testID={testID ? `${testID}-inc` : undefined}
                >
                    <Text style={st.btnText}>+</Text>
                </Pressable>
            </View>
        </View>
    );
};
