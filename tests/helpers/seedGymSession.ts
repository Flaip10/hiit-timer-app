import type { GymSessionStatus } from '@src/core/entities/gym.interfaces';
import {
    gymExerciseRecordsTable,
    gymExerciseRecordSetsTable,
    gymSessionsTable,
} from '@src/db/schema';

import type { TestDb } from './createTestDb';

export interface SeedGymSessionInput {
    createdAtMs?: number;
    endedAtMs?: number;
    id: string;
    notes?: string;
    sourceGymPlanId?: string;
    startedAtMs: number;
    status: GymSessionStatus;
    updatedAtMs?: number;
}

export interface SeedGymExerciseRecordInput {
    completedAtMs?: number;
    createdAtMs?: number;
    exerciseDefinitionId: string;
    gymSessionId: string;
    id: string;
    notes?: string;
    sortIndex: number;
    sourceGymPlanExerciseId?: string;
    startedAtMs?: number;
    updatedAtMs?: number;
}

export interface SeedGymExerciseRecordSetInput {
    completedAtMs?: number;
    createdAtMs?: number;
    distanceMeters?: number;
    durationSec?: number;
    gymExerciseRecordId: string;
    id: string;
    isWarmup?: boolean;
    notes?: string;
    reps?: number;
    rpeTenths?: number;
    setIndex: number;
    updatedAtMs?: number;
    weightGrams?: number;
}

const DEFAULT_CREATED_AT_MS = 1_800_000_000_000;

export const seedGymSession = (
    testDb: TestDb,
    input: SeedGymSessionInput,
): void => {
    const createdAtMs = input.createdAtMs ?? DEFAULT_CREATED_AT_MS;

    testDb.db
        .insert(gymSessionsTable)
        .values({
            createdAtMs,
            endedAtMs: input.endedAtMs ?? null,
            id: input.id,
            notes: input.notes ?? null,
            sourceGymPlanId: input.sourceGymPlanId ?? null,
            startedAtMs: input.startedAtMs,
            status: input.status,
            updatedAtMs: input.updatedAtMs ?? createdAtMs,
        })
        .run();
};

export const seedGymExerciseRecord = (
    testDb: TestDb,
    input: SeedGymExerciseRecordInput,
): void => {
    const createdAtMs = input.createdAtMs ?? DEFAULT_CREATED_AT_MS;

    testDb.db
        .insert(gymExerciseRecordsTable)
        .values({
            completedAtMs: input.completedAtMs ?? null,
            createdAtMs,
            exerciseDefinitionId: input.exerciseDefinitionId,
            gymSessionId: input.gymSessionId,
            id: input.id,
            notes: input.notes ?? null,
            sortIndex: input.sortIndex,
            sourceGymPlanExerciseId: input.sourceGymPlanExerciseId ?? null,
            startedAtMs: input.startedAtMs ?? null,
            updatedAtMs: input.updatedAtMs ?? createdAtMs,
        })
        .run();
};

export const seedGymExerciseRecordSet = (
    testDb: TestDb,
    input: SeedGymExerciseRecordSetInput,
): void => {
    const createdAtMs = input.createdAtMs ?? DEFAULT_CREATED_AT_MS;

    testDb.db
        .insert(gymExerciseRecordSetsTable)
        .values({
            completedAtMs: input.completedAtMs ?? null,
            createdAtMs,
            distanceMeters: input.distanceMeters ?? null,
            durationSec: input.durationSec ?? null,
            gymExerciseRecordId: input.gymExerciseRecordId,
            id: input.id,
            isWarmup: input.isWarmup ?? false,
            notes: input.notes ?? null,
            reps: input.reps ?? null,
            rpeTenths: input.rpeTenths ?? null,
            setIndex: input.setIndex,
            updatedAtMs: input.updatedAtMs ?? createdAtMs,
            weightGrams: input.weightGrams ?? null,
        })
        .run();
};
