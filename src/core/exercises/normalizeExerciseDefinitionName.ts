import { normalizeExerciseName } from './normalizeExerciseName';

export interface NormalizedExerciseDefinitionName {
    name: string;
    normalizedName: string;
}

export const normalizeExerciseDefinitionName = (
    name: string,
): NormalizedExerciseDefinitionName => {
    const trimmedName = name.trim();
    const normalizedName = normalizeExerciseName(trimmedName);

    if (normalizedName.length === 0) {
        throw new Error('Exercise definition name cannot be blank');
    }

    return {
        name: trimmedName,
        normalizedName,
    };
};
