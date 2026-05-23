import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { asc, eq } from 'drizzle-orm';

import type { WorkoutSession } from '@src/core/entities/workoutSession.interfaces';
import {
    workoutsTable,
    workoutSessionsTable,
    workoutVersionsTable,
} from '@src/db/schema';

import type { TestDb } from '../../helpers/createTestDb';
import {
    createChangedWorkoutContent,
    createQuickWorkoutFixture,
    createWorkoutFixture,
} from '../../fixtures/workouts';
import { createSessionFixture } from '../../fixtures/sessions';
import {
    createRepositoryContext,
    expectHydratedWorkoutToMatchFixture,
    readWorkoutVersionRowOrThrow,
    type RepositoryContext,
} from '../../helpers/dbIntegrationHelpers';
import { seedPersistedWorkout } from '../../helpers/seedWorkout';
import { seedWorkoutSession } from '../../helpers/seedWorkoutSession';

const readSessionRowOrThrow = (testDb: TestDb, sessionId: string) => {
    const session = testDb.db
        .select()
        .from(workoutSessionsTable)
        .where(eq(workoutSessionsTable.id, sessionId))
        .get();

    expect(session).toBeDefined();
    if (!session) {
        throw new Error(`Expected session row ${sessionId}`);
    }

    return session;
};

const expectHydratedSessionToMatchFixture = (
    actual: WorkoutSession | null | undefined,
    expected: WorkoutSession,
): void => {
    expect(actual).not.toBeNull();
    expect(actual).toBeDefined();
    if (!actual) throw new Error(`Expected session ${expected.id}`);

    expect(actual).toMatchObject({
        id: expected.id,
        startedAtMs: expected.startedAtMs,
        endedAtMs: expected.endedAtMs,
        workoutVersionId: expected.workoutVersionId,
        totalDurationSec: expected.totalDurationSec,
        stats: expected.stats,
    });
    expectHydratedWorkoutToMatchFixture(
        actual.workoutSnapshot,
        expected.workoutSnapshot,
    );
};

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

        const sessionRow = readSessionRowOrThrow(context.testDb, session.id);
        const version = readWorkoutVersionRowOrThrow(
            context.testDb,
            sessionRow.workoutVersionId,
        );

        expect(sessionRow).toMatchObject({
            startedAtMs: 100_000,
            endedAtMs: 220_000,
            totalDurationSec: 120,
        });
        expect(version.name).toBe(workout.name);
        expect(session.workoutSnapshot.name).toBe(workout.name);
    });

    it('createSession uses the saved workout version when the workout exists', () => {
        const workout = createWorkoutFixture();
        const { workoutSessionService } = context.testDb.dbServices;
        const { versionId } = seedPersistedWorkout(context.testDb, workout);

        const session = workoutSessionService.createSession({
            versionId,
            startedAtMs: 100_000,
            endedAtMs: 220_000,
        });

        const sessionRow = readSessionRowOrThrow(context.testDb, session.id);

        expect(sessionRow).toMatchObject({
            workoutVersionId: versionId,
            startedAtMs: 100_000,
            endedAtMs: 220_000,
            totalDurationSec: 120,
        });
        expectHydratedWorkoutToMatchFixture(session.workoutSnapshot, workout);
    });

    it('createSession reuses the historical version for a re-run from history', () => {
        const workout = createWorkoutFixture();
        const { workoutSessionService } = context.testDb.dbServices;
        const { versionId } = seedWorkoutSession(
            context.testDb,
            createSessionFixture({
                id: 'source-session',
                workoutSnapshot: workout,
                workoutVersionId: 'source-version',
            }),
        );

        const secondSession = workoutSessionService.createSession({
            versionId,
            startedAtMs: 300_000,
            endedAtMs: 420_000,
        });

        const secondSessionRow = readSessionRowOrThrow(
            context.testDb,
            secondSession.id,
        );

        expect(secondSessionRow.workoutVersionId).toBe(versionId);
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
        seedWorkoutSession(
            context.testDb,
            createSessionFixture({
                id: 'oldest-session',
                endedAtMs: 200_000,
                workoutSnapshot: oldestWorkout,
                workoutVersionId: 'oldest-version',
            }),
        );
        seedWorkoutSession(
            context.testDb,
            createSessionFixture({
                id: 'newest-session',
                endedAtMs: 400_000,
                workoutSnapshot: newestWorkout,
                workoutVersionId: 'newest-version',
            }),
        );
        seedWorkoutSession(
            context.testDb,
            createSessionFixture({
                id: 'middle-session',
                endedAtMs: 300_000,
                workoutSnapshot: middleWorkout,
                workoutVersionId: 'middle-version',
            }),
        );

        const allSessions = workoutSessionService.getAll();
        const recentSessions = workoutSessionService.getRecent(2);

        expect(
            allSessions.map((session) => session.workoutSnapshot.name),
        ).toEqual([newestWorkout.name, middleWorkout.name, oldestWorkout.name]);
        expect(
            recentSessions.map((session) => session.workoutSnapshot.name),
        ).toEqual([newestWorkout.name, middleWorkout.name]);
    });

    it('activeWorkoutId is set when the session version matches a saved workout', () => {
        const workout = createWorkoutFixture();
        const { workoutSessionService } = context.testDb.dbServices;
        const { versionId } = seedPersistedWorkout(context.testDb, workout);

        seedWorkoutSession(
            context.testDb,
            createSessionFixture({
                id: 'session-1',
                workoutSnapshot: workout,
                workoutVersionId: versionId,
            }),
        );

        const sessions = workoutSessionService.getAll();

        expect(sessions).toHaveLength(1);
        expect(sessions[0]?.activeWorkoutId).toBe(workout.id);
    });

    it('createSessionFromSnapshot reuses the saved workout version when the workout exists', () => {
        const workout = createWorkoutFixture();
        const { workoutSessionService } = context.testDb.dbServices;
        const { versionId } = seedPersistedWorkout(context.testDb, workout);

        const session = workoutSessionService.createSessionFromSnapshot({
            workout,
            startedAtMs: 100_000,
            endedAtMs: 220_000,
        });

        const versions = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .all();

        expect(session.workoutVersionId).toBe(versionId);
        expect(versions).toHaveLength(1);
    });

    it('workoutSnapshot.name reflects the active workout name when the workout has been renamed', () => {
        const workout = createWorkoutFixture({ name: 'Morning Intervals' });
        const { workoutSessionService } = context.testDb.dbServices;
        const { versionId } = seedPersistedWorkout(context.testDb, workout);

        seedWorkoutSession(
            context.testDb,
            createSessionFixture({
                id: 'session-1',
                workoutSnapshot: workout,
                workoutVersionId: versionId,
            }),
        );
        context.testDb.db
            .update(workoutsTable)
            .set({ name: 'HIIT Cardio' })
            .where(eq(workoutsTable.id, workout.id))
            .run();

        const [session] = workoutSessionService.getAll();

        expect(session.activeWorkoutId).toBe(workout.id);
        expectHydratedWorkoutToMatchFixture(session.workoutSnapshot, {
            ...workout,
            name: 'HIIT Cardio',
        });
    });

    it('workoutSnapshot.name falls back to the version name when the workout has been deleted', () => {
        const workout = createWorkoutFixture({ name: 'Morning Intervals' });
        const { workoutSessionService } = context.testDb.dbServices;
        const { versionId } = seedPersistedWorkout(context.testDb, workout);

        seedWorkoutSession(
            context.testDb,
            createSessionFixture({
                id: 'session-1',
                workoutSnapshot: workout,
                workoutVersionId: versionId,
            }),
        );
        context.testDb.db
            .delete(workoutsTable)
            .where(eq(workoutsTable.id, workout.id))
            .run();

        const [session] = workoutSessionService.getAll();

        expect(session.activeWorkoutId).toBeUndefined();
        expect(session.workoutSnapshot.name).toBe(workout.name);
    });

    it('deleteSession removes orphaned unowned versions but keeps active workout versions', () => {
        const quickWorkout = createWorkoutFixture({ id: 'quick-workout' });
        const savedWorkout = createWorkoutFixture({ id: 'saved-workout' });
        const { workoutSessionService } = context.testDb.dbServices;
        const { versionId: quickVersionId } = seedWorkoutSession(
            context.testDb,
            createSessionFixture({
                id: 'quick-session',
                workoutSnapshot: quickWorkout,
                workoutVersionId: 'quick-version',
            }),
        );
        const { versionId: savedVersionId } = seedPersistedWorkout(
            context.testDb,
            savedWorkout,
        );
        seedWorkoutSession(
            context.testDb,
            createSessionFixture({
                id: 'saved-session',
                workoutSnapshot: savedWorkout,
                workoutVersionId: savedVersionId,
            }),
        );

        workoutSessionService.deleteSession('quick-session');

        const removedQuickVersion = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .where(eq(workoutVersionsTable.id, quickVersionId))
            .get();
        const retainedSavedVersion = readWorkoutVersionRowOrThrow(
            context.testDb,
            savedVersionId,
        );

        expect(removedQuickVersion).toBeUndefined();
        expect(retainedSavedVersion.id).toBe(savedVersionId);

        workoutSessionService.deleteSession('saved-session');

        const retainedAfterSavedDelete = readWorkoutVersionRowOrThrow(
            context.testDb,
            savedVersionId,
        );

        expect(retainedAfterSavedDelete.id).toBe(savedVersionId);
    });

    it('getById returns a hydrated session when the id exists', () => {
        const workout = createWorkoutFixture();
        const { workoutSessionService } = context.testDb.dbServices;
        const { versionId } = seedPersistedWorkout(context.testDb, workout);
        const expectedSession = createSessionFixture({
            id: 'session-1',
            workoutSnapshot: workout,
            workoutVersionId: versionId,
        });

        seedWorkoutSession(context.testDb, expectedSession);

        const found = workoutSessionService.getById(expectedSession.id);

        expectHydratedSessionToMatchFixture(found, expectedSession);
    });

    it('getById returns null when the id does not exist', () => {
        const { workoutSessionService } = context.testDb.dbServices;

        expect(
            workoutSessionService.getById('non-existent-session'),
        ).toBeNull();
    });

    it('clearSessions removes all sessions from the DB', () => {
        const { workoutSessionService } = context.testDb.dbServices;

        seedWorkoutSession(
            context.testDb,
            createSessionFixture({
                id: 'session-1',
                workoutSnapshot: createWorkoutFixture({
                    id: 'w1',
                    name: 'First',
                }),
                workoutVersionId: 'version-1',
            }),
        );
        seedWorkoutSession(
            context.testDb,
            createSessionFixture({
                id: 'session-2',
                workoutSnapshot: createWorkoutFixture({
                    id: 'w2',
                    name: 'Second',
                }),
                workoutVersionId: 'version-2',
            }),
        );

        workoutSessionService.clearSessions();

        const remainingSessions = context.testDb.db
            .select()
            .from(workoutSessionsTable)
            .all();

        expect(remainingSessions).toHaveLength(0);
    });

    it('clearSessions removes orphaned versions but keeps active workout versions', () => {
        const quickWorkout = createWorkoutFixture({ id: 'quick-workout' });
        const savedWorkout = createWorkoutFixture({ id: 'saved-workout' });
        const { workoutSessionService } = context.testDb.dbServices;
        seedWorkoutSession(
            context.testDb,
            createSessionFixture({
                id: 'quick-session',
                workoutSnapshot: quickWorkout,
                workoutVersionId: 'quick-version',
            }),
        );
        const { versionId: savedVersionId } = seedPersistedWorkout(
            context.testDb,
            savedWorkout,
        );
        seedWorkoutSession(
            context.testDb,
            createSessionFixture({
                id: 'saved-session',
                workoutSnapshot: savedWorkout,
                workoutVersionId: savedVersionId,
            }),
        );

        workoutSessionService.clearSessions();

        const remainingVersions = context.testDb.db
            .select()
            .from(workoutVersionsTable)
            .orderBy(asc(workoutVersionsTable.id))
            .all();

        expect(remainingVersions).toHaveLength(1);
        expect(remainingVersions[0]?.id).toBe(savedVersionId);
    });
});
