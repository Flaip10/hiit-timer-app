import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { eq } from 'drizzle-orm';

import { workoutSessionsTable, workoutVersionsTable } from '@src/db/schema';

import { createTestDb, type TestDb } from '../../helpers/createTestDb';
import {
    createChangedWorkoutContent,
    createQuickWorkoutFixture,
    createWorkoutFixture,
} from '../../fixtures/workouts';

interface RepositoryContext {
    testDb: TestDb;
}

const createRepositoryContext = (): RepositoryContext => ({
    testDb: createTestDb(),
});

describe('workoutSessionService integration', () => {
    let context: RepositoryContext;

    beforeEach(() => {
        context = createRepositoryContext();
    });

    afterEach(() => {
        context.testDb.close();
    });

    it('createSessionFromSnapshot persists a version and session for a quick workout', () => {
        const workout = createQuickWorkoutFixture();
        const { workoutSessionService } = context.testDb.dbServices;

        const session = workoutSessionService.createSessionFromSnapshot({
            workout,
            startedAtMs: 100_000,
            endedAtMs: 220_000,
        });

        const sessionRow = context.testDb.db
            .select()
            .from(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, session.id))
            .get();
        const version = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .where(
                eq(workoutVersionsTable.id, sessionRow?.workoutVersionId ?? ''),
            )
            .get();

        expect(sessionRow?.workoutVersionId).toBeTruthy();
        expect(version).toBeDefined();
        expect(session.workoutSnapshot.name).toBe(workout.name);
        expect(session.startedAtMs).toBe(100_000);
        expect(session.endedAtMs).toBe(220_000);
        expect(session.totalDurationSec).toBe(120);
    });

    it('createSession uses the saved workout version when the workout exists', () => {
        const workout = createWorkoutFixture();
        const { workoutService, workoutRepository, workoutSessionService } =
            context.testDb.dbServices;

        workoutService.upsertWorkout({ workout });
        const currentVersionId = workoutRepository.getCurrentVersionId(
            workout.id,
        );
        expect(currentVersionId).not.toBeNull();
        if (!currentVersionId) throw new Error('Expected version');

        const session = workoutSessionService.createSession({
            versionId: currentVersionId,
            startedAtMs: 100_000,
            endedAtMs: 220_000,
        });

        const sessionRow = context.testDb.db
            .select()
            .from(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, session.id))
            .get();

        expect(sessionRow?.workoutVersionId).toBe(currentVersionId);
        expect(session.workoutSnapshot.name).toBe(workout.name);
        expect(session.workoutSnapshot.blocks).toHaveLength(2);
    });

    it('createSession reuses the historical version for a re-run from history', () => {
        const workout = createWorkoutFixture();
        const { workoutSessionService } = context.testDb.dbServices;

        const firstSession = workoutSessionService.createSessionFromSnapshot({
            workout,
            startedAtMs: 100_000,
            endedAtMs: 220_000,
        });
        const sourceVersionId = firstSession.workoutVersionId;
        expect(sourceVersionId).toBeTruthy();
        if (!sourceVersionId) throw new Error('Expected version');

        const secondSession = workoutSessionService.createSession({
            versionId: sourceVersionId,
            startedAtMs: 300_000,
            endedAtMs: 420_000,
        });

        const secondSessionRow = context.testDb.db
            .select()
            .from(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, secondSession.id))
            .get();

        expect(secondSessionRow?.workoutVersionId).toBe(sourceVersionId);
        expect(secondSession.workoutSnapshot.name).toBe(workout.name);
    });

    it('createSession throws when the version does not exist', () => {
        const { workoutSessionService } = context.testDb.dbServices;

        expect(() => {
            workoutSessionService.createSession({
                versionId: 'non-existent-version',
                startedAtMs: 100_000,
                endedAtMs: 220_000,
            });
        }).toThrow('Workout version non-existent-version not found');
    });

    it('createSessionFromSnapshot creates a new version when content has changed since the previous run', () => {
        const workout = createWorkoutFixture();
        const { workoutSessionService } = context.testDb.dbServices;

        const firstSession = workoutSessionService.createSessionFromSnapshot({
            workout,
            startedAtMs: 100_000,
            endedAtMs: 220_000,
        });

        const changedWorkout = createChangedWorkoutContent(workout);
        const secondSession = workoutSessionService.createSessionFromSnapshot({
            workout: changedWorkout,
            startedAtMs: 300_000,
            endedAtMs: 420_000,
        });

        const versions = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .all();

        expect(secondSession.workoutVersionId).toBeTruthy();
        expect(secondSession.workoutVersionId).not.toBe(
            firstSession.workoutVersionId,
        );
        expect(versions).toHaveLength(2);
    });

    it('getAll and getRecent hydrate workout snapshots ordered by endedAtMs descending', () => {
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

        const { workoutSessionService } = context.testDb.dbServices;
        workoutSessionService.createSessionFromSnapshot({
            workout: oldestWorkout,
            startedAtMs: 100_000,
            endedAtMs: 200_000,
        });
        workoutSessionService.createSessionFromSnapshot({
            workout: newestWorkout,
            startedAtMs: 100_000,
            endedAtMs: 400_000,
        });
        workoutSessionService.createSessionFromSnapshot({
            workout: middleWorkout,
            startedAtMs: 100_000,
            endedAtMs: 300_000,
        });

        const allSessions = workoutSessionService.getAll();
        const recentSessions = workoutSessionService.getRecent(2);

        expect(allSessions.map((s) => s.workoutSnapshot.name)).toEqual([
            'Newest Workout',
            'Middle Workout',
            'Oldest Workout',
        ]);
        expect(recentSessions.map((s) => s.workoutSnapshot.name)).toEqual([
            'Newest Workout',
            'Middle Workout',
        ]);
    });

    it('activeWorkoutId is set when the session version matches a saved workout', () => {
        const workout = createWorkoutFixture();
        const { workoutService, workoutRepository, workoutSessionService } =
            context.testDb.dbServices;

        workoutService.upsertWorkout({ workout });
        const currentVersionId = workoutRepository.getCurrentVersionId(
            workout.id,
        );
        expect(currentVersionId).not.toBeNull();
        if (!currentVersionId) throw new Error('Expected version');

        workoutSessionService.createSession({
            versionId: currentVersionId,
            startedAtMs: 100_000,
            endedAtMs: 220_000,
        });

        const sessions = workoutSessionService.getAll();
        expect(sessions).toHaveLength(1);
        expect(sessions[0]?.activeWorkoutId).toBe(workout.id);
    });

    it('createSessionFromSnapshot reuses the saved workout version when the workout exists', () => {
        const workout = createWorkoutFixture();
        const { workoutService, workoutRepository, workoutSessionService } =
            context.testDb.dbServices;

        workoutService.upsertWorkout({ workout });
        const savedVersionId = workoutRepository.getCurrentVersionId(
            workout.id,
        );
        expect(savedVersionId).toBeTruthy();
        if (!savedVersionId) throw new Error('Expected version');

        const session = workoutSessionService.createSessionFromSnapshot({
            workout,
            startedAtMs: 100_000,
            endedAtMs: 220_000,
        });

        const versions = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .all();

        expect(session.workoutVersionId).toBe(savedVersionId);
        expect(versions).toHaveLength(1);
    });

    it('workoutSnapshot.name reflects the active workout name when the workout has been renamed', () => {
        const workout = createWorkoutFixture({ name: 'Morning Intervals' });
        const { workoutService, workoutRepository, workoutSessionService } =
            context.testDb.dbServices;

        workoutService.upsertWorkout({ workout });
        const currentVersionId = workoutRepository.getCurrentVersionId(
            workout.id,
        );
        expect(currentVersionId).not.toBeNull();
        if (!currentVersionId) throw new Error('Expected version');

        workoutSessionService.createSession({
            versionId: currentVersionId,
            startedAtMs: 100_000,
            endedAtMs: 220_000,
        });

        // Rename without changing blocks — no new version is created, the
        // workout row name column is updated in place.
        workoutService.upsertWorkout({
            workout: { ...workout, name: 'HIIT Cardio' },
        });

        const [session] = workoutSessionService.getAll();

        expect(session.activeWorkoutId).toBe(workout.id);
        expect(session.workoutSnapshot.name).toBe('HIIT Cardio');
    });

    it('workoutSnapshot.name falls back to the version name when the workout has been deleted', () => {
        const workout = createWorkoutFixture({ name: 'Morning Intervals' });
        const { workoutService, workoutRepository, workoutSessionService } =
            context.testDb.dbServices;

        workoutService.upsertWorkout({ workout });
        const currentVersionId = workoutRepository.getCurrentVersionId(
            workout.id,
        );
        expect(currentVersionId).not.toBeNull();
        if (!currentVersionId) throw new Error('Expected version');

        workoutSessionService.createSession({
            versionId: currentVersionId,
            startedAtMs: 100_000,
            endedAtMs: 220_000,
        });

        workoutService.deleteWorkout(workout.id);

        const [session] = workoutSessionService.getAll();

        expect(session.activeWorkoutId).toBeUndefined();
        expect(session.workoutSnapshot.name).toBe('Morning Intervals');
    });

    it('deleteSession removes orphaned unowned versions but keeps active workout versions', () => {
        const { workoutService, workoutRepository, workoutSessionService } =
            context.testDb.dbServices;

        const quickWorkout = createQuickWorkoutFixture({ id: 'quick-workout' });
        const quickSession = workoutSessionService.createSessionFromSnapshot({
            workout: quickWorkout,
            startedAtMs: 100_000,
            endedAtMs: 220_000,
        });

        const quickSessionRow = context.testDb.db
            .select()
            .from(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, quickSession.id))
            .get();
        const quickVersionId = quickSessionRow?.workoutVersionId;
        expect(quickVersionId).toBeTruthy();
        if (!quickVersionId) throw new Error('Expected quick version');

        workoutSessionService.deleteSession(quickSession.id);

        const removedQuickVersion = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .where(eq(workoutVersionsTable.id, quickVersionId))
            .get();
        expect(removedQuickVersion).toBeUndefined();

        const savedWorkout = createWorkoutFixture({ id: 'saved-workout' });
        workoutService.upsertWorkout({ workout: savedWorkout });
        const savedVersionId = workoutRepository.getCurrentVersionId(
            savedWorkout.id,
        );
        expect(savedVersionId).toBeTruthy();
        if (!savedVersionId) throw new Error('Expected saved version');

        const savedSession = workoutSessionService.createSession({
            versionId: savedVersionId,
            startedAtMs: 100_000,
            endedAtMs: 220_000,
        });

        workoutSessionService.deleteSession(savedSession.id);

        const retainedSavedVersion = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .where(eq(workoutVersionsTable.id, savedVersionId))
            .get();
        expect(retainedSavedVersion?.id).toBe(savedVersionId);
    });
});
