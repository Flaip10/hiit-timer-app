import { asc, desc, eq, inArray } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import type { Workout } from '@src/core/entities/entities';
import { uid } from '@src/core/id';

import {
    workoutBlocksTable,
    exerciseDefinitionsTable,
    workoutExercisesTable,
    workoutVersionsTable,
    workoutsTable,
} from '../../schema';
import type * as schema from '../../schema';
import {
    groupExercisesByBlockId,
    workoutFromDbRows,
    workoutToVersionDbRows,
    workoutsFromDbRows,
    type WorkoutExerciseRow,
} from '../../mappers/workouts/workoutMapper';

export type WorkoutRow = typeof workoutsTable.$inferSelect;
export type WorkoutVersionRow = typeof workoutVersionsTable.$inferSelect;

export type InsertWorkoutInput = typeof workoutsTable.$inferInsert;

export interface UpdateWorkoutInput {
    currentVersionId: string;
    id: string;
    isFavorite: boolean;
    sortIndex: number;
}

export interface RelinkWorkoutVersionInput {
    workoutId: string;
    workoutVersionId: string;
}

export interface WorkoutRepository {
    getAll: () => Workout[];
    getById: (id: string) => Workout | null;
    getCurrentVersionId: (id: string) => string | null;
    getWorkoutByVersionId: (versionId: string) => Workout | null;
    getWorkoutRow: (id: string) => WorkoutRow | null;
    getWorkoutVersionRow: (versionId: string) => WorkoutVersionRow | null;
    hasWorkoutForVersion: (versionId: string) => boolean;
    readExistingIds: (ids: string[]) => Set<string>;
    insertWorkout: (input: InsertWorkoutInput) => void;
    insertWorkoutVersion: (
        workoutSnapshot: Workout,
        versionId: string,
        workoutId: string | null,
    ) => void;
    createWorkoutVersion: (
        workoutSnapshot: Workout,
        workoutId: string | null,
    ) => string;
    updateWorkout: (input: UpdateWorkoutInput) => void;
    relinkWorkoutVersion: (args: RelinkWorkoutVersionInput) => void;
    deleteWorkout: (id: string) => void;
    deleteWorkoutVersion: (versionId: string) => void;
}

export type RepositoryDb = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export interface CreateWorkoutRepositoryArgs {
    db: RepositoryDb;
}

export const createWorkoutRepository = (
    factoryArgs: CreateWorkoutRepositoryArgs,
): WorkoutRepository => {
    const repositoryDb = factoryArgs.db;

    const getExercisesForBlocks = (blockIds: string[]): WorkoutExerciseRow[] =>
        blockIds.length > 0
            ? repositoryDb
                  .select({
                      id: workoutExercisesTable.id,
                      blockId: workoutExercisesTable.blockId,
                      sortIndex: workoutExercisesTable.sortIndex,
                      name: workoutExercisesTable.name,
                      exerciseDefinitionId:
                          workoutExercisesTable.exerciseDefinitionId,
                      exerciseDefinitionName: exerciseDefinitionsTable.name,
                      mode: workoutExercisesTable.mode,
                      value: workoutExercisesTable.value,
                      tempo: workoutExercisesTable.tempo,
                  })
                  .from(workoutExercisesTable)
                  .leftJoin(
                      exerciseDefinitionsTable,
                      eq(
                          workoutExercisesTable.exerciseDefinitionId,
                          exerciseDefinitionsTable.id,
                      ),
                  )
                  .where(inArray(workoutExercisesTable.blockId, blockIds))
                  .orderBy(asc(workoutExercisesTable.sortIndex))
                  .all()
            : [];

    const repository: WorkoutRepository = {
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

        getWorkoutByVersionId: (versionId: string): Workout | null => {
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

            return workoutFromDbRows(version, blocks, exercisesByBlockId);
        },

        getWorkoutRow: (id: string): WorkoutRow | null => {
            const row = repositoryDb
                .select()
                .from(workoutsTable)
                .where(eq(workoutsTable.id, id))
                .get();

            return row ?? null;
        },

        getWorkoutVersionRow: (
            versionId: string,
        ): WorkoutVersionRow | null => {
            const version = repositoryDb
                .select()
                .from(workoutVersionsTable)
                .where(eq(workoutVersionsTable.id, versionId))
                .get();

            return version ?? null;
        },

        hasWorkoutForVersion: (versionId: string): boolean => {
            const workout = repositoryDb
                .select({ id: workoutsTable.id })
                .from(workoutsTable)
                .where(eq(workoutsTable.currentVersionId, versionId))
                .get();

            return workout !== undefined;
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

        insertWorkout: (input: InsertWorkoutInput): void => {
            const currentVersion = repository.getWorkoutVersionRow(
                input.currentVersionId,
            );
            if (!currentVersion) {
                throw new Error(
                    `Workout version ${input.currentVersionId} was not found`,
                );
            }

            repositoryDb.insert(workoutsTable).values(input).run();
        },

        insertWorkoutVersion: (
            workoutSnapshot: Workout,
            versionId: string,
            workoutId: string | null,
        ): void => {
            const rows = workoutToVersionDbRows(
                workoutSnapshot,
                versionId,
                workoutId,
            );

            repositoryDb.insert(workoutVersionsTable).values(rows.version).run();

            if (rows.blocks.length > 0) {
                repositoryDb
                    .insert(workoutBlocksTable)
                    .values(rows.blocks)
                    .run();
            }

            if (rows.exercises.length > 0) {
                repositoryDb
                    .insert(workoutExercisesTable)
                    .values(rows.exercises)
                    .run();
            }
        },

        createWorkoutVersion: (
            workoutSnapshot: Workout,
            workoutId: string | null,
        ): string => {
            const versionId = uid();
            repository.insertWorkoutVersion(
                workoutSnapshot,
                versionId,
                workoutId,
            );
            return versionId;
        },

        updateWorkout: (input: UpdateWorkoutInput): void => {
            const currentVersion = repository.getWorkoutVersionRow(
                input.currentVersionId,
            );
            if (!currentVersion) {
                throw new Error(
                    `Workout version ${input.currentVersionId} was not found`,
                );
            }

            repositoryDb
                .update(workoutsTable)
                .set({
                    currentVersionId: input.currentVersionId,
                    isFavorite: input.isFavorite,
                    sortIndex: input.sortIndex,
                })
                .where(eq(workoutsTable.id, input.id))
                .run();
        },

        relinkWorkoutVersion: (relinkArgs: RelinkWorkoutVersionInput): void => {
            repositoryDb
                .update(workoutVersionsTable)
                .set({ workoutId: relinkArgs.workoutId })
                .where(eq(workoutVersionsTable.id, relinkArgs.workoutVersionId))
                .run();
        },

        deleteWorkout: (id: string): void => {
            repositoryDb
                .delete(workoutsTable)
                .where(eq(workoutsTable.id, id))
                .run();
        },

        deleteWorkoutVersion: (versionId: string): void => {
            if (repository.hasWorkoutForVersion(versionId)) {
                throw new Error(
                    `Cannot delete workout version ${versionId}: version is used by a workout`,
                );
            }

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
        },
    };

    return repository;
};
