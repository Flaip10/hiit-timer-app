import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
} from '@jest/globals';
import { eq } from 'drizzle-orm';

import { createWorkoutRepository } from '@src/db/repositories/workoutRepositoryFactory';
import {
    createWorkoutSessionRepository,
    type WorkoutSessionRepository,
} from '@src/db/repositories/workoutSessionRepositoryFactory';
import {
    workoutSessionsTable,
    workoutVersionsTable,
} from '@src/db/schema';

import { createTestDb, type TestDb } from '../../helpers/createTestDb';
import {
    createChangedWorkoutContent,
    createWorkoutFixture,
} from '../../fixtures/workouts';

interface RepositoryContext {
    testDb: TestDb;
    workoutRepositoryApi: ReturnType<typeof createWorkoutRepository>;
    workoutSessionRepository: WorkoutSessionRepository;
}

const createRepositoryContext = (): RepositoryContext => {
    const testDb = createTestDb();
    const workoutRepositoryApi = createWorkoutRepository({ db: testDb.db });
    const workoutSessionRepository = createWorkoutSessionRepository({
        db: testDb.db,
        workoutRepositoryApi,
    });

    return {
        testDb,
        workoutRepositoryApi,
        workoutSessionRepository,
    };
};

describe('workoutSessionRepository integration', () => {
    let context: RepositoryContext;

    beforeEach(() => {
        context = createRepositoryContext();
    });

    afterEach(() => {
        context.testDb.close();
    });

    it('create persists a non-null workoutVersionId for quick workout sessions', () => {
        const workout = createWorkoutFixture();

        const session = context.workoutSessionRepository.create({
            workout,
            startedAtMs: 100,
            endedAtMs: 220,
        });

        const sessionRow = context.testDb.db
            .select()
            .from(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, session.id))
            .get();
        const version = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .where(eq(workoutVersionsTable.id, sessionRow?.workoutVersionId ?? ''))
            .get();

        expect(sessionRow?.workoutVersionId).toBeTruthy();
        expect(sessionRow?.workoutId).toBeNull();
        expect(version?.workoutId).toBeNull();
    });

    it('create uses the active saved workout version when the workout exists', () => {
        const workout = createWorkoutFixture();
        context.workoutRepositoryApi.workoutRepository.upsert(workout, 0);
        const currentVersionId =
            context.workoutRepositoryApi.workoutRepository.getCurrentVersionId(
                workout.id,
            );

        const session = context.workoutSessionRepository.create({
            workout,
            startedAtMs: 100,
            endedAtMs: 220,
        });

        const sessionRow = context.testDb.db
            .select()
            .from(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, session.id))
            .get();

        expect(sessionRow?.workoutId).toBe(workout.id);
        expect(sessionRow?.workoutVersionId).toBe(currentVersionId);
    });

    it('create reuses matching sourceWorkoutVersionId for history runs', () => {
        const workout = createWorkoutFixture();
        const sourceVersionId =
            context.workoutRepositoryApi.createWorkoutVersion(workout, null);

        const session = context.workoutSessionRepository.create({
            workout,
            sourceWorkoutVersionId: sourceVersionId,
            startedAtMs: 100,
            endedAtMs: 220,
        });

        const sessionRow = context.testDb.db
            .select()
            .from(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, session.id))
            .get();

        expect(sessionRow?.workoutVersionId).toBe(sourceVersionId);
    });

    it('create reuses matching sourceWorkoutVersionId without linking unrelated workoutId', () => {
        const sourceWorkout = createWorkoutFixture({
            id: 'source-workout',
        });
        const unrelatedWorkout = createWorkoutFixture({
            id: 'unrelated-workout',
        });

        context.workoutRepositoryApi.workoutRepository.upsert(
            unrelatedWorkout,
            0,
        );
        const sourceVersionId =
            context.workoutRepositoryApi.createWorkoutVersion(
                sourceWorkout,
                null,
            );

        const session = context.workoutSessionRepository.create({
            workout: {
                ...sourceWorkout,
                id: unrelatedWorkout.id,
            },
            sourceWorkoutVersionId: sourceVersionId,
            startedAtMs: 100,
            endedAtMs: 220,
        });

        const sessionRow = context.testDb.db
            .select()
            .from(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, session.id))
            .get();

        expect(sessionRow?.workoutVersionId).toBe(sourceVersionId);
        expect(sessionRow?.workoutId).toBeNull();
    });

    it('create makes a new version when sourceWorkoutVersionId content no longer matches', () => {
        const workout = createWorkoutFixture();
        const sourceVersionId =
            context.workoutRepositoryApi.createWorkoutVersion(workout, null);
        const changedWorkout = createChangedWorkoutContent(workout);

        const session = context.workoutSessionRepository.create({
            workout: changedWorkout,
            sourceWorkoutVersionId: sourceVersionId,
            startedAtMs: 100,
            endedAtMs: 220,
        });

        const sessionRow = context.testDb.db
            .select()
            .from(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, session.id))
            .get();
        const versions = context.testDb.db.select().from(workoutVersionsTable).all();

        expect(sessionRow?.workoutVersionId).toBeTruthy();
        expect(sessionRow?.workoutVersionId).not.toBe(sourceVersionId);
        expect(versions).toHaveLength(2);
    });

    it('getAll and getRecent hydrate workout snapshots from version rows ordered by endedAtMs', () => {
        const oldestWorkout = createWorkoutFixture({
            id: 'oldest-workout',
            name: 'Oldest Workout',
        });
        const middleWorkout = createWorkoutFixture({
            id: 'middle-workout',
            name: 'Middle Workout',
        });
        const newestWorkout = createWorkoutFixture({
            id: 'newest-workout',
            name: 'Newest Workout',
        });

        context.workoutSessionRepository.create({
            workout: oldestWorkout,
            startedAtMs: 100,
            endedAtMs: 200,
        });
        context.workoutSessionRepository.create({
            workout: newestWorkout,
            startedAtMs: 100,
            endedAtMs: 400,
        });
        context.workoutSessionRepository.create({
            workout: middleWorkout,
            startedAtMs: 100,
            endedAtMs: 300,
        });

        const allSessions = context.workoutSessionRepository.getAll();
        const recentSessions = context.workoutSessionRepository.getRecent(2);

        expect(
            allSessions.map((session) => session.workoutSnapshot.name),
        ).toEqual(['Newest Workout', 'Middle Workout', 'Oldest Workout']);
        expect(
            recentSessions.map((session) => session.workoutSnapshot.name),
        ).toEqual(['Newest Workout', 'Middle Workout']);
    });

    it('remove deletes orphaned unowned versions but keeps active workout versions', () => {
        const quickWorkout = createWorkoutFixture({ id: 'quick-workout' });
        const quickSession = context.workoutSessionRepository.create({
            workout: quickWorkout,
            startedAtMs: 100,
            endedAtMs: 220,
        });
        const quickSessionRow = context.testDb.db
            .select()
            .from(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, quickSession.id))
            .get();
        const quickVersionId = quickSessionRow?.workoutVersionId;
        expect(quickVersionId).toBeTruthy();
        if (!quickVersionId) throw new Error('Expected quick version');

        context.workoutSessionRepository.remove(quickSession.id);

        const removedQuickVersion = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .where(eq(workoutVersionsTable.id, quickVersionId))
            .get();
        expect(removedQuickVersion).toBeUndefined();

        const savedWorkout = createWorkoutFixture({ id: 'saved-workout' });
        context.workoutRepositoryApi.workoutRepository.upsert(savedWorkout, 0);
        const savedVersionId =
            context.workoutRepositoryApi.workoutRepository.getCurrentVersionId(
                savedWorkout.id,
            );
        expect(savedVersionId).toBeTruthy();
        if (!savedVersionId) throw new Error('Expected saved version');

        const savedSession = context.workoutSessionRepository.create({
            workout: savedWorkout,
            startedAtMs: 100,
            endedAtMs: 220,
        });

        context.workoutSessionRepository.remove(savedSession.id);

        const retainedSavedVersion = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .where(eq(workoutVersionsTable.id, savedVersionId))
            .get();
        expect(retainedSavedVersion?.id).toBe(savedVersionId);
    });
});
