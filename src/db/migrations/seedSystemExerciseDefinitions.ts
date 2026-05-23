import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ExerciseDefinitionService } from '../services/exerciseDefinitions/exerciseDefinitionServiceFactory';

const SYSTEM_EXERCISE_DEFINITIONS_SEED_KEY =
    'system-exercise-definitions-seed-v1';

export const seedSystemExerciseDefinitionsOnce = async (
    exerciseDefinitionService: ExerciseDefinitionService,
): Promise<void> => {
    const existingMarker = await AsyncStorage.getItem(
        SYSTEM_EXERCISE_DEFINITIONS_SEED_KEY,
    );
    if (existingMarker !== null) return;

    exerciseDefinitionService.seedSystemDefinitions();

    await AsyncStorage.setItem(
        SYSTEM_EXERCISE_DEFINITIONS_SEED_KEY,
        JSON.stringify({
            seededAtMs: Date.now(),
        }),
    );
};
