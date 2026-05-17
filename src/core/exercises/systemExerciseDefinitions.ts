import type { ExerciseDefinition } from '@src/core/entities/entities';
import { uid } from '@src/core/id';

import { normalizeExerciseName } from './normalizeExerciseName';

const SYSTEM_EXERCISE_CREATED_AT_MS = 1_700_000_000_000;

const systemExerciseDefinitionSeeds = [
    'Burpee',
    'High Knees',
    'Jumping Jacks',
    'Lunge',
    'Mountain Climber',
    'Plank',
    'Push Up',
    'Squat',
    'Wall Sit',
];

export const systemExerciseDefinitions: ExerciseDefinition[] =
    systemExerciseDefinitionSeeds.map((name) => ({
        id: uid(),
        name,
        normalizedName: normalizeExerciseName(name),
        source: 'system',
        availability: 'both',
        createdAtMs: SYSTEM_EXERCISE_CREATED_AT_MS,
        updatedAtMs: SYSTEM_EXERCISE_CREATED_AT_MS,
    }));
