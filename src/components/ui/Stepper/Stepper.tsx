import React, { useCallback, useState } from 'react';
import { TextInput, View } from 'react-native';

import { useStepperStyles } from './Stepper.styles';
import { MiniButton } from './MiniButton';
import { FieldLabel } from '@src/components/ui/FieldLabel/FieldLabel';
import type { TextTone } from '@src/components/ui/Typography/AppText';

interface Props {
    value: number;
    onChange: (next: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    labelTone?: TextTone;
    formatValue?: (value: number) => string;
    testID?: string;
}

const clamp = (n: number, min?: number, max?: number) =>
    Math.max(
        min ?? Number.NEGATIVE_INFINITY,
        Math.min(max ?? Number.POSITIVE_INFINITY, n)
    );

export const Stepper: React.FC<Props> = ({
    value,
    onChange,
    min = 0,
    max,
    step = 1,
    label,
    labelTone = 'secondary',
    formatValue,
    testID,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const st = useStepperStyles({ isFocused });

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

    const disableDec = value <= min;
    const disableInc = max !== undefined && value >= max;
    const inputValue =
        !isFocused && formatValue ? formatValue(value) : String(value);

    return (
        <View style={st.wrap}>
            {label ? <FieldLabel label={label} tone={labelTone} /> : null}

            <View style={st.row}>
                <MiniButton
                    label="–"
                    onPress={dec}
                    disabled={disableDec}
                    buttonStyle={st.miniButton}
                    disabledStyle={st.miniButtonDisabled}
                    textStyle={st.miniButtonText}
                    pressedStyle={st.pressed}
                />

                <TextInput
                    keyboardType="number-pad"
                    value={inputValue}
                    onChangeText={onText}
                    style={st.input}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    returnKeyType="done"
                    testID={testID}
                />

                <MiniButton
                    label="+"
                    onPress={inc}
                    disabled={disableInc}
                    buttonStyle={st.miniButton}
                    disabledStyle={st.miniButtonDisabled}
                    textStyle={st.miniButtonText}
                    pressedStyle={st.pressed}
                />
            </View>
        </View>
    );
};
