import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
} from '@jest/globals';
import { eq } from 'drizzle-orm';

import {
    createWorkoutRepository,
    type Clock,
    type WorkoutRepositoryApi,
} from '@src/db/repositories/workoutRepositoryFactory';
import {
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

const RESTORE_CREATED_AT_MS = 1_900_000_000_000;

interface RepositoryContext {
    testDb: TestDb;
    workoutRepositoryApi: WorkoutRepositoryApi;
}

const createRepositoryContext = (): RepositoryContext => {
    const testDb = createTestDb();
    const clock: Clock = {
        now: () => RESTORE_CREATED_AT_MS,
    };

    return {
        testDb,
        workoutRepositoryApi: createWorkoutRepository({
            clock,
            db: testDb.db,
        }),
    };
};

describe('workoutRepository integration', () => {
    let context: RepositoryContext;

    beforeEach(() => {
        context = createRepositoryContext();
    });

    afterEach(() => {
        context.testDb.close();
    });

    it('upsert creates active workout metadata and version content rows', () => {
        const workout = createWorkoutFixture();

        context.workoutRepositoryApi.workoutRepository.upsert(workout, 0);

        const activeWorkout = context.testDb.db.select().from(workoutsTable).get();
        expect(activeWorkout).toMatchObject({
            id: workout.id,
            createdAtMs: workout.updatedAtMs,
            isFavorite: false,
            sortIndex: 0,
        });

        const version = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .get();
        expect(version).toMatchObject({
            id: activeWorkout?.currentVersionId,
            workoutId: workout.id,
            name: workout.name,
            updatedAtMs: workout.updatedAtMs,
        });

        const blocks = context.testDb.db.select().from(workoutBlocksTable).all();
        const exercises = context.testDb.db
            .select()
            .from(workoutExercisesTable)
            .all();

        expect(blocks).toHaveLength(2);
        expect(exercises).toHaveLength(3);
        blocks.forEach((block) => {
            expect(block.workoutVersionId).toBe(version?.id);
        });
    });

    it('upsert reuses current version when only metadata changes', () => {
        const workout = createWorkoutFixture({ isFavorite: true });

        context.workoutRepositoryApi.workoutRepository.upsert(workout, 0);
        const firstVersionId =
            context.workoutRepositoryApi.workoutRepository.getCurrentVersionId(
                workout.id,
            );

        context.workoutRepositoryApi.workoutRepository.upsert(
            {
                ...workout,
                isFavorite: false,
                updatedAtMs: workout.updatedAtMs + 1_000,
            },
            7,
        );

        const activeWorkout = context.testDb.db.select().from(workoutsTable).get();
        const versions = context.testDb.db.select().from(workoutVersionsTable).all();

        expect(activeWorkout).toMatchObject({
            currentVersionId: firstVersionId,
            isFavorite: false,
            sortIndex: 7,
        });
        expect(versions).toHaveLength(1);
    });

    it('upsert creates a new version with fresh content row IDs when content changes', () => {
        const workout = createWorkoutFixture();

        context.workoutRepositoryApi.workoutRepository.upsert(workout, 0);
        const firstVersionId =
            context.workoutRepositoryApi.workoutRepository.getCurrentVersionId(
                workout.id,
            );
        const firstBlockIds = context.testDb.db
            .select({ id: workoutBlocksTable.id })
            .from(workoutBlocksTable)
            .all()
            .map((block) => block.id);

        context.workoutRepositoryApi.workoutRepository.upsert(
            createChangedWorkoutContent(workout),
            0,
        );

        const nextVersionId =
            context.workoutRepositoryApi.workoutRepository.getCurrentVersionId(
                workout.id,
            );
        const nextBlockIds = context.testDb.db
            .select({ id: workoutBlocksTable.id })
            .from(workoutBlocksTable)
            .all()
            .map((block) => block.id);

        expect(nextVersionId).toBeTruthy();
        expect(nextVersionId).not.toBe(firstVersionId);
        expect(nextBlockIds).toHaveLength(firstBlockIds.length);
        nextBlockIds.forEach((blockId) => {
            expect(firstBlockIds).not.toContain(blockId);
        });
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

        context.workoutRepositoryApi.workoutRepository.upsert(olderFavorite, 0);
        context.workoutRepositoryApi.workoutRepository.upsert(newerFavorite, 0);
        context.workoutRepositoryApi.workoutRepository.upsert(newestRegular, 0);

        const workouts = context.workoutRepositoryApi.workoutRepository.getAll();

        expect(workouts.map((workout) => workout.id)).toEqual([
            'newer-favorite',
            'older-favorite',
            'newest-regular',
        ]);
    });

    it('remove deletes active workout and preserves referenced historical content', () => {
        const workout = createWorkoutFixture();
        context.workoutRepositoryApi.workoutRepository.upsert(workout, 0);
        const versionId =
            context.workoutRepositoryApi.workoutRepository.getCurrentVersionId(
                workout.id,
            );
        expect(versionId).not.toBeNull();
        if (versionId === null) throw new Error('Expected current version');

        context.testDb.db
            .insert(workoutSessionsTable)
            .values({
                id: 'session-1',
                startedAtMs: 100,
                endedAtMs: 200,
                workoutId: workout.id,
                workoutVersionId: versionId,
                workoutNameSnapshot: workout.name,
                totalDurationSec: 100,
                statsJson: null,
            })
            .run();

        context.workoutRepositoryApi.workoutRepository.remove(workout.id);

        const activeWorkout = context.testDb.db
            .select()
            .from(workoutsTable)
            .where(eq(workoutsTable.id, workout.id))
            .get();
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

        expect(activeWorkout).toBeUndefined();
        expect(version?.workoutId).toBeNull();
        expect(session?.workoutId).toBeNull();
        expect(session?.workoutVersionId).toBe(versionId);
    });

    it('upsertRestoredWorkout reuses unchanged source version and relinks ownership', () => {
        const workout = createWorkoutFixture();
        const sourceVersionId =
            context.workoutRepositoryApi.createWorkoutVersion(workout, null);

        context.testDb.db
            .insert(workoutSessionsTable)
            .values({
                id: 'session-1',
                startedAtMs: 100,
                endedAtMs: 200,
                workoutId: null,
                workoutVersionId: sourceVersionId,
                workoutNameSnapshot: workout.name,
                totalDurationSec: 100,
                statsJson: null,
            })
            .run();

        const restoredWorkout = {
            ...workout,
            id: 'restored-workout',
        };

        context.workoutRepositoryApi.workoutRepository.upsertRestoredWorkout({
            workout: restoredWorkout,
            sortIndex: 3,
            sourceWorkoutVersionId: sourceVersionId,
        });

        const activeWorkout = context.testDb.db
            .select()
            .from(workoutsTable)
            .where(eq(workoutsTable.id, restoredWorkout.id))
            .get();
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

        expect(activeWorkout).toMatchObject({
            currentVersionId: sourceVersionId,
            createdAtMs: RESTORE_CREATED_AT_MS,
            sortIndex: 3,
        });
        expect(sourceVersion?.workoutId).toBe(restoredWorkout.id);
        expect(session?.workoutId).toBe(restoredWorkout.id);
    });

    it('upsertRestoredWorkout rejects unchanged source version owned by another workout', () => {
        const savedWorkout = createWorkoutFixture({ id: 'saved-workout' });

        context.workoutRepositoryApi.workoutRepository.upsert(savedWorkout, 0);

        const sourceVersionId =
            context.workoutRepositoryApi.workoutRepository.getCurrentVersionId(
                savedWorkout.id,
            );
        expect(sourceVersionId).not.toBeNull();
        if (sourceVersionId === null) {
            throw new Error('Expected current version');
        }

        const restoredWorkout = {
            ...savedWorkout,
            id: 'restored-workout',
        };

        expect(() => {
            context.workoutRepositoryApi.workoutRepository.upsertRestoredWorkout({
                workout: restoredWorkout,
                sortIndex: 3,
                sourceWorkoutVersionId: sourceVersionId,
            });
        }).toThrow(
            'Cannot restore workout restored-workout: source version already belongs to workout saved-workout',
        );

        const activeRestoredWorkout = context.testDb.db
            .select()
            .from(workoutsTable)
            .where(eq(workoutsTable.id, restoredWorkout.id))
            .get();
        const sourceVersion = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .where(eq(workoutVersionsTable.id, sourceVersionId))
            .get();

        expect(activeRestoredWorkout).toBeUndefined();
        expect(sourceVersion?.workoutId).toBe(savedWorkout.id);
    });

    it('upsertRestoredWorkout creates a new version for changed content without relinking old sessions', () => {
        const workout = createWorkoutFixture();
        const sourceVersionId =
            context.workoutRepositoryApi.createWorkoutVersion(workout, null);

        context.testDb.db
            .insert(workoutSessionsTable)
            .values({
                id: 'session-1',
                startedAtMs: 100,
                endedAtMs: 200,
                workoutId: null,
                workoutVersionId: sourceVersionId,
                workoutNameSnapshot: workout.name,
                totalDurationSec: 100,
                statsJson: null,
            })
            .run();

        const restoredWorkout = {
            ...createChangedWorkoutContent(workout),
            id: 'restored-workout',
        };

        context.workoutRepositoryApi.workoutRepository.upsertRestoredWorkout({
            workout: restoredWorkout,
            sortIndex: 0,
            sourceWorkoutVersionId: sourceVersionId,
        });

        const activeWorkout = context.testDb.db
            .select()
            .from(workoutsTable)
            .where(eq(workoutsTable.id, restoredWorkout.id))
            .get();
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

        expect(activeWorkout?.currentVersionId).toBeTruthy();
        expect(activeWorkout?.currentVersionId).not.toBe(sourceVersionId);
        expect(sourceVersion?.workoutId).toBeNull();
        expect(session?.workoutId).toBeNull();
        expect(session?.workoutVersionId).toBe(sourceVersionId);
    });
});
