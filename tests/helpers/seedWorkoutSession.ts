import type { WorkoutSession } from '@src/core/entities/workoutSession.interfaces';
import { eq } from 'drizzle-orm';
import {
    workoutBlocksTable,
    workoutExercisesTable,
    workoutSessionsTable,
    workoutVersionsTable,
} from '@src/db/schema';

import { createExerciseDefinitionFixture } from '../fixtures/exerciseDefinitions';

import type { TestDb } from './createTestDb';
import { seedExerciseDefinition } from './seedExerciseDefinition';

export interface SeedWorkoutSessionResult {
    versionId: string;
}

const seedSessionWorkoutVersion = (
    testDb: TestDb,
    session: WorkoutSession,
): SeedWorkoutSessionResult => {
    const workout = session.workoutSnapshot;
    const versionId = session.workoutVersionId;
    const existingVersion = testDb.db
        .select({ id: workoutVersionsTable.id })
        .from(workoutVersionsTable)
        .where(eq(workoutVersionsTable.id, versionId))
        .get();

    if (existingVersion) return { versionId };

    testDb.db
        .insert(workoutVersionsTable)
        .values({
            id: versionId,
            name: workout.name,
            updatedAtMs: workout.updatedAtMs,
        })
        .run();

    workout.blocks.forEach((block, blockIndex) => {
        testDb.db
            .insert(workoutBlocksTable)
            .values({
                id: block.id,
                workoutVersionId: versionId,
                sortIndex: blockIndex,
                title: block.title ?? null,
                sets: block.sets,
                restBetweenSetsSec: block.restBetweenSetsSec,
                restBetweenExercisesSec: block.restBetweenExercisesSec,
            })
            .run();

        block.exercises.forEach((exercise, exerciseIndex) => {
            testDb.db
                .insert(workoutExercisesTable)
                .values({
                    id: exercise.id,
                    blockId: block.id,
                    sortIndex: exerciseIndex,
                    exerciseDefinitionId: exercise.name
                        ? seedExerciseDefinition(
                              testDb,
                              createExerciseDefinitionFixture({
                                  name: exercise.name,
                              }),
                          ).id
                        : exercise.exerciseDefinitionId ?? null,
                    mode: exercise.mode,
                    value: exercise.value,
                    tempo: exercise.tempo ?? null,
                })
                .run();
        });
    });

    return { versionId };
};

export const seedWorkoutSession = (
    testDb: TestDb,
    session: WorkoutSession,
): SeedWorkoutSessionResult => {
    const result = seedSessionWorkoutVersion(testDb, session);

    testDb.db
        .insert(workoutSessionsTable)
        .values({
            id: session.id,
            startedAtMs: session.startedAtMs,
            endedAtMs: session.endedAtMs,
            workoutVersionId: result.versionId,
            totalDurationSec: session.totalDurationSec ?? null,
            statsJson: session.stats ? JSON.stringify(session.stats) : null,
        })
        .run();

    return result;
};
