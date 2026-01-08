import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@src/theme/ThemeProvider';
import { AppText } from '@src/components/ui/Typography/AppText';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { useOptionPillsStyles } from './OptionPills.styles';

export interface OptionPillsOption<T extends string> {
    value: T;
    label: string;
    leftSlot?: React.ReactNode;
}

export interface OptionPillsProps<T extends string> {
    options: OptionPillsOption<T>[];
    selectedValue: T;
    onSelect: (value: T) => void;
}

export const OptionPills = <T extends string>({
    options,
    selectedValue,
    onSelect,
}: OptionPillsProps<T>) => {
    const { theme } = useTheme();
    const st = useOptionPillsStyles();

    return (
        <View style={st.container}>
            {options.map(({ value, label, leftSlot }) => {
                const isActive = selectedValue === value;

                return (
                    <GuardedPressable
                        key={value}
                        onPress={() => onSelect(value)}
                        style={[
                            st.pill,
                            isActive && {
                                borderColor: theme.palette.accent.primary,
                                backgroundColor: theme.palette.accent.soft,
                            },
                        ]}
                    >
                        <View style={st.pillContent}>
                            {leftSlot && (
                                <View style={st.leftSlot}>{leftSlot}</View>
                            )}
                            <AppText
                                variant="bodySmall"
                                tone={isActive ? 'primary' : 'muted'}
                            >
                                {label}
                            </AppText>
                        </View>
                    </GuardedPressable>
                );
            })}
        </View>
    );
};
