import { asc, desc, eq, inArray } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import type { Workout } from '@src/core/entities/entities';
import { uid } from '@src/core/id';

import {
    workoutBlocksTable,
    workoutExercisesTable,
    workoutSessionsTable,
    workoutVersionsTable,
    workoutsTable,
} from '../schema';
import type * as schema from '../schema';
import { hasSameWorkoutContent } from '../mappers/workoutContent';
import {
    groupExercisesByBlockId,
    workoutFromDbRows,
    workoutToVersionDbRows,
    workoutsFromDbRows,
    type WorkoutExerciseRow,
} from '../mappers/workoutMapper';

export interface Clock {
    now: () => number;
}

export interface WorkoutRepository {
    getAll: () => Workout[];
    getById: (id: string) => Workout | null;
    getCurrentVersionId: (id: string) => string | null;
    remove: (id: string) => void;
    readExistingIds: (ids: string[]) => Set<string>;
    relinkSessionsForVersion: (args: {
        workoutId: string;
        workoutVersionId: string;
    }) => void;
    upsert: (workout: Workout, sortIndex: number) => void;
    upsertRestoredWorkout: (args: {
        workout: Workout;
        sortIndex: number;
        sourceWorkoutVersionId: string;
    }) => void;
}

export interface WorkoutRepositoryApi {
    createWorkoutVersion: (
        workout: Workout,
        workoutId: string | null,
    ) => string;
    deleteWorkoutVersionIfOrphan: (versionId: string) => void;
    getWorkoutByVersionId: (
        versionId: string,
        args?: { workoutId?: string; isFavorite?: boolean },
    ) => Workout | null;
    insertWorkoutVersion: (
        workout: Workout,
        versionId: string,
        workoutId: string | null,
    ) => void;
    workoutRepository: WorkoutRepository;
}

export type RepositoryDb = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export interface CreateWorkoutRepositoryArgs {
    clock?: Clock;
    db: RepositoryDb;
}

const systemClock: Clock = {
    now: () => Date.now(),
};

export const createWorkoutRepository = (
    factoryArgs: CreateWorkoutRepositoryArgs,
): WorkoutRepositoryApi => {
    const repositoryDb = factoryArgs.db;
    const clock = factoryArgs.clock ?? systemClock;

    const getExercisesForBlocks = (blockIds: string[]): WorkoutExerciseRow[] =>
        blockIds.length > 0
            ? repositoryDb
                  .select()
                  .from(workoutExercisesTable)
                  .where(inArray(workoutExercisesTable.blockId, blockIds))
                  .orderBy(asc(workoutExercisesTable.sortIndex))
                  .all()
            : [];

    const insertWorkoutVersion = (
        workout: Workout,
        versionId: string,
        workoutId: string | null,
    ): void => {
        const rows = workoutToVersionDbRows(workout, versionId, workoutId);

        repositoryDb.insert(workoutVersionsTable).values(rows.version).run();

        if (rows.blocks.length > 0) {
            repositoryDb.insert(workoutBlocksTable).values(rows.blocks).run();
        }

        if (rows.exercises.length > 0) {
            repositoryDb
                .insert(workoutExercisesTable)
                .values(rows.exercises)
                .run();
        }
    };

    const deleteWorkoutVersion = (versionId: string): void => {
        const blocks = repositoryDb
            .select()
            .from(workoutBlocksTable)
            .where(eq(workoutBlocksTable.workoutVersionId, versionId))
            .all();

        const blockIds = blocks.map((block) => block.id);
        if (blockIds.length > 0) {
            repositoryDb
                .delete(workoutExercisesTable)
                .where(inArray(workoutExercisesTable.blockId, blockIds))
                .run();
        }

        repositoryDb
            .delete(workoutBlocksTable)
            .where(eq(workoutBlocksTable.workoutVersionId, versionId))
            .run();
        repositoryDb
            .delete(workoutVersionsTable)
            .where(eq(workoutVersionsTable.id, versionId))
            .run();
    };

    const deleteWorkoutVersionIfOrphan = (versionId: string): void => {
        const activeWorkout = repositoryDb
            .select({ id: workoutsTable.id })
            .from(workoutsTable)
            .where(eq(workoutsTable.currentVersionId, versionId))
            .get();
        if (activeWorkout) return;

        const session = repositoryDb
            .select({ id: workoutSessionsTable.id })
            .from(workoutSessionsTable)
            .where(eq(workoutSessionsTable.workoutVersionId, versionId))
            .get();
        if (session) return;

        deleteWorkoutVersion(versionId);
    };

    const getWorkoutByVersionId = (
        versionId: string,
        options?: { workoutId?: string; isFavorite?: boolean },
    ): Workout | null => {
        const version = repositoryDb
            .select()
            .from(workoutVersionsTable)
            .where(eq(workoutVersionsTable.id, versionId))
            .get();
        if (!version) return null;

        const blocks = repositoryDb
            .select()
            .from(workoutBlocksTable)
            .where(eq(workoutBlocksTable.workoutVersionId, versionId))
            .orderBy(asc(workoutBlocksTable.sortIndex))
            .all();

        const exercises = getExercisesForBlocks(
            blocks.map((block) => block.id),
        );
        const exercisesByBlockId = groupExercisesByBlockId(exercises);

        return workoutFromDbRows(version, blocks, exercisesByBlockId, options);
    };

    const createWorkoutVersion = (
        workout: Workout,
        workoutId: string | null,
    ): string => {
        const versionId = uid();
        insertWorkoutVersion(workout, versionId, workoutId);
        return versionId;
    };

    const workoutRepository: WorkoutRepository = {
        getAll: (): Workout[] => {
            const rows = repositoryDb
                .select()
                .from(workoutsTable)
                .innerJoin(
                    workoutVersionsTable,
                    eq(workoutsTable.currentVersionId, workoutVersionsTable.id),
                )
                .orderBy(
                    desc(workoutsTable.isFavorite),
                    desc(workoutVersionsTable.updatedAtMs),
                )
                .all();

            if (rows.length === 0) {
                return [];
            }

            const versionIds = rows.map((row) => row.workout_versions.id);
            const blockRows = repositoryDb
                .select()
                .from(workoutBlocksTable)
                .where(inArray(workoutBlocksTable.workoutVersionId, versionIds))
                .orderBy(asc(workoutBlocksTable.sortIndex))
                .all();

            const exerciseRows = getExercisesForBlocks(
                blockRows.map((block) => block.id),
            );

            return workoutsFromDbRows(rows, blockRows, exerciseRows);
        },

        getById: (id: string): Workout | null => {
            const row = repositoryDb
                .select()
                .from(workoutsTable)
                .innerJoin(
                    workoutVersionsTable,
                    eq(workoutsTable.currentVersionId, workoutVersionsTable.id),
                )
                .where(eq(workoutsTable.id, id))
                .get();

            if (!row) return null;

            const blocks = repositoryDb
                .select()
                .from(workoutBlocksTable)
                .where(
                    eq(
                        workoutBlocksTable.workoutVersionId,
                        row.workout_versions.id,
                    ),
                )
                .orderBy(asc(workoutBlocksTable.sortIndex))
                .all();

            const exercises = getExercisesForBlocks(
                blocks.map((block) => block.id),
            );
            const exercisesByBlockId = groupExercisesByBlockId(exercises);

            return workoutFromDbRows(
                row.workout_versions,
                blocks,
                exercisesByBlockId,
                {
                    workoutId: row.workouts.id,
                    isFavorite: row.workouts.isFavorite,
                },
            );
        },

        getCurrentVersionId: (id: string): string | null => {
            const workout = repositoryDb
                .select({ currentVersionId: workoutsTable.currentVersionId })
                .from(workoutsTable)
                .where(eq(workoutsTable.id, id))
                .get();

            return workout?.currentVersionId ?? null;
        },

        remove: (id: string): void => {
            const workout = repositoryDb
                .select({ currentVersionId: workoutsTable.currentVersionId })
                .from(workoutsTable)
                .where(eq(workoutsTable.id, id))
                .get();

            repositoryDb.transaction(() => {
                repositoryDb
                    .update(workoutVersionsTable)
                    .set({ workoutId: null })
                    .where(eq(workoutVersionsTable.workoutId, id))
                    .run();
                repositoryDb
                    .update(workoutSessionsTable)
                    .set({ workoutId: null })
                    .where(eq(workoutSessionsTable.workoutId, id))
                    .run();
                repositoryDb
                    .delete(workoutsTable)
                    .where(eq(workoutsTable.id, id))
                    .run();
            });

            if (workout) {
                deleteWorkoutVersionIfOrphan(workout.currentVersionId);
            }
        },

        readExistingIds: (ids: string[]): Set<string> => {
            if (ids.length === 0) return new Set<string>();

            const rows = repositoryDb
                .select({ id: workoutsTable.id })
                .from(workoutsTable)
                .where(inArray(workoutsTable.id, ids))
                .all();

            return new Set(rows.map((row) => row.id));
        },

        relinkSessionsForVersion: (relinkArgs: {
            workoutId: string;
            workoutVersionId: string;
        }): void => {
            repositoryDb
                .update(workoutSessionsTable)
                .set({ workoutId: relinkArgs.workoutId })
                .where(
                    eq(
                        workoutSessionsTable.workoutVersionId,
                        relinkArgs.workoutVersionId,
                    ),
                )
                .run();
            repositoryDb
                .update(workoutVersionsTable)
                .set({ workoutId: relinkArgs.workoutId })
                .where(eq(workoutVersionsTable.id, relinkArgs.workoutVersionId))
                .run();
        },

        upsert: (workout: Workout, sortIndex: number): void => {
            const existingWorkout = repositoryDb
                .select()
                .from(workoutsTable)
                .where(eq(workoutsTable.id, workout.id))
                .get();

            if (!existingWorkout) {
                const versionId = uid();

                repositoryDb.transaction(() => {
                    repositoryDb
                        .insert(workoutsTable)
                        .values({
                            id: workout.id,
                            currentVersionId: versionId,
                            createdAtMs: workout.updatedAtMs,
                            isFavorite: workout.isFavorite === true,
                            sortIndex,
                        })
                        .run();
                    insertWorkoutVersion(workout, versionId, workout.id);
                });
                return;
            }

            const currentWorkout = getWorkoutByVersionId(
                existingWorkout.currentVersionId,
                {
                    workoutId: workout.id,
                    isFavorite: existingWorkout.isFavorite,
                },
            );
            const shouldCreateVersion =
                currentWorkout === null ||
                !hasSameWorkoutContent(currentWorkout, workout);
            const nextVersionId = shouldCreateVersion
                ? uid()
                : existingWorkout.currentVersionId;
            const previousVersionId = existingWorkout.currentVersionId;

            repositoryDb.transaction(() => {
                if (shouldCreateVersion) {
                    insertWorkoutVersion(workout, nextVersionId, workout.id);
                }

                repositoryDb
                    .update(workoutsTable)
                    .set({
                        currentVersionId: nextVersionId,
                        createdAtMs: existingWorkout.createdAtMs,
                        isFavorite: workout.isFavorite === true,
                        sortIndex,
                    })
                    .where(eq(workoutsTable.id, workout.id))
                    .run();
            });

            if (shouldCreateVersion) {
                deleteWorkoutVersionIfOrphan(previousVersionId);
            }
        },

        upsertRestoredWorkout: (restoreArgs: {
            workout: Workout;
            sortIndex: number;
            sourceWorkoutVersionId: string;
        }): void => {
            const sourceVersionWorkout = getWorkoutByVersionId(
                restoreArgs.sourceWorkoutVersionId,
            );
            const shouldReuseSourceVersion =
                sourceVersionWorkout !== null &&
                hasSameWorkoutContent(
                    sourceVersionWorkout,
                    restoreArgs.workout,
                );

            if (!shouldReuseSourceVersion) {
                workoutRepository.upsert(
                    restoreArgs.workout,
                    restoreArgs.sortIndex,
                );
                return;
            }

            const existingWorkout = repositoryDb
                .select({ id: workoutsTable.id })
                .from(workoutsTable)
                .where(eq(workoutsTable.id, restoreArgs.workout.id))
                .get();

            if (existingWorkout) {
                throw new Error(
                    `Cannot restore workout ${restoreArgs.workout.id}: already exists`,
                );
            }

            const sourceVersion = repositoryDb
                .select({ workoutId: workoutVersionsTable.workoutId })
                .from(workoutVersionsTable)
                .where(eq(workoutVersionsTable.id, restoreArgs.sourceWorkoutVersionId))
                .get();

            if (sourceVersion?.workoutId) {
                throw new Error(
                    `Cannot restore workout ${restoreArgs.workout.id}: source version already belongs to workout ${sourceVersion.workoutId}`,
                );
            }

            repositoryDb.transaction(() => {
                repositoryDb
                    .insert(workoutsTable)
                    .values({
                        id: restoreArgs.workout.id,
                        currentVersionId: restoreArgs.sourceWorkoutVersionId,
                        createdAtMs: clock.now(),
                        isFavorite: restoreArgs.workout.isFavorite === true,
                        sortIndex: restoreArgs.sortIndex,
                    })
                    .run();

                workoutRepository.relinkSessionsForVersion({
                    workoutId: restoreArgs.workout.id,
                    workoutVersionId: restoreArgs.sourceWorkoutVersionId,
                });
            });
        },
    };

    return {
        createWorkoutVersion,
        deleteWorkoutVersionIfOrphan,
        getWorkoutByVersionId,
        insertWorkoutVersion,
        workoutRepository,
    };
};
