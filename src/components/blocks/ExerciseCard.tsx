import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Exercise } from '@src/core/entities/entities';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { TextField } from '@src/components/ui/TextField/TextField';
import { Stepper } from '@src/components/ui/Stepper/Stepper';
import { useTheme } from '@src/theme/ThemeProvider';

import { useExerciseCardStyles } from './ExerciseCard.styles';

type Props = {
    index: number;
    exercise: Exercise;
    onChange: (next: Exercise) => void;
    onRemove: () => void;
};

export const ExerciseCard: React.FC<Props> = ({
    index,
    exercise,
    onChange,
    onRemove,
}) => {
    const { theme } = useTheme();
    const st = useExerciseCardStyles();

    const label = `Exercise ${index + 1}`;

    const setName = (v: string) => {
        onChange({
            ...exercise,
            name: v,
        });
    };

    const commitName = () => {
        const trimmed = exercise.name?.trim();

        onChange({
            ...exercise,
            name: trimmed && trimmed.length > 0 ? trimmed : undefined,
        });
    };

    const setDurationSec = (n: number) => {
        // For now we treat everything as time-based.
        // Ensure mode stays 'time' while editing in this screen.
        onChange({
            ...exercise,
            mode: 'time',
            value: n,
        });
    };

    return (
        <MetaCard
            containerStyle={st.card}
            topLeftContent={{
                text: label,
                icon: (
                    <Ionicons
                        name="barbell-outline"
                        size={14}
                        color={theme.palette.metaCard.topLeftContent.text}
                    />
                ),
            }}
            actionStrip={{
                icon: (
                    <Ionicons
                        name="trash-outline"
                        size={16}
                        color={theme.palette.metaCard.actionStrip.icon}
                    />
                ),
                backgroundColor: theme.palette.metaCard.actionStrip.background,
                onPress: onRemove,
            }}
            expandable={false}
        >
            <View style={st.body}>
                <TextField
                    label="Name"
                    value={exercise.name ?? ''}
                    placeholder={label}
                    onChangeText={setName}
                    onBlur={commitName}
                />

                <View style={st.durationRow}>
                    <Stepper
                        label="Duration (sec)"
                        value={exercise.value}
                        onChange={setDurationSec}
                        min={1}
                        step={5}
                    />
                </View>
            </View>
        </MetaCard>
    );
};
