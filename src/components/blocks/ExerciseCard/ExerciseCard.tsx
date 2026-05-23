import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import type { WorkoutExercise } from '@src/core/entities/entities';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { TextField } from '@src/components/ui/TextField/TextField';
import { Stepper } from '@src/components/ui/Stepper/Stepper';
import { useTheme } from '@src/theme/ThemeProvider';

import { useExerciseCardStyles } from './ExerciseCard.styles';
import { useExerciseCard } from './useExerciseCard';

interface ExerciseCardProps {
    index: number;
    exercise: WorkoutExercise;
    nameErrorText?: string;
    onChange: (next: WorkoutExercise) => void;
    onRemove: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
    index,
    exercise,
    nameErrorText,
    onChange,
    onRemove,
}) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useExerciseCardStyles();
    const { nameField, setDurationSec } = useExerciseCard({
        exercise,
        onChange,
    });

    const label = t('common.labels.exerciseWithIndex', { index: index + 1 });

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
                    label={t('editWorkout.fields.name')}
                    value={nameField.value}
                    placeholder={label}
                    onChangeText={nameField.handleChangeText}
                    onBlur={nameField.handleBlur}
                    suggestions={nameField.suggestions}
                    onSuggestionPress={nameField.handleSuggestionPress}
                    errorText={nameErrorText}
                />

                <View style={st.durationRow}>
                    <Stepper
                        label={t('editBlock.fields.exerciseDurationSec')}
                        labelTone="primary"
                        value={exercise.value}
                        onChange={setDurationSec}
                        formatValue={(next) =>
                            `${next} ${t('editBlock.units.secondsShort')}`
                        }
                        min={1}
                        step={5}
                    />
                </View>
            </View>
        </MetaCard>
    );
};
