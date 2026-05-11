import { asc, desc, eq, inArray } from 'drizzle-orm';

import type { Workout } from '@src/core/entities/entities';
import { uid } from '@src/core/id';

import { db } from '../client';
import {
    workoutBlocksTable,
    workoutExercisesTable,
    workoutSessionsTable,
    workoutVersionsTable,
    workoutsTable,
} from '../schema';
import {
    workoutFromDbRows,
    workoutToVersionDbRows,
    workoutsFromDbRows,
    type WorkoutExerciseRow,
} from '../mappers/workoutMapper';
import { hasSameWorkoutContent } from '../mappers/workoutContent';

const getExercisesForBlocks = (
    blockIds: string[]
): WorkoutExerciseRow[] =>
    blockIds.length > 0
        ? db
              .select()
              .from(workoutExercisesTable)
              .where(inArray(workoutExercisesTable.blockId, blockIds))
              .orderBy(asc(workoutExercisesTable.sortIndex))
              .all()
        : [];

export const insertWorkoutVersion = (
    workout: Workout,
    versionId: string,
    workoutId: string | null
): void => {
    const rows = workoutToVersionDbRows(workout, versionId, workoutId);

    db.insert(workoutVersionsTable).values(rows.version).run();

    if (rows.blocks.length > 0) {
        db.insert(workoutBlocksTable).values(rows.blocks).run();
    }

    if (rows.exercises.length > 0) {
        db.insert(workoutExercisesTable).values(rows.exercises).run();
    }
};

const deleteWorkoutVersion = (versionId: string): void => {
    const blocks = db
        .select()
        .from(workoutBlocksTable)
        .where(eq(workoutBlocksTable.workoutVersionId, versionId))
        .all();

    const blockIds = blocks.map((block) => block.id);
    if (blockIds.length > 0) {
        db.delete(workoutExercisesTable)
            .where(inArray(workoutExercisesTable.blockId, blockIds))
            .run();
    }

    db.delete(workoutBlocksTable)
        .where(eq(workoutBlocksTable.workoutVersionId, versionId))
        .run();
    db.delete(workoutVersionsTable)
        .where(eq(workoutVersionsTable.id, versionId))
        .run();
};

export const deleteWorkoutVersionIfOrphan = (versionId: string): void => {
    const activeWorkout = db
        .select({ id: workoutsTable.id })
        .from(workoutsTable)
        .where(eq(workoutsTable.currentVersionId, versionId))
        .get();
    if (activeWorkout) return;

    const session = db
        .select({ id: workoutSessionsTable.id })
        .from(workoutSessionsTable)
        .where(eq(workoutSessionsTable.workoutVersionId, versionId))
        .get();
    if (session) return;

    deleteWorkoutVersion(versionId);
};

export const getWorkoutByVersionId = (
    versionId: string,
    args?: { workoutId?: string; isFavorite?: boolean }
): Workout | null => {
    const version = db
        .select()
        .from(workoutVersionsTable)
        .where(eq(workoutVersionsTable.id, versionId))
        .get();
    if (!version) return null;

    const blocks = db
        .select()
        .from(workoutBlocksTable)
        .where(eq(workoutBlocksTable.workoutVersionId, versionId))
        .orderBy(asc(workoutBlocksTable.sortIndex))
        .all();

    const exercises = getExercisesForBlocks(blocks.map((block) => block.id));

    return workoutFromDbRows(version, blocks, exercises, args);
};

export const createWorkoutVersion = (
    workout: Workout,
    workoutId: string | null
): string => {
    const versionId = uid();
    insertWorkoutVersion(workout, versionId, workoutId);
    return versionId;
};

export const workoutRepository = {
    getAll: (): Workout[] => {
        const rows = db
            .select()
            .from(workoutsTable)
            .innerJoin(
                workoutVersionsTable,
                eq(workoutsTable.currentVersionId, workoutVersionsTable.id)
            )
            .orderBy(
                desc(workoutsTable.isFavorite),
                desc(workoutVersionsTable.updatedAtMs)
            )
            .all();

        if (rows.length === 0) {
            return [];
        }

        const versionIds = rows.map((row) => row.workout_versions.id);
        const blockRows = db
            .select()
            .from(workoutBlocksTable)
            .where(inArray(workoutBlocksTable.workoutVersionId, versionIds))
            .orderBy(asc(workoutBlocksTable.sortIndex))
            .all();

        const exerciseRows = getExercisesForBlocks(
            blockRows.map((block) => block.id)
        );

        return workoutsFromDbRows(rows, blockRows, exerciseRows);
    },

    getById: (id: string): Workout | null => {
        const workout = db
            .select()
            .from(workoutsTable)
            .where(eq(workoutsTable.id, id))
            .get();

        if (!workout) return null;

        return getWorkoutByVersionId(workout.currentVersionId, {
            workoutId: workout.id,
            isFavorite: workout.isFavorite,
        });
    },

    getCurrentVersionId: (id: string): string | null => {
        const workout = db
            .select({ currentVersionId: workoutsTable.currentVersionId })
            .from(workoutsTable)
            .where(eq(workoutsTable.id, id))
            .get();

        return workout?.currentVersionId ?? null;
    },

    doesWorkoutUseVersion: (args: {
        workoutId: string;
        workoutVersionId: string;
    }): boolean => {
        const currentVersionId = workoutRepository.getCurrentVersionId(
            args.workoutId
        );

        return currentVersionId === args.workoutVersionId;
    },

    upsert: (workout: Workout, sortIndex: number): void => {
        const existingWorkout = db
            .select()
            .from(workoutsTable)
            .where(eq(workoutsTable.id, workout.id))
            .get();

        if (!existingWorkout) {
            const versionId = uid();

            db.transaction(() => {
                db.insert(workoutsTable)
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
            }
        );
        const shouldCreateVersion =
            currentWorkout == null ||
            !hasSameWorkoutContent(currentWorkout, workout);
        const nextVersionId = shouldCreateVersion
            ? uid()
            : existingWorkout.currentVersionId;
        const previousVersionId = existingWorkout.currentVersionId;

        db.transaction(() => {
            if (shouldCreateVersion) {
                insertWorkoutVersion(workout, nextVersionId, workout.id);
            }

            db.update(workoutsTable)
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

    upsertRestoredWorkout: (args: {
        workout: Workout;
        sortIndex: number;
        sourceWorkoutVersionId: string;
    }): void => {
        const sourceWorkout = getWorkoutByVersionId(args.sourceWorkoutVersionId);
        const canReuseSourceVersion =
            sourceWorkout != null &&
            hasSameWorkoutContent(sourceWorkout, args.workout);

        if (!canReuseSourceVersion) {
            workoutRepository.upsert(args.workout, args.sortIndex);
            return;
        }

        const existingWorkout = db
            .select()
            .from(workoutsTable)
            .where(eq(workoutsTable.id, args.workout.id))
            .get();
        const previousVersionId = existingWorkout?.currentVersionId;

        db.insert(workoutsTable)
            .values({
                id: args.workout.id,
                currentVersionId: args.sourceWorkoutVersionId,
                createdAtMs: args.workout.updatedAtMs,
                isFavorite: args.workout.isFavorite === true,
                sortIndex: args.sortIndex,
            })
            .onConflictDoUpdate({
                target: workoutsTable.id,
                set: {
                    currentVersionId: args.sourceWorkoutVersionId,
                    createdAtMs:
                        existingWorkout?.createdAtMs ?? args.workout.updatedAtMs,
                    isFavorite: args.workout.isFavorite === true,
                    sortIndex: args.sortIndex,
                },
            })
            .run();

        workoutRepository.relinkSessionsForVersion({
            workoutId: args.workout.id,
            workoutVersionId: args.sourceWorkoutVersionId,
        });

        if (
            previousVersionId != null &&
            previousVersionId !== args.sourceWorkoutVersionId
        ) {
            deleteWorkoutVersionIfOrphan(previousVersionId);
        }
    },

    remove: (id: string): void => {
        const workout = db
            .select({ currentVersionId: workoutsTable.currentVersionId })
            .from(workoutsTable)
            .where(eq(workoutsTable.id, id))
            .get();

        db.transaction(() => {
            db.update(workoutVersionsTable)
                .set({ workoutId: null })
                .where(eq(workoutVersionsTable.workoutId, id))
                .run();
            db.update(workoutSessionsTable)
                .set({ workoutId: null })
                .where(eq(workoutSessionsTable.workoutId, id))
                .run();
            db.delete(workoutsTable).where(eq(workoutsTable.id, id)).run();
        });

        if (workout) {
            deleteWorkoutVersionIfOrphan(workout.currentVersionId);
        }
    },

    readExistingIds: (ids: string[]): Set<string> => {
        if (ids.length === 0) return new Set<string>();

        const rows = db
            .select({ id: workoutsTable.id })
            .from(workoutsTable)
            .where(inArray(workoutsTable.id, ids))
            .all();

        return new Set(rows.map((row) => row.id));
    },

    relinkSessionsForVersion: (args: {
        workoutId: string;
        workoutVersionId: string;
    }): void => {
        db.update(workoutSessionsTable)
            .set({ workoutId: args.workoutId })
            .where(eq(workoutSessionsTable.workoutVersionId, args.workoutVersionId))
            .run();
        db.update(workoutVersionsTable)
            .set({ workoutId: args.workoutId })
            .where(eq(workoutVersionsTable.id, args.workoutVersionId))
            .run();
    },
};
