import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import {
    createAsyncStorageMigration,
    type AsyncStorageWorkoutMigrationResult,
    type MigrationAsyncStorage,
} from '@src/db/migrations/migrateAsyncStorageWorkoutData/migrateAsyncStorageWorkoutDataFactory';
import { workoutVersionsTable } from '@src/db/schema';

import { createTestDb, type TestDb } from '../../../helpers/createTestDb';

// ── In-memory AsyncStorage stub ────────────────────────────────────────────

const createInMemoryStorage = (
    seed: Record<string, string> = {},
): MigrationAsyncStorage & { store: Map<string, string> } => {
    const store = new Map<string, string>(Object.entries(seed));

    return {
        store,
        getItem: async (key) => store.get(key) ?? null,
        setItem: async (key, value) => {
            store.set(key, value);
        },
    };
};

// ── Legacy AsyncStorage payload ────────────────────────────────────────────
//
// Mirrors the Zustand-persisted shape: { state: { workouts/sessions: { … } } }
//
// Workouts
//   workout-1  isFavorite: true,  2 blocks (4 exercises)
//   workout-2  isFavorite: false, 1 block  (1 exercise)
//
// Sessions (5 total)
//   session-1  workoutId → workout-1, snapshot = workout1    → reuses workout-1's version
//   session-2  no workoutId,          snapshot = detached     → creates detached version A
//   session-3  no workoutId,          snapshot = unique       → creates detached version B
//   session-4  workoutId → workout-2, snapshot = workout2    → reuses workout-2's version
//   session-5  no workoutId,          snapshot = detached     → reuses detached version A

const workout1 = {
    id: 'workout-1',
    name: 'Power Circuit',
    updatedAtMs: 1_700_000_000_000,
    isFavorite: true,
    blocks: [
        {
            id: 'w1-block-1',
            title: 'Warmup',
            sets: 1,
            restBetweenSetsSec: 0,
            restBetweenExercisesSec: 10,
            exercises: [
                {
                    id: 'w1-b1-e1',
                    name: 'Jumping Jacks',
                    mode: 'time',
                    value: 30,
                },
                { id: 'w1-b1-e2', name: 'High Knees', mode: 'time', value: 20 },
            ],
        },
        {
            id: 'w1-block-2',
            title: 'Main',
            sets: 3,
            restBetweenSetsSec: 60,
            restBetweenExercisesSec: 15,
            exercises: [
                { id: 'w1-b2-e1', name: 'Burpee', mode: 'reps', value: 10 },
                { id: 'w1-b2-e2', name: 'Plank', mode: 'time', value: 60 },
            ],
        },
    ],
};

const workout2 = {
    id: 'workout-2',
    name: 'Quick Run',
    updatedAtMs: 1_700_000_100_000,
    isFavorite: false,
    blocks: [
        {
            id: 'w2-block-1',
            sets: 1,
            restBetweenSetsSec: 0,
            restBetweenExercisesSec: 0,
            exercises: [
                { id: 'w2-b1-e1', name: 'Sprint', mode: 'time', value: 30 },
            ],
        },
    ],
};

// Shared snapshot — session-2 and session-5 use identical content so they
// should end up on the same detached version (version A).
const detachedSnapshot = {
    id: 'orphan-1',
    name: 'Orphan Workout',
    updatedAtMs: 1_699_000_000_000,
    blocks: [
        {
            id: 'orphan-block-1',
            sets: 2,
            restBetweenSetsSec: 30,
            restBetweenExercisesSec: 10,
            exercises: [
                {
                    id: 'orphan-e1',
                    name: 'Mountain Climbers',
                    mode: 'time',
                    value: 45,
                },
            ],
        },
    ],
};

// Exclusive snapshot — only session-3 uses this content (version B).
const uniqueSnapshot = {
    id: 'orphan-2',
    name: 'Unique Workout',
    updatedAtMs: 1_698_000_000_000,
    blocks: [
        {
            id: 'unique-block-1',
            sets: 1,
            restBetweenSetsSec: 0,
            restBetweenExercisesSec: 0,
            exercises: [
                { id: 'unique-e1', name: 'Box Jumps', mode: 'reps', value: 8 },
            ],
        },
    ],
};

const workoutsStorageRaw = JSON.stringify({
    state: {
        workouts: {
            'workout-1': workout1,
            'workout-2': workout2,
        },
    },
});

const historyStorageRaw = JSON.stringify({
    state: {
        sessions: {
            'session-1': {
                id: 'session-1',
                startedAtMs: 1_700_001_000_000,
                endedAtMs: 1_700_001_600_000,
                workoutSnapshot: workout1,
                workoutId: 'workout-1',
                totalDurationSec: 600,
            },
            'session-2': {
                id: 'session-2',
                startedAtMs: 1_700_002_000_000,
                endedAtMs: 1_700_002_900_000,
                workoutSnapshot: detachedSnapshot,
                totalDurationSec: 900,
            },
            'session-3': {
                id: 'session-3',
                startedAtMs: 1_700_003_000_000,
                endedAtMs: 1_700_003_300_000,
                workoutSnapshot: uniqueSnapshot,
                totalDurationSec: 300,
            },
            'session-4': {
                id: 'session-4',
                startedAtMs: 1_700_004_000_000,
                endedAtMs: 1_700_004_600_000,
                workoutSnapshot: workout2,
                workoutId: 'workout-2',
                totalDurationSec: 600,
            },
            'session-5': {
                id: 'session-5',
                startedAtMs: 1_700_005_000_000,
                endedAtMs: 1_700_005_900_000,
                workoutSnapshot: detachedSnapshot,
                totalDurationSec: 900,
            },
        },
    },
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe('migrateAsyncStorageWorkoutData', () => {
    let testDb: TestDb;
    let storage: ReturnType<typeof createInMemoryStorage>;
    let result: AsyncStorageWorkoutMigrationResult;

    beforeAll(async () => {
        testDb = createTestDb();
        storage = createInMemoryStorage({
            'workouts-storage': workoutsStorageRaw,
            'workout-history-storage-v1': historyStorageRaw,
        });

        result = await createAsyncStorageMigration({
            asyncStorage: storage,
            db: testDb.db,
            exerciseDefinitionService:
                testDb.dbServices.exerciseDefinitionService,
            workoutRepository: testDb.dbServices.workoutRepository,
            workoutSessionRepository:
                testDb.dbServices.workoutSessionRepository,
        })();
    });

    afterAll(() => {
        testDb.close();
    });

    it('returns didRun: true with correct counts', () => {
        expect(result.didRun).toBe(true);
        expect(result.counts).toEqual({ workouts: 2, sessions: 5 });
    });

    it('migrates both workouts preserving id, isFavorite, and sort order', () => {
        const { workoutRepository } = testDb.dbServices;
        const w1 = workoutRepository.getWorkoutRow('workout-1');
        const w2 = workoutRepository.getWorkoutRow('workout-2');

        expect(w1).toMatchObject({
            id: 'workout-1',
            isFavorite: true,
            sortIndex: 0,
        });
        expect(w2).toMatchObject({
            id: 'workout-2',
            isFavorite: false,
            sortIndex: 1,
        });
    });

    it('migrates all five sessions', () => {
        const rows = testDb.dbServices.workoutSessionRepository.getAllRows();
        const ids = new Set(rows.map((r) => r.id));

        expect(ids).toEqual(
            new Set([
                'session-1',
                'session-2',
                'session-3',
                'session-4',
                'session-5',
            ]),
        );
    });

    it('sessions with workoutId reuse their workout current version', () => {
        const { workoutRepository, workoutSessionRepository } =
            testDb.dbServices;
        const w1Row = workoutRepository.getWorkoutRow('workout-1');
        const w2Row = workoutRepository.getWorkoutRow('workout-2');
        const s1Row = workoutSessionRepository.getRowById('session-1');
        const s4Row = workoutSessionRepository.getRowById('session-4');

        expect(s1Row?.workoutVersionId).toBe(w1Row?.currentVersionId);
        expect(s4Row?.workoutVersionId).toBe(w2Row?.currentVersionId);
    });

    it('orphaned sessions with identical snapshot content share a detached version', () => {
        const { workoutSessionRepository } = testDb.dbServices;
        const s2Row = workoutSessionRepository.getRowById('session-2');
        const s5Row = workoutSessionRepository.getRowById('session-5');

        expect(s2Row?.workoutVersionId).toBeDefined();
        expect(s2Row?.workoutVersionId).toBe(s5Row?.workoutVersionId);
    });

    it('orphaned sessions with different snapshot content get distinct versions', () => {
        const { workoutSessionRepository } = testDb.dbServices;
        const s2Row = workoutSessionRepository.getRowById('session-2');
        const s3Row = workoutSessionRepository.getRowById('session-3');

        expect(s2Row?.workoutVersionId).not.toBe(s3Row?.workoutVersionId);
    });

    it('creates exactly 4 workout versions (2 active + 2 detached)', () => {
        const versions = testDb.db.select().from(workoutVersionsTable).all();

        expect(versions).toHaveLength(4);
    });

    it('writes the migration marker to storage', () => {
        const marker = storage.store.get('sqlite-workout-migration-v1');

        expect(marker).toBeDefined();
        expect(JSON.parse(marker!)).toMatchObject({
            counts: { workouts: 2, sessions: 5 },
        });
    });

    describe('when the migration marker already exists', () => {
        it('returns didRun: false without re-running', async () => {
            const storageWithMarker = createInMemoryStorage({
                'workouts-storage': workoutsStorageRaw,
                'workout-history-storage-v1': historyStorageRaw,
                'sqlite-workout-migration-v1': JSON.stringify({
                    migratedAtMs: Date.now(),
                    counts: { workouts: 2, sessions: 5 },
                }),
            });

            const secondResult = await createAsyncStorageMigration({
                asyncStorage: storageWithMarker,
                db: testDb.db,
                exerciseDefinitionService:
                    testDb.dbServices.exerciseDefinitionService,
                workoutRepository: testDb.dbServices.workoutRepository,
                workoutSessionRepository:
                    testDb.dbServices.workoutSessionRepository,
            })();

            expect(secondResult).toEqual({
                didRun: false,
                counts: { workouts: 0, sessions: 0 },
            });
        });
    });
});
