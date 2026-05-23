import type { Workout } from '@src/core/entities/entities';
import {
    workoutBlocksTable,
    workoutExercisesTable,
    workoutVersionsTable,
    workoutsTable,
} from '@src/db/schema';

import { createExerciseDefinitionFixture } from '../fixtures/exerciseDefinitions';

import type { TestDb } from './createTestDb';
import { seedExerciseDefinition } from './seedExerciseDefinition';

interface SeedWorkoutVersionResult {
    versionId: string;
}

const seedWorkoutVersion = (
    testDb: TestDb,
    workout: Workout,
): SeedWorkoutVersionResult => {
    const versionId = `${workout.id}-version`;

    testDb.db
        .insert(workoutVersionsTable)
        .values({
            id: versionId,
            name: workout.name,
            updatedAtMs: workout.updatedAtMs,
        })
        .run();

    workout.blocks.forEach((block, blockIndex) => {
        testDb.db
            .insert(workoutBlocksTable)
            .values({
                id: block.id,
                workoutVersionId: versionId,
                sortIndex: blockIndex,
                title: block.title ?? null,
                sets: block.sets,
                restBetweenSetsSec: block.restBetweenSetsSec,
                restBetweenExercisesSec: block.restBetweenExercisesSec,
            })
            .run();

        block.exercises.forEach((exercise, exerciseIndex) => {
            testDb.db
                .insert(workoutExercisesTable)
                .values({
                    id: exercise.id,
                    blockId: block.id,
                    sortIndex: exerciseIndex,
                    exerciseDefinitionId: exercise.name
                        ? seedExerciseDefinition(
                              testDb,
                              createExerciseDefinitionFixture({
                                  name: exercise.name,
                              }),
                          ).id
                        : exercise.exerciseDefinitionId ?? null,
                    mode: exercise.mode,
                    value: exercise.value,
                    tempo: exercise.tempo ?? null,
                })
                .run();
        });
    });

    return { versionId };
};

export const seedPersistedWorkout = (
    testDb: TestDb,
    workout: Workout,
): SeedWorkoutVersionResult => {
    const result = seedWorkoutVersion(testDb, workout);

    testDb.db
        .insert(workoutsTable)
        .values({
            id: workout.id,
            name: workout.name,
            currentVersionId: result.versionId,
            createdAtMs: workout.updatedAtMs,
            isFavorite: workout.isFavorite === true,
            sortIndex: -workout.updatedAtMs,
        })
        .run();

    return result;
};
