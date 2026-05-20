import type { ExerciseDefinition } from '@src/core/entities/entities';
import { normalizeExerciseName } from '@src/core/exercises/normalizeExerciseName';

export interface ExerciseDefinitionFixtureArgs {
    availability?: ExerciseDefinition['availability'];
    createdAtMs?: number;
    id?: string;
    name?: string;
    source?: ExerciseDefinition['source'];
    updatedAtMs?: number;
}

export const createExerciseDefinitionFixture = (
    args: ExerciseDefinitionFixtureArgs = {},
): ExerciseDefinition => {
    const name = args.name ?? 'Jumping Jacks';
    const createdAtMs = args.createdAtMs ?? 1_800_000_000_000;

    return {
        id: args.id ?? `definition-${normalizeExerciseName(name)}`,
        name,
        normalizedName: normalizeExerciseName(name),
        source: args.source ?? 'user',
        availability: args.availability ?? 'both',
        createdAtMs,
        updatedAtMs: args.updatedAtMs ?? createdAtMs,
    };
};
