import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { asc, eq } from 'drizzle-orm';

import type { Clock } from '@src/db/repositories/repositoryClock';
import {
    isGymError,
    type GymErrorCode,
} from '@src/db/repositories/gyms/gymErrors';
import {
    gymExerciseRecordsTable,
    gymExerciseRecordSetsTable,
    gymSessionsTable,
} from '@src/db/schema';

import { createExerciseDefinitionFixture } from '../../fixtures/exerciseDefinitions';
import type { TestDb } from '../../helpers/createTestDb';
import {
    createRepositoryContext,
    type RepositoryContext,
} from '../../helpers/dbIntegrationHelpers';
import { seedExerciseDefinition } from '../../helpers/seedExerciseDefinition';
import {
    seedGymExerciseRecord,
    seedGymExerciseRecordSet,
    seedGymSession,
} from '../../helpers/seedGymSession';

const FIXED_NOW_MS = 1_900_000_000_000;

const fixedClock: Clock = {
    now: () => FIXED_NOW_MS,
};

type GymSessionRow = typeof gymSessionsTable.$inferSelect;
type GymExerciseRecordRow = typeof gymExerciseRecordsTable.$inferSelect;
type GymExerciseRecordSetRow = typeof gymExerciseRecordSetsTable.$inferSelect;

const expectGymErrorCode = (
    action: () => void,
    code: GymErrorCode,
): void => {
    try {
        action();
    } catch (error) {
        expect(isGymError(error)).toBe(true);
        if (!isGymError(error)) throw error;
        expect(error.code).toBe(code);
        return;
    }

    throw new Error(`Expected gym error ${code}`);
};

const readGymSessionRowOrThrow = (
    testDb: TestDb,
    sessionId: string,
): GymSessionRow => {
    const session = testDb.db
        .select()
        .from(gymSessionsTable)
        .where(eq(gymSessionsTable.id, sessionId))
        .get();

    expect(session).toBeDefined();
    if (!session) {
        throw new Error(`Expected gym session row ${sessionId}`);
    }

    return session;
};

const readGymExerciseRecordRowOrThrow = (
    testDb: TestDb,
    recordId: string,
): GymExerciseRecordRow => {
    const record = testDb.db
        .select()
        .from(gymExerciseRecordsTable)
        .where(eq(gymExerciseRecordsTable.id, recordId))
        .get();

    expect(record).toBeDefined();
    if (!record) {
        throw new Error(`Expected gym exercise record row ${recordId}`);
    }

    return record;
};

const readGymExerciseRecordSetRowOrThrow = (
    testDb: TestDb,
    setId: string,
): GymExerciseRecordSetRow => {
    const set = testDb.db
        .select()
        .from(gymExerciseRecordSetsTable)
        .where(eq(gymExerciseRecordSetsTable.id, setId))
        .get();

    expect(set).toBeDefined();
    if (!set) {
        throw new Error(`Expected gym exercise record set row ${setId}`);
    }

    return set;
};

describe('gymSessionService integration', () => {
    let context: RepositoryContext;

    beforeEach(() => {
        context = createRepositoryContext(fixedClock);
    });

    afterEach(() => {
        context.testDb.close();
    });

    describe('getActiveGymSession', () => {
        it('returns null when no gym session is active', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expect(gymSessionService.getActiveGymSession()).toBeNull();
        });

        it('returns the active session with its exercise records', () => {
            const { gymSessionService } = context.testDb.dbServices;
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Active Press',
                    availability: 'gym',
                }),
            );
            seedGymSession(context.testDb, {
                id: 'active-session',
                startedAtMs: FIXED_NOW_MS - 1_000,
                status: 'active',
            });
            seedGymExerciseRecord(context.testDb, {
                id: 'active-session-record',
                gymSessionId: 'active-session',
                exerciseDefinitionId: definition.id,
                sortIndex: 0,
            });

            const active = gymSessionService.getActiveGymSession();

            expect(active?.id).toBe('active-session');
            expect(active?.exerciseRecords.map((item) => item.id)).toEqual([
                'active-session-record',
            ]);
        });
    });

    describe('getGymSessionById', () => {
        it('returns null when the session does not exist', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expect(gymSessionService.getGymSessionById('missing-session')).toBeNull();
        });

        it('hydrates exercise records and sets in persisted order', () => {
            const { gymSessionService } = context.testDb.dbServices;
            const press = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Hydrated Press',
                    availability: 'gym',
                }),
            );
            const curl = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Hydrated Curl',
                    availability: 'gym',
                }),
            );
            seedGymSession(context.testDb, {
                id: 'hydrated-session',
                startedAtMs: FIXED_NOW_MS - 1_000,
                status: 'active',
            });
            seedGymExerciseRecord(context.testDb, {
                id: 'hydrated-first-record',
                gymSessionId: 'hydrated-session',
                exerciseDefinitionId: press.id,
                sortIndex: 0,
            });
            seedGymExerciseRecord(context.testDb, {
                id: 'hydrated-second-record',
                gymSessionId: 'hydrated-session',
                exerciseDefinitionId: curl.id,
                sortIndex: 1,
            });
            seedGymExerciseRecordSet(context.testDb, {
                id: 'hydrated-first-set',
                gymExerciseRecordId: 'hydrated-first-record',
                setIndex: 0,
                reps: 5,
            });
            seedGymExerciseRecordSet(context.testDb, {
                id: 'hydrated-second-set',
                gymExerciseRecordId: 'hydrated-first-record',
                setIndex: 1,
                reps: 6,
            });

            const hydrated = gymSessionService.getGymSessionById(
                'hydrated-session',
            );

            expect(hydrated?.exerciseRecords.map((record) => record.id)).toEqual([
                'hydrated-first-record',
                'hydrated-second-record',
            ]);
            expect(
                hydrated?.exerciseRecords[0]?.sets.map((set) => set.setIndex),
            ).toEqual([0, 1]);
        });
    });

    describe('listGymSessions', () => {
        it('returns finished sessions and excludes the active session', () => {
            const { gymSessionService } = context.testDb.dbServices;
            seedGymSession(context.testDb, {
                id: 'completed-session',
                startedAtMs: FIXED_NOW_MS - 10_000,
                endedAtMs: FIXED_NOW_MS,
                status: 'completed',
            });
            seedGymSession(context.testDb, {
                id: 'active-session',
                startedAtMs: FIXED_NOW_MS,
                status: 'active',
            });

            const sessions = gymSessionService.listGymSessions();

            expect(sessions.map((session) => session.id)).toEqual([
                'completed-session',
            ]);
        });
    });

    describe('startEmptyGymSession', () => {
        it('persists one active session container from the input and current clock', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const session = gymSessionService.startEmptyGymSession({
                notes: 'evening session',
                startedAtMs: FIXED_NOW_MS - 1_000,
            });

            const row = readGymSessionRowOrThrow(context.testDb, session.id);

            expect(row).toMatchObject({
                id: session.id,
                startedAtMs: FIXED_NOW_MS - 1_000,
                endedAtMs: null,
                status: 'active',
                notes: 'evening session',
                createdAtMs: FIXED_NOW_MS,
                updatedAtMs: FIXED_NOW_MS,
            });
            expect(session.exerciseRecords).toEqual([]);
        });

        it('rejects starting another session while one is active', () => {
            const { gymSessionService } = context.testDb.dbServices;

            seedGymSession(context.testDb, {
                id: 'existing-active-session',
                startedAtMs: FIXED_NOW_MS - 1_000,
                status: 'active',
            });

            expectGymErrorCode(
                () => {
                    gymSessionService.startEmptyGymSession();
                },
                'ACTIVE_SESSION_EXISTS',
            );
        });
    });

    describe('addExerciseRecordToSession', () => {
        it('appends gym-available exercise records with session-scoped sort indexes', () => {
            const { gymSessionService } = context.testDb.dbServices;
            const benchPress = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Sort Press',
                    availability: 'gym',
                }),
            );
            const squat = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Sort Squat',
                    availability: 'both',
                }),
            );
            seedGymSession(context.testDb, {
                id: 'active-session',
                startedAtMs: FIXED_NOW_MS - 1_000,
                status: 'active',
            });

            const first = gymSessionService.addExerciseRecordToSession({
                sessionId: 'active-session',
                exerciseDefinitionId: benchPress.id,
            });
            const second = gymSessionService.addExerciseRecordToSession({
                sessionId: 'active-session',
                exerciseDefinitionId: squat.id,
            });

            const rows = context.testDb.db
                .select()
                .from(gymExerciseRecordsTable)
                .where(eq(gymExerciseRecordsTable.gymSessionId, 'active-session'))
                .orderBy(asc(gymExerciseRecordsTable.sortIndex))
                .all();

            expect(first.sortIndex).toBe(0);
            expect(second.sortIndex).toBe(1);
            expect(rows.map((row) => row.sortIndex)).toEqual([0, 1]);
            expect(rows.map((row) => row.exerciseDefinitionId)).toEqual([
                benchPress.id,
                squat.id,
            ]);
        });

        it('rejects workout-only exercise definitions', () => {
            const { gymSessionService } = context.testDb.dbServices;
            const workoutOnlyDefinition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    availability: 'workout',
                    name: 'Workout Only Move',
                }),
            );
            seedGymSession(context.testDb, {
                id: 'active-session',
                startedAtMs: FIXED_NOW_MS - 1_000,
                status: 'active',
            });

            expectGymErrorCode(
                () => {
                    gymSessionService.addExerciseRecordToSession({
                        sessionId: 'active-session',
                        exerciseDefinitionId: workoutOnlyDefinition.id,
                    });
                },
                'EXERCISE_DEFINITION_NOT_GYM_AVAILABLE',
            );
        });

        it('rejects missing exercise definitions', () => {
            const { gymSessionService } = context.testDb.dbServices;
            seedGymSession(context.testDb, {
                id: 'active-session',
                startedAtMs: FIXED_NOW_MS - 1_000,
                status: 'active',
            });

            expectGymErrorCode(
                () => {
                    gymSessionService.addExerciseRecordToSession({
                        sessionId: 'active-session',
                        exerciseDefinitionId: 'missing-definition',
                    });
                },
                'EXERCISE_DEFINITION_NOT_FOUND',
            );
        });

        it('rejects appending an exercise record to a completed session', () => {
            const { gymSessionService } = context.testDb.dbServices;
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Completed Row',
                    availability: 'gym',
                }),
            );
            seedGymSession(context.testDb, {
                id: 'completed-session',
                startedAtMs: FIXED_NOW_MS - 2_000,
                endedAtMs: FIXED_NOW_MS - 1_000,
                status: 'completed',
            });

            expectGymErrorCode(
                () => {
                    gymSessionService.addExerciseRecordToSession({
                        sessionId: 'completed-session',
                        exerciseDefinitionId: definition.id,
                    });
                },
                'SESSION_NOT_MUTABLE',
            );
        });

        it('rejects appending an exercise record to a discarded session', () => {
            const { gymSessionService } = context.testDb.dbServices;
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Discarded Row',
                    availability: 'gym',
                }),
            );
            seedGymSession(context.testDb, {
                id: 'discarded-session',
                startedAtMs: FIXED_NOW_MS - 2_000,
                endedAtMs: FIXED_NOW_MS - 1_000,
                status: 'discarded',
            });

            expectGymErrorCode(
                () => {
                    gymSessionService.addExerciseRecordToSession({
                        sessionId: 'discarded-session',
                        exerciseDefinitionId: definition.id,
                    });
                },
                'SESSION_NOT_MUTABLE',
            );
        });

        it('rejects appending an exercise record to a missing session', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expectGymErrorCode(
                () => {
                    gymSessionService.addExerciseRecordToSession({
                        sessionId: 'missing-session',
                        exerciseDefinitionId: 'missing-definition',
                    });
                },
                'SESSION_NOT_FOUND',
            );
        });
    });

    describe('addSetToExerciseRecord', () => {
        it('appends meaningful sets with record-scoped set indexes', () => {
            const { gymSessionService } = context.testDb.dbServices;
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Set Deadlift',
                    availability: 'gym',
                }),
            );
            seedGymSession(context.testDb, {
                id: 'active-session',
                startedAtMs: FIXED_NOW_MS - 1_000,
                status: 'active',
            });
            seedGymExerciseRecord(context.testDb, {
                id: 'active-record',
                gymSessionId: 'active-session',
                exerciseDefinitionId: definition.id,
                sortIndex: 0,
            });

            const first = gymSessionService.addSetToExerciseRecord({
                exerciseRecordId: 'active-record',
                reps: 5,
                weightGrams: 100_000,
            });
            const second = gymSessionService.addSetToExerciseRecord({
                exerciseRecordId: 'active-record',
                reps: 3,
                weightGrams: 120_000,
            });

            const rows = context.testDb.db
                .select()
                .from(gymExerciseRecordSetsTable)
                .where(
                    eq(
                        gymExerciseRecordSetsTable.gymExerciseRecordId,
                        'active-record',
                    ),
                )
                .orderBy(asc(gymExerciseRecordSetsTable.setIndex))
                .all();

            expect(first.setIndex).toBe(0);
            expect(second.setIndex).toBe(1);
            expect(rows.map((row) => row.setIndex)).toEqual([0, 1]);
        });

        it('rejects set rows without a measurable effort value', () => {
            const { gymSessionService } = context.testDb.dbServices;
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Empty Set Plank',
                    availability: 'gym',
                }),
            );
            seedGymSession(context.testDb, {
                id: 'active-session',
                startedAtMs: FIXED_NOW_MS - 1_000,
                status: 'active',
            });
            seedGymExerciseRecord(context.testDb, {
                id: 'active-record',
                gymSessionId: 'active-session',
                exerciseDefinitionId: definition.id,
                sortIndex: 0,
            });

            expectGymErrorCode(
                () => {
                    gymSessionService.addSetToExerciseRecord({
                        exerciseRecordId: 'active-record',
                        notes: 'empty note only',
                    });
                },
                'INVALID_GYM_SET',
            );
        });

        it('rejects appending a set to a record from a completed session', () => {
            const { gymSessionService } = context.testDb.dbServices;
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Completed Set Row',
                    availability: 'gym',
                }),
            );
            seedGymSession(context.testDb, {
                id: 'completed-session',
                startedAtMs: FIXED_NOW_MS - 2_000,
                endedAtMs: FIXED_NOW_MS - 1_000,
                status: 'completed',
            });
            seedGymExerciseRecord(context.testDb, {
                id: 'completed-record',
                gymSessionId: 'completed-session',
                exerciseDefinitionId: definition.id,
                sortIndex: 0,
            });

            expectGymErrorCode(
                () => {
                    gymSessionService.addSetToExerciseRecord({
                        exerciseRecordId: 'completed-record',
                        reps: 10,
                    });
                },
                'EXERCISE_RECORD_NOT_IN_ACTIVE_SESSION',
            );
        });

        it('rejects appending a set to a missing exercise record', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expectGymErrorCode(
                () => {
                    gymSessionService.addSetToExerciseRecord({
                        exerciseRecordId: 'missing-record',
                        reps: 10,
                    });
                },
                'EXERCISE_RECORD_NOT_FOUND',
            );
        });
    });

    describe('updateExerciseRecord', () => {
        it('updates editable record fields while preserving the performed exercise identity', () => {
            const { gymSessionService } = context.testDb.dbServices;
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Update Pulldown',
                    availability: 'gym',
                }),
            );
            seedGymSession(context.testDb, {
                id: 'active-session',
                startedAtMs: FIXED_NOW_MS - 1_000,
                status: 'active',
            });
            seedGymExerciseRecord(context.testDb, {
                id: 'active-record',
                gymSessionId: 'active-session',
                exerciseDefinitionId: definition.id,
                sortIndex: 0,
                startedAtMs: FIXED_NOW_MS,
            });

            const updated = gymSessionService.updateExerciseRecord({
                id: 'active-record',
                completedAtMs: FIXED_NOW_MS + 60_000,
                notes: 'controlled tempo',
            });
            const row = readGymExerciseRecordRowOrThrow(
                context.testDb,
                'active-record',
            );

            expect(updated).toMatchObject({
                id: 'active-record',
                exerciseDefinitionId: definition.id,
                startedAtMs: FIXED_NOW_MS,
                completedAtMs: FIXED_NOW_MS + 60_000,
                notes: 'controlled tempo',
                updatedAtMs: FIXED_NOW_MS,
            });
            expect(row).toMatchObject({
                id: 'active-record',
                exerciseDefinitionId: definition.id,
                startedAtMs: FIXED_NOW_MS,
                completedAtMs: FIXED_NOW_MS + 60_000,
                notes: 'controlled tempo',
                updatedAtMs: FIXED_NOW_MS,
            });
        });

        it('rejects completion before the record start time', () => {
            const { gymSessionService } = context.testDb.dbServices;
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Cable Row',
                    availability: 'gym',
                }),
            );
            seedGymSession(context.testDb, {
                id: 'active-session',
                startedAtMs: FIXED_NOW_MS - 1_000,
                status: 'active',
            });
            seedGymExerciseRecord(context.testDb, {
                id: 'active-record',
                gymSessionId: 'active-session',
                exerciseDefinitionId: definition.id,
                sortIndex: 0,
                startedAtMs: FIXED_NOW_MS,
            });

            expectGymErrorCode(
                () => {
                    gymSessionService.updateExerciseRecord({
                        id: 'active-record',
                        completedAtMs: FIXED_NOW_MS - 1,
                    });
                },
                'INVALID_GYM_EXERCISE_RECORD',
            );
        });

        it('rejects updating a missing exercise record', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expectGymErrorCode(
                () => {
                    gymSessionService.updateExerciseRecord({
                        id: 'missing-record',
                        notes: 'not saved',
                    });
                },
                'EXERCISE_RECORD_NOT_FOUND',
            );
        });

        it('rejects updating an exercise record from a discarded session', () => {
            const { gymSessionService } = context.testDb.dbServices;
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Discarded Update Row',
                    availability: 'gym',
                }),
            );
            seedGymSession(context.testDb, {
                id: 'discarded-session',
                startedAtMs: FIXED_NOW_MS - 2_000,
                endedAtMs: FIXED_NOW_MS - 1_000,
                status: 'discarded',
            });
            seedGymExerciseRecord(context.testDb, {
                id: 'discarded-record',
                gymSessionId: 'discarded-session',
                exerciseDefinitionId: definition.id,
                sortIndex: 0,
            });

            expectGymErrorCode(
                () => {
                    gymSessionService.updateExerciseRecord({
                        id: 'discarded-record',
                        notes: 'not saved',
                    });
                },
                'EXERCISE_RECORD_NOT_IN_ACTIVE_SESSION',
            );
        });
    });

    describe('updateExerciseRecordSet', () => {
        it('updates editable set fields while preserving the logged set identity', () => {
            const { gymSessionService } = context.testDb.dbServices;
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Update Pull Up',
                    availability: 'both',
                }),
            );
            seedGymSession(context.testDb, {
                id: 'active-session',
                startedAtMs: FIXED_NOW_MS - 1_000,
                status: 'active',
            });
            seedGymExerciseRecord(context.testDb, {
                id: 'active-record',
                gymSessionId: 'active-session',
                exerciseDefinitionId: definition.id,
                sortIndex: 0,
            });
            seedGymExerciseRecordSet(context.testDb, {
                id: 'active-set',
                gymExerciseRecordId: 'active-record',
                setIndex: 0,
                reps: 8,
            });

            const updated = gymSessionService.updateExerciseRecordSet({
                id: 'active-set',
                reps: 10,
                rpeTenths: 85,
            });
            const row = readGymExerciseRecordSetRowOrThrow(
                context.testDb,
                'active-set',
            );

            expect(updated).toMatchObject({
                id: 'active-set',
                reps: 10,
                rpeTenths: 85,
                updatedAtMs: FIXED_NOW_MS,
            });
            expect(row).toMatchObject({
                id: 'active-set',
                reps: 10,
                rpeTenths: 85,
                updatedAtMs: FIXED_NOW_MS,
            });
        });

        it('rejects editing a set from a completed session', () => {
            const { gymSessionService } = context.testDb.dbServices;
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Completed Edit Set Row',
                    availability: 'gym',
                }),
            );
            seedGymSession(context.testDb, {
                id: 'completed-session',
                startedAtMs: FIXED_NOW_MS - 2_000,
                endedAtMs: FIXED_NOW_MS - 1_000,
                status: 'completed',
            });
            seedGymExerciseRecord(context.testDb, {
                id: 'completed-record',
                gymSessionId: 'completed-session',
                exerciseDefinitionId: definition.id,
                sortIndex: 0,
            });
            seedGymExerciseRecordSet(context.testDb, {
                id: 'completed-set',
                gymExerciseRecordId: 'completed-record',
                setIndex: 0,
                reps: 12,
            });

            expectGymErrorCode(
                () => {
                    gymSessionService.updateExerciseRecordSet({
                        id: 'completed-set',
                        reps: 10,
                    });
                },
                'EXERCISE_RECORD_NOT_IN_ACTIVE_SESSION',
            );
        });

        it('rejects editing a missing set', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expectGymErrorCode(
                () => {
                    gymSessionService.updateExerciseRecordSet({
                        id: 'missing-set',
                        reps: 10,
                    });
                },
                'EXERCISE_SET_NOT_FOUND',
            );
        });
    });

    describe('finishGymSession', () => {
        it('marks the active session completed and makes it available in recent history', () => {
            const { gymSessionService } = context.testDb.dbServices;
            seedGymSession(context.testDb, {
                id: 'active-session',
                startedAtMs: FIXED_NOW_MS - 10_000,
                status: 'active',
            });

            const finished = gymSessionService.finishGymSession({
                sessionId: 'active-session',
                endedAtMs: FIXED_NOW_MS,
                notes: 'done',
            });
            const row = readGymSessionRowOrThrow(
                context.testDb,
                'active-session',
            );

            expect(finished).toMatchObject({
                id: 'active-session',
                status: 'completed',
                endedAtMs: FIXED_NOW_MS,
                notes: 'done',
            });
            expect(row).toMatchObject({
                id: 'active-session',
                status: 'completed',
                endedAtMs: FIXED_NOW_MS,
                notes: 'done',
                updatedAtMs: FIXED_NOW_MS,
            });
            expect(gymSessionService.getActiveGymSession()).toBeNull();
            expect(gymSessionService.listGymSessions()).toHaveLength(1);
        });

        it('rejects an ended time before the session start', () => {
            const { gymSessionService } = context.testDb.dbServices;
            seedGymSession(context.testDb, {
                id: 'active-session',
                startedAtMs: FIXED_NOW_MS,
                status: 'active',
            });

            expectGymErrorCode(
                () => {
                    gymSessionService.finishGymSession({
                        sessionId: 'active-session',
                        endedAtMs: FIXED_NOW_MS - 1,
                    });
                },
                'INVALID_GYM_SESSION',
            );
        });

        it('rejects finishing when no active session exists', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expectGymErrorCode(
                () => {
                    gymSessionService.finishGymSession();
                },
                'ACTIVE_SESSION_NOT_FOUND',
            );
        });

        it('rejects finishing a missing session', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expectGymErrorCode(
                () => {
                    gymSessionService.finishGymSession({
                        sessionId: 'missing-session',
                    });
                },
                'SESSION_NOT_FOUND',
            );
        });
    });

    describe('discardGymSession', () => {
        it('marks the active session discarded and clears the active session', () => {
            const { gymSessionService } = context.testDb.dbServices;
            seedGymSession(context.testDb, {
                id: 'active-session',
                startedAtMs: FIXED_NOW_MS - 1_000,
                status: 'active',
            });

            const discarded = gymSessionService.discardGymSession(
                'active-session',
            );
            const row = readGymSessionRowOrThrow(
                context.testDb,
                'active-session',
            );

            expect(discarded).toMatchObject({
                id: 'active-session',
                status: 'discarded',
                endedAtMs: FIXED_NOW_MS,
            });
            expect(row).toMatchObject({
                id: 'active-session',
                status: 'discarded',
                endedAtMs: FIXED_NOW_MS,
                updatedAtMs: FIXED_NOW_MS,
            });
            expect(gymSessionService.getActiveGymSession()).toBeNull();
        });

        it('rejects discarding a completed session', () => {
            const { gymSessionService } = context.testDb.dbServices;
            seedGymSession(context.testDb, {
                id: 'completed-session',
                startedAtMs: FIXED_NOW_MS - 2_000,
                endedAtMs: FIXED_NOW_MS - 1_000,
                status: 'completed',
            });

            expectGymErrorCode(
                () => {
                    gymSessionService.discardGymSession('completed-session');
                },
                'SESSION_NOT_MUTABLE',
            );
        });
    });

    describe('deleteExerciseRecord', () => {
        it('removes the exercise record and its sets from the active session', () => {
            const { gymSessionService } = context.testDb.dbServices;
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Delete Split Squat',
                    availability: 'gym',
                }),
            );
            seedGymSession(context.testDb, {
                id: 'active-session',
                startedAtMs: FIXED_NOW_MS - 1_000,
                status: 'active',
            });
            seedGymExerciseRecord(context.testDb, {
                id: 'active-record',
                gymSessionId: 'active-session',
                exerciseDefinitionId: definition.id,
                sortIndex: 0,
            });
            seedGymExerciseRecordSet(context.testDb, {
                id: 'active-set',
                gymExerciseRecordId: 'active-record',
                setIndex: 0,
                reps: 8,
            });

            gymSessionService.deleteExerciseRecord('active-record');

            const deletedRecord = context.testDb.db
                .select()
                .from(gymExerciseRecordsTable)
                .where(eq(gymExerciseRecordsTable.id, 'active-record'))
                .get();
            const deletedSet = context.testDb.db
                .select()
                .from(gymExerciseRecordSetsTable)
                .where(eq(gymExerciseRecordSetsTable.id, 'active-set'))
                .get();

            expect(deletedRecord).toBeUndefined();
            expect(deletedSet).toBeUndefined();
        });

        it('rejects deleting a missing exercise record', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expectGymErrorCode(
                () => {
                    gymSessionService.deleteExerciseRecord('missing-record');
                },
                'EXERCISE_RECORD_NOT_FOUND',
            );
        });
    });

    describe('deleteExerciseRecordSet', () => {
        it('removes the set row from the active session record', () => {
            const { gymSessionService } = context.testDb.dbServices;
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Delete Pull Up',
                    availability: 'both',
                }),
            );
            seedGymSession(context.testDb, {
                id: 'active-session',
                startedAtMs: FIXED_NOW_MS - 1_000,
                status: 'active',
            });
            seedGymExerciseRecord(context.testDb, {
                id: 'active-record',
                gymSessionId: 'active-session',
                exerciseDefinitionId: definition.id,
                sortIndex: 0,
            });
            seedGymExerciseRecordSet(context.testDb, {
                id: 'active-set',
                gymExerciseRecordId: 'active-record',
                setIndex: 0,
                reps: 8,
            });

            gymSessionService.deleteExerciseRecordSet('active-set');

            const deleted = context.testDb.db
                .select()
                .from(gymExerciseRecordSetsTable)
                .where(eq(gymExerciseRecordSetsTable.id, 'active-set'))
                .get();

            expect(deleted).toBeUndefined();
        });

        it('rejects deleting a missing set', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expectGymErrorCode(
                () => {
                    gymSessionService.deleteExerciseRecordSet('missing-set');
                },
                'EXERCISE_SET_NOT_FOUND',
            );
        });
    });
});
