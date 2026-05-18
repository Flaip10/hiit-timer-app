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
    workoutsByVersionIdFromDbRows,
    workoutsFromDbRows,
    type WorkoutExerciseWithDefinitionRow,
} from '../../mappers/workouts/workoutMapper';

export type WorkoutDbRow = typeof workoutsTable.$inferSelect;
export type WorkoutVersionDbRow = typeof workoutVersionsTable.$inferSelect;

export type InsertWorkoutInput = typeof workoutsTable.$inferInsert;

export interface UpdateWorkoutInput {
    currentVersionId: string;
    id: string;
    isFavorite: boolean;
    name: string;
    sortIndex: number;
}

export interface WorkoutRepository {
    getAll: () => Workout[];
    getById: (id: string) => Workout | null;
    getCurrentVersionId: (id: string) => string | null;
    getActiveWorkoutIdsByVersionIds: (
        versionIds: string[],
    ) => Map<string, string>;
    getWorkoutByVersionId: (versionId: string) => Workout | null;
    getWorkoutRow: (id: string) => WorkoutDbRow | null;
    getWorkoutVersionRow: (versionId: string) => WorkoutVersionDbRow | null;
    getWorkoutsByVersionIds: (versionIds: string[]) => Map<string, Workout>;
    hasWorkoutForVersion: (versionId: string) => boolean;
    readExistingIds: (ids: string[]) => Set<string>;
    readUsedVersionIds: (versionIds: string[]) => Set<string>;
    insertWorkout: (input: InsertWorkoutInput) => void;
    insertWorkoutVersion: (
        workoutSnapshot: Workout,
        versionId: string,
    ) => void;
    createWorkoutVersion: (workoutSnapshot: Workout) => string;
    updateWorkout: (input: UpdateWorkoutInput) => void;
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

    const getExercisesForBlocks = (
        blockIds: string[],
    ): WorkoutExerciseWithDefinitionRow[] =>
        blockIds.length > 0
            ? repositoryDb
                  .select({
                      id: workoutExercisesTable.id,
                      blockId: workoutExercisesTable.blockId,
                      sortIndex: workoutExercisesTable.sortIndex,
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
                    workoutName: row.workouts.name,
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

        getActiveWorkoutIdsByVersionIds: (
            versionIds: string[],
        ): Map<string, string> => {
            const uniqueVersionIds = Array.from(new Set(versionIds));
            if (uniqueVersionIds.length === 0) return new Map<string, string>();

            const rows = repositoryDb
                .select({
                    id: workoutsTable.id,
                    currentVersionId: workoutsTable.currentVersionId,
                })
                .from(workoutsTable)
                .where(
                    inArray(workoutsTable.currentVersionId, uniqueVersionIds),
                )
                .all();

            return new Map(
                rows.map((row) => [row.currentVersionId, row.id]),
            );
        },

        getWorkoutByVersionId: (versionId: string): Workout | null => {
            const workoutsByVersionId = repository.getWorkoutsByVersionIds([
                versionId,
            ]);

            return workoutsByVersionId.get(versionId) ?? null;
        },

        getWorkoutRow: (id: string): WorkoutDbRow | null => {
            const row = repositoryDb
                .select()
                .from(workoutsTable)
                .where(eq(workoutsTable.id, id))
                .get();

            return row ?? null;
        },

        getWorkoutVersionRow: (
            versionId: string,
        ): WorkoutVersionDbRow | null => {
            const version = repositoryDb
                .select()
                .from(workoutVersionsTable)
                .where(eq(workoutVersionsTable.id, versionId))
                .get();

            return version ?? null;
        },

        getWorkoutsByVersionIds: (
            versionIds: string[],
        ): Map<string, Workout> => {
            const uniqueVersionIds = Array.from(new Set(versionIds));
            if (uniqueVersionIds.length === 0) return new Map();

            const rows = repositoryDb
                .select()
                .from(workoutVersionsTable)
                .leftJoin(
                    workoutsTable,
                    eq(workoutsTable.currentVersionId, workoutVersionsTable.id),
                )
                .where(inArray(workoutVersionsTable.id, uniqueVersionIds))
                .all();
            if (rows.length === 0) return new Map();

            const resolvedVersionIds = rows.map(
                (row) => row.workout_versions.id,
            );
            const blockRows = repositoryDb
                .select()
                .from(workoutBlocksTable)
                .where(
                    inArray(
                        workoutBlocksTable.workoutVersionId,
                        resolvedVersionIds,
                    ),
                )
                .orderBy(asc(workoutBlocksTable.sortIndex))
                .all();
            const exerciseRows = getExercisesForBlocks(
                blockRows.map((block) => block.id),
            );

            return workoutsByVersionIdFromDbRows(
                rows,
                blockRows,
                exerciseRows,
            );
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

        readUsedVersionIds: (versionIds: string[]): Set<string> => {
            if (versionIds.length === 0) return new Set<string>();

            const rows = repositoryDb
                .select({ currentVersionId: workoutsTable.currentVersionId })
                .from(workoutsTable)
                .where(inArray(workoutsTable.currentVersionId, versionIds))
                .all();

            return new Set(rows.map((row) => row.currentVersionId));
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
        ): void => {
            const rows = workoutToVersionDbRows(
                workoutSnapshot,
                versionId,
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

        createWorkoutVersion: (workoutSnapshot: Workout): string => {
            const versionId = uid();
            repository.insertWorkoutVersion(
                workoutSnapshot,
                versionId,
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
                    name: input.name,
                    sortIndex: input.sortIndex,
                })
                .where(eq(workoutsTable.id, input.id))
                .run();
        },

        deleteWorkout: (id: string): void => {
            repositoryDb
                .delete(workoutsTable)
                .where(eq(workoutsTable.id, id))
                .run();
        },

        deleteWorkoutVersion: (versionId: string): void => {
            repositoryDb
                .delete(workoutVersionsTable)
                .where(eq(workoutVersionsTable.id, versionId))
                .run();
        },
    };

    return repository;
};
