import { asc, desc, eq } from 'drizzle-orm';

import type {
    GymExerciseRecord,
    GymExerciseRecordSet,
} from '@src/core/entities/gym.interfaces';

import {
    gymExerciseRecordsTable,
    gymExerciseRecordSetsTable,
} from '../../schema';
import type { RepositoryDb } from '../workouts/workoutRepositoryFactory';

export type GymExerciseRecordRow =
    typeof gymExerciseRecordsTable.$inferSelect;
export type GymExerciseRecordSetRow =
    typeof gymExerciseRecordSetsTable.$inferSelect;
type GymExerciseRecordInsert = typeof gymExerciseRecordsTable.$inferInsert;
type GymExerciseRecordSetInsert =
    typeof gymExerciseRecordSetsTable.$inferInsert;

export interface PersistedGymExerciseRecord
    extends Omit<GymExerciseRecord, 'sets'> {
    gymSessionId: string;
    sets: PersistedGymExerciseRecordSet[];
}

export interface PersistedGymExerciseRecordSet
    extends GymExerciseRecordSet {
    gymExerciseRecordId: string;
}

export interface InsertGymExerciseRecordInput
    extends GymExerciseRecordInsert {}

export interface UpdateGymExerciseRecordInput
    extends Pick<GymExerciseRecordRow, 'id' | 'updatedAtMs'>,
        Partial<
            Pick<
                GymExerciseRecordRow,
                'completedAtMs' | 'notes' | 'sortIndex' | 'startedAtMs'
            >
        > {}

export interface InsertGymExerciseRecordSetInput
    extends GymExerciseRecordSetInsert {}

export interface UpdateGymExerciseRecordSetInput
    extends Pick<GymExerciseRecordSetRow, 'id' | 'updatedAtMs'>,
        Partial<
            Pick<
                GymExerciseRecordSetRow,
                | 'completedAtMs'
                | 'distanceMeters'
                | 'durationSec'
                | 'isWarmup'
                | 'notes'
                | 'reps'
                | 'rpeTenths'
                | 'setIndex'
                | 'weightGrams'
            >
        > {}

export interface GymExerciseRecordRepository {
    getById: (id: string) => PersistedGymExerciseRecord | null;
    getBySessionId: (sessionId: string) => PersistedGymExerciseRecord[];
    getNextRecordSortIndex: (sessionId: string) => number;
    getNextSetIndex: (recordId: string) => number;
    getSetById: (id: string) => PersistedGymExerciseRecordSet | null;
    insertRecord: (input: InsertGymExerciseRecordInput) => void;
    insertSet: (input: InsertGymExerciseRecordSetInput) => void;
    updateRecord: (input: UpdateGymExerciseRecordInput) => void;
    updateSet: (input: UpdateGymExerciseRecordSetInput) => void;
    deleteRecord: (id: string) => void;
    deleteSet: (id: string) => void;
}

export interface CreateGymExerciseRecordRepositoryArgs {
    db: RepositoryDb;
}

const assertNonEmptyId = (id: string, fieldName: string): void => {
    if (id.trim().length === 0) {
        throw new Error(`${fieldName} cannot be blank`);
    }
};

const assertFiniteTimestamp = (value: number, fieldName: string): void => {
    if (!Number.isFinite(value)) {
        throw new Error(`${fieldName} must be finite`);
    }
};

const assertOptionalFiniteTimestamp = (
    value: number | null | undefined,
    fieldName: string,
): void => {
    if (value !== undefined && value !== null) {
        assertFiniteTimestamp(value, fieldName);
    }
};

const assertIntegerAtLeast = (
    value: number,
    minimum: number,
    fieldName: string,
): void => {
    if (!Number.isInteger(value) || value < minimum) {
        throw new Error(`${fieldName} must be an integer >= ${minimum}`);
    }
};

const assertOptionalIntegerAtLeast = (
    value: number | null | undefined,
    minimum: number,
    fieldName: string,
): void => {
    if (value !== undefined && value !== null) {
        assertIntegerAtLeast(value, minimum, fieldName);
    }
};

const assertOptionalIntegerBetween = (
    value: number | null | undefined,
    minimum: number,
    maximum: number,
    fieldName: string,
): void => {
    if (
        value !== undefined &&
        value !== null &&
        (!Number.isInteger(value) || value < minimum || value > maximum)
    ) {
        throw new Error(
            `${fieldName} must be an integer between ${minimum} and ${maximum}`,
        );
    }
};

const assertRecordInput = (input: InsertGymExerciseRecordInput): void => {
    assertNonEmptyId(input.id, 'Gym exercise record ID');
    assertNonEmptyId(input.gymSessionId, 'Gym session ID');
    assertNonEmptyId(input.exerciseDefinitionId, 'Exercise definition ID');
    assertOptionalFiniteTimestamp(input.startedAtMs, 'startedAtMs');
    assertOptionalFiniteTimestamp(input.completedAtMs, 'completedAtMs');
    assertFiniteTimestamp(input.createdAtMs, 'createdAtMs');
    assertFiniteTimestamp(input.updatedAtMs, 'updatedAtMs');
    assertIntegerAtLeast(input.sortIndex, 0, 'sortIndex');
};

const assertSetValues = (
    input: Pick<
        InsertGymExerciseRecordSetInput,
        | 'distanceMeters'
        | 'durationSec'
        | 'reps'
        | 'rpeTenths'
        | 'setIndex'
        | 'weightGrams'
    >,
): void => {
    assertIntegerAtLeast(input.setIndex, 0, 'setIndex');
    assertOptionalIntegerAtLeast(input.reps, 1, 'reps');
    assertOptionalIntegerAtLeast(input.weightGrams, 0, 'weightGrams');
    assertOptionalIntegerAtLeast(input.durationSec, 1, 'durationSec');
    assertOptionalIntegerAtLeast(input.distanceMeters, 1, 'distanceMeters');
    assertOptionalIntegerBetween(input.rpeTenths, 0, 100, 'rpeTenths');
};

const gymExerciseRecordSetFromRow = (
    row: GymExerciseRecordSetRow,
): PersistedGymExerciseRecordSet => ({
    id: row.id,
    gymExerciseRecordId: row.gymExerciseRecordId,
    setIndex: row.setIndex,
    reps: row.reps ?? undefined,
    weightGrams: row.weightGrams ?? undefined,
    durationSec: row.durationSec ?? undefined,
    distanceMeters: row.distanceMeters ?? undefined,
    rpeTenths: row.rpeTenths ?? undefined,
    isWarmup: row.isWarmup,
    completedAtMs: row.completedAtMs ?? undefined,
    notes: row.notes ?? undefined,
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
});

const gymExerciseRecordFromRow = (
    row: GymExerciseRecordRow,
    sets: PersistedGymExerciseRecordSet[],
): PersistedGymExerciseRecord => ({
    id: row.id,
    gymSessionId: row.gymSessionId,
    exerciseDefinitionId: row.exerciseDefinitionId,
    sourceGymPlanExerciseId: row.sourceGymPlanExerciseId ?? undefined,
    sortIndex: row.sortIndex,
    startedAtMs: row.startedAtMs ?? undefined,
    completedAtMs: row.completedAtMs ?? undefined,
    notes: row.notes ?? undefined,
    sets,
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
});

export const createGymExerciseRecordRepository = ({
    db,
}: CreateGymExerciseRecordRepositoryArgs): GymExerciseRecordRepository => {
    const getSetsByRecordId = (
        recordId: string,
    ): PersistedGymExerciseRecordSet[] =>
        db
            .select()
            .from(gymExerciseRecordSetsTable)
            .where(eq(gymExerciseRecordSetsTable.gymExerciseRecordId, recordId))
            .orderBy(asc(gymExerciseRecordSetsTable.setIndex))
            .all()
            .map(gymExerciseRecordSetFromRow);

    return {
        getById: (id: string): PersistedGymExerciseRecord | null => {
            assertNonEmptyId(id, 'Gym exercise record ID');

            const row = db
                .select()
                .from(gymExerciseRecordsTable)
                .where(eq(gymExerciseRecordsTable.id, id))
                .get();

            return row
                ? gymExerciseRecordFromRow(row, getSetsByRecordId(row.id))
                : null;
        },

        getBySessionId: (sessionId: string): PersistedGymExerciseRecord[] => {
            assertNonEmptyId(sessionId, 'Gym session ID');

            return db
                .select()
                .from(gymExerciseRecordsTable)
                .where(eq(gymExerciseRecordsTable.gymSessionId, sessionId))
                .orderBy(asc(gymExerciseRecordsTable.sortIndex))
                .all()
                .map((row) =>
                    gymExerciseRecordFromRow(row, getSetsByRecordId(row.id)),
                );
        },

        getNextRecordSortIndex: (sessionId: string): number => {
            assertNonEmptyId(sessionId, 'Gym session ID');

            const row = db
                .select({ sortIndex: gymExerciseRecordsTable.sortIndex })
                .from(gymExerciseRecordsTable)
                .where(eq(gymExerciseRecordsTable.gymSessionId, sessionId))
                .orderBy(desc(gymExerciseRecordsTable.sortIndex))
                .limit(1)
                .get();

            return row ? row.sortIndex + 1 : 0;
        },

        getNextSetIndex: (recordId: string): number => {
            assertNonEmptyId(recordId, 'Gym exercise record ID');

            const row = db
                .select({ setIndex: gymExerciseRecordSetsTable.setIndex })
                .from(gymExerciseRecordSetsTable)
                .where(eq(gymExerciseRecordSetsTable.gymExerciseRecordId, recordId))
                .orderBy(desc(gymExerciseRecordSetsTable.setIndex))
                .limit(1)
                .get();

            return row ? row.setIndex + 1 : 0;
        },

        getSetById: (id: string): PersistedGymExerciseRecordSet | null => {
            assertNonEmptyId(id, 'Gym exercise record set ID');

            const row = db
                .select()
                .from(gymExerciseRecordSetsTable)
                .where(eq(gymExerciseRecordSetsTable.id, id))
                .get();

            return row ? gymExerciseRecordSetFromRow(row) : null;
        },

        insertRecord: (input: InsertGymExerciseRecordInput): void => {
            assertRecordInput(input);

            db.insert(gymExerciseRecordsTable)
                .values({
                    completedAtMs: input.completedAtMs ?? null,
                    createdAtMs: input.createdAtMs,
                    exerciseDefinitionId: input.exerciseDefinitionId,
                    gymSessionId: input.gymSessionId,
                    id: input.id,
                    notes: input.notes ?? null,
                    sortIndex: input.sortIndex,
                    sourceGymPlanExerciseId:
                        input.sourceGymPlanExerciseId ?? null,
                    startedAtMs: input.startedAtMs ?? null,
                    updatedAtMs: input.updatedAtMs,
                })
                .run();
        },

        insertSet: (input: InsertGymExerciseRecordSetInput): void => {
            assertNonEmptyId(input.id, 'Gym exercise record set ID');
            assertNonEmptyId(input.gymExerciseRecordId, 'Gym exercise record ID');
            assertOptionalFiniteTimestamp(input.completedAtMs, 'completedAtMs');
            assertFiniteTimestamp(input.createdAtMs, 'createdAtMs');
            assertFiniteTimestamp(input.updatedAtMs, 'updatedAtMs');
            assertSetValues(input);

            db.insert(gymExerciseRecordSetsTable)
                .values({
                    completedAtMs: input.completedAtMs ?? null,
                    createdAtMs: input.createdAtMs,
                    distanceMeters: input.distanceMeters ?? null,
                    durationSec: input.durationSec ?? null,
                    gymExerciseRecordId: input.gymExerciseRecordId,
                    id: input.id,
                    isWarmup: input.isWarmup,
                    notes: input.notes ?? null,
                    reps: input.reps ?? null,
                    rpeTenths: input.rpeTenths ?? null,
                    setIndex: input.setIndex,
                    updatedAtMs: input.updatedAtMs,
                    weightGrams: input.weightGrams ?? null,
                })
                .run();
        },

        updateRecord: (input: UpdateGymExerciseRecordInput): void => {
            assertNonEmptyId(input.id, 'Gym exercise record ID');
            assertOptionalFiniteTimestamp(input.startedAtMs, 'startedAtMs');
            assertOptionalFiniteTimestamp(input.completedAtMs, 'completedAtMs');
            assertFiniteTimestamp(input.updatedAtMs, 'updatedAtMs');
            assertOptionalIntegerAtLeast(input.sortIndex, 0, 'sortIndex');

            db.update(gymExerciseRecordsTable)
                .set({
                    completedAtMs: input.completedAtMs,
                    notes: input.notes,
                    sortIndex: input.sortIndex,
                    startedAtMs: input.startedAtMs,
                    updatedAtMs: input.updatedAtMs,
                })
                .where(eq(gymExerciseRecordsTable.id, input.id))
                .run();
        },

        updateSet: (input: UpdateGymExerciseRecordSetInput): void => {
            assertNonEmptyId(input.id, 'Gym exercise record set ID');
            assertOptionalFiniteTimestamp(input.completedAtMs, 'completedAtMs');
            assertFiniteTimestamp(input.updatedAtMs, 'updatedAtMs');
            assertOptionalIntegerAtLeast(input.setIndex, 0, 'setIndex');
            assertOptionalIntegerAtLeast(input.reps, 1, 'reps');
            assertOptionalIntegerAtLeast(input.weightGrams, 0, 'weightGrams');
            assertOptionalIntegerAtLeast(input.durationSec, 1, 'durationSec');
            assertOptionalIntegerAtLeast(input.distanceMeters, 1, 'distanceMeters');
            assertOptionalIntegerBetween(input.rpeTenths, 0, 100, 'rpeTenths');

            db.update(gymExerciseRecordSetsTable)
                .set({
                    completedAtMs: input.completedAtMs,
                    distanceMeters: input.distanceMeters,
                    durationSec: input.durationSec,
                    isWarmup: input.isWarmup,
                    notes: input.notes,
                    reps: input.reps,
                    rpeTenths: input.rpeTenths,
                    setIndex: input.setIndex,
                    updatedAtMs: input.updatedAtMs,
                    weightGrams: input.weightGrams,
                })
                .where(eq(gymExerciseRecordSetsTable.id, input.id))
                .run();
        },

        deleteRecord: (id: string): void => {
            assertNonEmptyId(id, 'Gym exercise record ID');

            db.delete(gymExerciseRecordsTable)
                .where(eq(gymExerciseRecordsTable.id, id))
                .run();
        },

        deleteSet: (id: string): void => {
            assertNonEmptyId(id, 'Gym exercise record set ID');

            db.delete(gymExerciseRecordSetsTable)
                .where(eq(gymExerciseRecordSetsTable.id, id))
                .run();
        },
    };
};
