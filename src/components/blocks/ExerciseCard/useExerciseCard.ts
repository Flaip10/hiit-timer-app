import { useMemo, useRef } from 'react';

import type { WorkoutExercise } from '@src/core/entities/entities';
import type { TextFieldSuggestionItem } from '@src/components/ui/TextField/TextField.interfaces';
import { useExerciseDefinitionSuggestions } from '@src/data/exerciseDefinitions';

interface UseExerciseCardArgs {
    exercise: WorkoutExercise;
    onChange: (next: WorkoutExercise) => void;
}

interface UseExerciseCardResult {
    nameField: {
        handleBlur: () => void;
        handleChangeText: (value: string) => void;
        handleSuggestionPress: (suggestion: TextFieldSuggestionItem) => void;
        suggestions: TextFieldSuggestionItem[];
        value: string;
    };
    setDurationSec: (value: number) => void;
}

export const useExerciseCard = ({
    exercise,
    onChange,
}: UseExerciseCardArgs): UseExerciseCardResult => {
    const shouldSkipBlurCommitRef = useRef(false);
    const exerciseDefinitionSuggestions = useExerciseDefinitionSuggestions(
        exercise.name ?? '',
    );
    const suggestions = useMemo<TextFieldSuggestionItem[]>(
        () =>
            exerciseDefinitionSuggestions.map((suggestion) => ({
                id: suggestion.id,
                label: suggestion.name,
            })),
        [exerciseDefinitionSuggestions],
    );

    const handleNameChange = (value: string): void => {
        onChange({
            ...exercise,
            name: value,
            exerciseDefinitionId: undefined,
        });
    };

    const handleNameSuggestionPress = (
        suggestion: TextFieldSuggestionItem,
    ): void => {
        shouldSkipBlurCommitRef.current = true;

        onChange({
            ...exercise,
            name: suggestion.label,
            exerciseDefinitionId: suggestion.id,
        });
    };

    const handleNameBlur = (): void => {
        if (shouldSkipBlurCommitRef.current) {
            shouldSkipBlurCommitRef.current = false;
            return;
        }

        const trimmed = exercise.name?.trim();

        onChange({
            ...exercise,
            name: trimmed && trimmed.length > 0 ? trimmed : undefined,
        });
    };

    const setDurationSec = (value: number): void => {
        onChange({
            ...exercise,
            mode: 'time',
            value,
        });
    };

    return {
        nameField: {
            handleBlur: handleNameBlur,
            handleChangeText: handleNameChange,
            handleSuggestionPress: handleNameSuggestionPress,
            suggestions,
            value: exercise.name ?? '',
        },
        setDurationSec,
    };
};
