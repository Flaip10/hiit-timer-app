import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { asc, eq } from 'drizzle-orm';

import type { Workout } from '@src/core/entities/entities';
import type { Clock } from '@src/db/repositories/repositoryClock';
import {
    exerciseDefinitionsTable,
    workoutBlocksTable,
    workoutExercisesTable,
    workoutSessionsTable,
    workoutVersionsTable,
    workoutsTable,
} from '@src/db/schema';

import { createTestDb, type TestDb } from '../../helpers/createTestDb';
import {
    createChangedWorkoutContent,
    createWorkoutFixture,
} from '../../fixtures/workouts';
import { seedPersistedWorkout } from '../../helpers/seedWorkout';
import { seedWorkoutSession } from '../../helpers/seedWorkoutSession';

const RESTORE_CREATED_AT_MS = 1_900_000_000_000;

interface RepositoryContext {
    testDb: TestDb;
}

type WorkoutRow = typeof workoutsTable.$inferSelect;

const createRepositoryContext = (clock?: Clock): RepositoryContext => ({
    testDb: createTestDb(clock),
});

const readWorkoutRowOrThrow = (
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

const expectWorkoutVersionRowsToMatchFixture = (
    testDb: TestDb,
    versionId: string,
    expected: Workout,
): void => {
    const version = testDb.db
        .select()
        .from(workoutVersionsTable)
        .where(eq(workoutVersionsTable.id, versionId))
        .get();

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

const expectHydratedWorkoutToMatchFixture = (
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

describe('workoutService integration', () => {
    let context: RepositoryContext;

    beforeEach(() => {
        context = createRepositoryContext();
    });

    afterEach(() => {
        context.testDb.close();
    });

    it('getAll returns hydrated workouts with correct name, blocks and isFavorite', () => {
        const workout = createWorkoutFixture({
            name: 'Morning HIIT',
            isFavorite: true,
        });
        const { workoutService } = context.testDb.dbServices;

        seedPersistedWorkout(context.testDb, workout);

        const workouts = workoutService.getAll();

        expectHydratedWorkoutToMatchFixture(workouts[0], workout);
    });

    it('getAll orders favorites first, then updatedAtMs descending', () => {
        const olderFavorite = createWorkoutFixture({
            id: 'older-favorite',
            isFavorite: true,
            name: 'Older Favorite',
            updatedAtMs: 100,
        });
        const newerFavorite = createWorkoutFixture({
            id: 'newer-favorite',
            isFavorite: true,
            name: 'Newer Favorite',
            updatedAtMs: 300,
        });
        const newestRegular = createWorkoutFixture({
            id: 'newest-regular',
            isFavorite: false,
            name: 'Newest Regular',
            updatedAtMs: 500,
        });

        const { workoutService } = context.testDb.dbServices;
        seedPersistedWorkout(context.testDb, olderFavorite);
        seedPersistedWorkout(context.testDb, newerFavorite);
        seedPersistedWorkout(context.testDb, newestRegular);

        const workouts = workoutService.getAll();

        expect(workouts.map((w) => w.id)).toEqual(
            [newerFavorite, olderFavorite, newestRegular].map(
                (workoutItem) => workoutItem.id,
            ),
        );
    });

    it('getById returns the hydrated workout when it exists', () => {
        const workout = createWorkoutFixture();
        const { workoutService } = context.testDb.dbServices;

        seedPersistedWorkout(context.testDb, workout);

        const found = workoutService.getById(workout.id);

        expectHydratedWorkoutToMatchFixture(found, workout);
    });

    it('getById returns null when the workout does not exist', () => {
        const { workoutService } = context.testDb.dbServices;

        expect(workoutService.getById('non-existent-workout')).toBeNull();
    });

    it('getCurrentVersionId returns the version id when the workout exists', () => {
        const workout = createWorkoutFixture();
        const { workoutService } = context.testDb.dbServices;

        const { versionId } = seedPersistedWorkout(context.testDb, workout);

        expect(workoutService.getCurrentVersionId(workout.id)).toBe(versionId);
    });

    it('getCurrentVersionId returns null for an unknown workout id', () => {
        const { workoutService } = context.testDb.dbServices;

        expect(
            workoutService.getCurrentVersionId('non-existent-workout'),
        ).toBeNull();
    });

    it('upsertWorkout creates active workout metadata and version content rows', () => {
        const workout = createWorkoutFixture();
        const { workoutService } = context.testDb.dbServices;

        workoutService.upsertWorkout({ workout });

        const activeWorkout = readWorkoutRowOrThrow(
            context.testDb,
            workout.id,
        );
        const currentVersionId = activeWorkout.currentVersionId;

        expect(activeWorkout).toMatchObject({
            id: workout.id,
            name: workout.name,
            createdAtMs: workout.updatedAtMs,
            isFavorite: false,
        });
        expectWorkoutVersionRowsToMatchFixture(
            context.testDb,
            currentVersionId,
            workout,
        );
    });

    it('upsertWorkout reuses current version when only metadata changes', () => {
        const workout = createWorkoutFixture({ isFavorite: true });
        const { workoutService } = context.testDb.dbServices;
        const updatedWorkout: Workout = {
            ...workout,
            isFavorite: false,
        };
        const metadataUpdate: Workout = {
            ...updatedWorkout,
            updatedAtMs: workout.updatedAtMs + 1_000,
        };

        const { versionId: firstVersionId } = seedPersistedWorkout(
            context.testDb,
            workout,
        );

        workoutService.upsertWorkout({
            workout: metadataUpdate,
        });

        const activeWorkout = readWorkoutRowOrThrow(
            context.testDb,
            workout.id,
        );
        const versions = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .all();

        expect(activeWorkout).toMatchObject({
            id: updatedWorkout.id,
            name: updatedWorkout.name,
            currentVersionId: firstVersionId,
            isFavorite: false,
        });
        expectWorkoutVersionRowsToMatchFixture(
            context.testDb,
            firstVersionId,
            workout,
        );
        expect(versions).toHaveLength(1);
    });

    it('upsertWorkout creates a new version with fresh content row IDs when content changes', () => {
        const workout = createWorkoutFixture();
        const changedWorkout = createChangedWorkoutContent(workout);
        const { workoutService } = context.testDb.dbServices;

        const { versionId: firstVersionId } = seedPersistedWorkout(
            context.testDb,
            workout,
        );
        const firstBlockIds = context.testDb.db
            .select({ id: workoutBlocksTable.id })
            .from(workoutBlocksTable)
            .all()
            .map((block) => block.id);

        workoutService.upsertWorkout({
            workout: changedWorkout,
        });

        const activeWorkout = readWorkoutRowOrThrow(
            context.testDb,
            workout.id,
        );
        const nextVersionId = activeWorkout.currentVersionId;
        const nextBlockIds = context.testDb.db
            .select({ id: workoutBlocksTable.id })
            .from(workoutBlocksTable)
            .all()
            .map((block) => block.id);

        expectWorkoutVersionRowsToMatchFixture(
            context.testDb,
            nextVersionId,
            changedWorkout,
        );
        expect(nextVersionId).not.toBe(firstVersionId);
        expect(nextBlockIds).toHaveLength(firstBlockIds.length);
        nextBlockIds.forEach((blockId) => {
            expect(firstBlockIds).not.toContain(blockId);
        });
    });

    it('upsertWorkout deletes the old version when content changes and it is not referenced by any session', () => {
        const workout = createWorkoutFixture();
        const { workoutService } = context.testDb.dbServices;

        const { versionId: firstVersionId } = seedPersistedWorkout(
            context.testDb,
            workout,
        );

        workoutService.upsertWorkout({
            workout: createChangedWorkoutContent(workout),
        });

        const oldVersion = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .where(eq(workoutVersionsTable.id, firstVersionId))
            .get();

        expect(oldVersion).toBeUndefined();
    });

    it('upsertWorkout with sourceWorkoutVersionId reuses the source version when content matches', () => {
        context.testDb.close();
        context = createRepositoryContext({ now: () => RESTORE_CREATED_AT_MS });

        const workout = createWorkoutFixture();
        const { workoutService } = context.testDb.dbServices;

        const { versionId: sourceVersionId } = seedWorkoutSession(context.testDb, {
            id: 'session-1',
            startedAtMs: 100,
            endedAtMs: 200,
            workoutSnapshot: workout,
            workoutVersionId: 'source-version-1',
            totalDurationSec: 100,
        });

        const restoredWorkout = { ...workout, id: 'restored-workout' };
        workoutService.upsertWorkout({
            workout: restoredWorkout,
            sourceWorkoutVersionId: sourceVersionId,
        });

        const activeWorkout = context.testDb.db
            .select()
            .from(workoutsTable)
            .where(eq(workoutsTable.id, restoredWorkout.id))
            .get();
        const session = context.testDb.db
            .select()
            .from(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, 'session-1'))
            .get();

        expect(activeWorkout).toMatchObject({
            id: restoredWorkout.id,
            name: restoredWorkout.name,
            currentVersionId: sourceVersionId,
            createdAtMs: RESTORE_CREATED_AT_MS,
            isFavorite: false,
        });
        expectWorkoutVersionRowsToMatchFixture(
            context.testDb,
            sourceVersionId,
            restoredWorkout,
        );
        expect(session?.workoutVersionId).toBe(sourceVersionId);
    });

    it('upsertWorkout with sourceWorkoutVersionId throws when the workout already exists', () => {
        const workout = createWorkoutFixture();
        const { workoutService } = context.testDb.dbServices;

        const { versionId: sourceVersionId } = seedPersistedWorkout(
            context.testDb,
            workout,
        );

        expect(() => {
            workoutService.upsertWorkout({
                workout,
                sourceWorkoutVersionId: sourceVersionId,
            });
        }).toThrow(`Cannot restore workout ${workout.id}: already exists`);

        const activeWorkout = readWorkoutRowOrThrow(
            context.testDb,
            workout.id,
        );

        expect(activeWorkout.currentVersionId).toBe(sourceVersionId);
        expectWorkoutVersionRowsToMatchFixture(
            context.testDb,
            sourceVersionId,
            workout,
        );
    });

    it('upsertWorkout with sourceWorkoutVersionId creates a new version when content has changed', () => {
        const workout = createWorkoutFixture();
        const { workoutService } = context.testDb.dbServices;

        const { versionId: sourceVersionId } = seedWorkoutSession(context.testDb, {
            id: 'session-1',
            startedAtMs: 100,
            endedAtMs: 200,
            workoutSnapshot: workout,
            workoutVersionId: 'source-version-1',
            totalDurationSec: 100,
        });

        const restoredWorkout = {
            ...createChangedWorkoutContent(workout),
            id: 'restored-workout',
        };

        workoutService.upsertWorkout({
            workout: restoredWorkout,
            sourceWorkoutVersionId: sourceVersionId,
        });

        const activeWorkout = readWorkoutRowOrThrow(
            context.testDb,
            restoredWorkout.id,
        );
        const sourceVersion = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .where(eq(workoutVersionsTable.id, sourceVersionId))
            .get();
        const session = context.testDb.db
            .select()
            .from(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, 'session-1'))
            .get();

        expect(activeWorkout.currentVersionId).not.toBe(sourceVersionId);
        expectWorkoutVersionRowsToMatchFixture(
            context.testDb,
            activeWorkout.currentVersionId,
            restoredWorkout,
        );
        expect(sourceVersion?.id).toBe(sourceVersionId);
        expect(session?.workoutVersionId).toBe(sourceVersionId);
    });

    it('toggleFavorite flips isFavorite without creating a new version', () => {
        const workout = createWorkoutFixture({ isFavorite: false });
        const { workoutService } = context.testDb.dbServices;
        const favoriteWorkout: Workout = {
            ...workout,
            isFavorite: true,
        };

        const { versionId: originalVersionId } = seedPersistedWorkout(
            context.testDb,
            workout,
        );

        workoutService.toggleFavorite(workout);

        const activeWorkout = readWorkoutRowOrThrow(
            context.testDb,
            workout.id,
        );
        const versions = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .all();

        expect(activeWorkout).toMatchObject({
            id: favoriteWorkout.id,
            name: favoriteWorkout.name,
            currentVersionId: originalVersionId,
            isFavorite: true,
        });
        expect(versions).toHaveLength(1);
    });

    it('deleteWorkout removes the active workout and preserves referenced historical content', () => {
        const workout = createWorkoutFixture();
        const { workoutService } = context.testDb.dbServices;

        const { versionId } = seedPersistedWorkout(context.testDb, workout);

        seedWorkoutSession(context.testDb, {
            id: 'session-1',
            startedAtMs: 100,
            endedAtMs: 200,
            workoutSnapshot: workout,
            workoutVersionId: versionId,
            totalDurationSec: 100,
        });

        workoutService.deleteWorkout(workout.id);

        const version = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .where(eq(workoutVersionsTable.id, versionId))
            .get();
        const session = context.testDb.db
            .select()
            .from(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, 'session-1'))
            .get();

        const activeWorkout = context.testDb.db
            .select()
            .from(workoutsTable)
            .where(eq(workoutsTable.id, workout.id))
            .get();

        expect(activeWorkout).toBeUndefined();
        expect(version?.id).toBe(versionId);
        expect(session?.workoutVersionId).toBe(versionId);
    });

    it('deleteWorkout removes the orphaned version when no sessions reference it', () => {
        const workout = createWorkoutFixture();
        const { workoutService } = context.testDb.dbServices;

        const { versionId } = seedPersistedWorkout(context.testDb, workout);

        workoutService.deleteWorkout(workout.id);

        const version = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .where(eq(workoutVersionsTable.id, versionId))
            .get();

        const activeWorkout = context.testDb.db
            .select()
            .from(workoutsTable)
            .where(eq(workoutsTable.id, workout.id))
            .get();

        expect(activeWorkout).toBeUndefined();
        expect(version).toBeUndefined();
    });
});
