import { expect } from '@jest/globals';
import { asc, eq } from 'drizzle-orm';

import type { Workout } from '@src/core/entities/entities';
import type { Clock } from '@src/db/repositories/repositoryClock';
import {
    exerciseDefinitionsTable,
    workoutBlocksTable,
    workoutExercisesTable,
    workoutVersionsTable,
    workoutsTable,
} from '@src/db/schema';

import { createTestDb, type TestDb } from './createTestDb';

export interface RepositoryContext {
    testDb: TestDb;
}

type WorkoutRow = typeof workoutsTable.$inferSelect;
type WorkoutVersionRow = typeof workoutVersionsTable.$inferSelect;

export const createRepositoryContext = (
    clock?: Clock,
): RepositoryContext => ({
    testDb: createTestDb(clock),
});

export const readWorkoutRowOrThrow = (
    testDb: TestDb,
    workoutId: string,
): WorkoutRow => {
    const workout = testDb.db
        .select()
        .from(workoutsTable)
        .where(eq(workoutsTable.id, workoutId))
        .get();

    expect(workout).toBeDefined();
    if (!workout) {
        throw new Error(`Expected workout row ${workoutId}`);
    }

    return workout;
};

export const readWorkoutVersionRowOrThrow = (
    testDb: TestDb,
    versionId: string,
): WorkoutVersionRow => {
    const version = testDb.db
        .select()
        .from(workoutVersionsTable)
        .where(eq(workoutVersionsTable.id, versionId))
        .get();

    expect(version).toBeDefined();
    if (!version) {
        throw new Error(`Expected workout version row ${versionId}`);
    }

    return version;
};

export const expectWorkoutVersionRowsToMatchFixture = (
    testDb: TestDb,
    versionId: string,
    expected: Workout,
): void => {
    const version = readWorkoutVersionRowOrThrow(testDb, versionId);

    expect(version).toMatchObject({
        id: versionId,
        name: expected.name,
        updatedAtMs: expected.updatedAtMs,
    });

    const blocks = testDb.db
        .select()
        .from(workoutBlocksTable)
        .where(eq(workoutBlocksTable.workoutVersionId, versionId))
        .orderBy(asc(workoutBlocksTable.sortIndex))
        .all();

    expect(blocks).toHaveLength(expected.blocks.length);

    expected.blocks.forEach((expectedBlock, blockIndex) => {
        const block = blocks[blockIndex];

        expect(block).toMatchObject({
            workoutVersionId: versionId,
            sortIndex: blockIndex,
            title: expectedBlock.title ?? null,
            sets: expectedBlock.sets,
            restBetweenSetsSec: expectedBlock.restBetweenSetsSec,
            restBetweenExercisesSec: expectedBlock.restBetweenExercisesSec,
        });

        const exercises = testDb.db
            .select()
            .from(workoutExercisesTable)
            .where(eq(workoutExercisesTable.blockId, block.id))
            .orderBy(asc(workoutExercisesTable.sortIndex))
            .all();

        expect(exercises).toHaveLength(expectedBlock.exercises.length);

        expectedBlock.exercises.forEach((expectedExercise, exerciseIndex) => {
            const exercise = exercises[exerciseIndex];

            expect(exercise).toMatchObject({
                blockId: block.id,
                sortIndex: exerciseIndex,
                mode: expectedExercise.mode,
                value: expectedExercise.value,
                tempo: expectedExercise.tempo ?? null,
            });

            if (!expectedExercise.name) return;

            const definition = exercise.exerciseDefinitionId
                ? testDb.db
                      .select()
                      .from(exerciseDefinitionsTable)
                      .where(
                          eq(
                              exerciseDefinitionsTable.id,
                              exercise.exerciseDefinitionId,
                          ),
                      )
                      .get()
                : undefined;

            expect(definition?.name).toBe(expectedExercise.name);
        });
    });
};

export const expectHydratedWorkoutToMatchFixture = (
    actual: Workout | null | undefined,
    expected: Workout,
): void => {
    expect(actual).not.toBeNull();
    expect(actual).toBeDefined();
    if (!actual) throw new Error(`Expected workout ${expected.id}`);

    expect(actual).toMatchObject({
        id: expected.id,
        name: expected.name,
        updatedAtMs: expected.updatedAtMs,
        isFavorite: expected.isFavorite === true,
    });
    expect(actual.blocks).toHaveLength(expected.blocks.length);

    expected.blocks.forEach((expectedBlock, blockIndex) => {
        const actualBlock = actual.blocks[blockIndex];

        expect(actualBlock).toMatchObject({
            title: expectedBlock.title,
            sets: expectedBlock.sets,
            restBetweenSetsSec: expectedBlock.restBetweenSetsSec,
            restBetweenExercisesSec: expectedBlock.restBetweenExercisesSec,
        });
        expect(actualBlock.exercises).toHaveLength(
            expectedBlock.exercises.length,
        );

        expectedBlock.exercises.forEach((expectedExercise, exerciseIndex) => {
            expect(actualBlock.exercises[exerciseIndex]).toMatchObject({
                name: expectedExercise.name,
                mode: expectedExercise.mode,
                value: expectedExercise.value,
                tempo: expectedExercise.tempo,
            });
        });
    });
};
