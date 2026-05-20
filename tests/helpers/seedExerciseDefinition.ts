import { eq } from 'drizzle-orm';

import type { ExerciseDefinition } from '@src/core/entities/entities';
import { exerciseDefinitionsTable } from '@src/db/schema';

import type { TestDb } from './createTestDb';

export const seedExerciseDefinition = (
    testDb: TestDb,
    definition: ExerciseDefinition,
): ExerciseDefinition => {
    const existingDefinition = testDb.db
        .select()
        .from(exerciseDefinitionsTable)
        .where(
            eq(
                exerciseDefinitionsTable.normalizedName,
                definition.normalizedName,
            ),
        )
        .get();

    if (existingDefinition) return existingDefinition;

    testDb.db.insert(exerciseDefinitionsTable).values(definition).run();

    return definition;
};
