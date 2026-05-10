import { asc, eq, inArray } from 'drizzle-orm';

import type { Workout } from '@src/core/entities/entities';

import { db } from '../client';
import {
    workoutBlocksTable,
    workoutExercisesTable,
    workoutsTable,
} from '../schema';
import {
    workoutFromDbRows,
    workoutToDbRows,
    type WorkoutBlockRow,
} from '../mappers/workoutMapper';

export const workoutRepository = {
    getAll: (): Workout[] => {
        const workoutRows = db
            .select()
            .from(workoutsTable)
            .orderBy(asc(workoutsTable.sortIndex))
            .all();

        if (workoutRows.length === 0) {
            return [];
        }

        const workoutIds = workoutRows.map((workout) => workout.id);
        const blockRows = db
            .select()
            .from(workoutBlocksTable)
            .where(inArray(workoutBlocksTable.workoutId, workoutIds))
            .orderBy(asc(workoutBlocksTable.sortIndex))
            .all();

        const blockIds = blockRows.map((block) => block.id);
        const exerciseRows =
            blockIds.length > 0
                ? db
                      .select()
                      .from(workoutExercisesTable)
                      .where(inArray(workoutExercisesTable.blockId, blockIds))
                      .orderBy(asc(workoutExercisesTable.sortIndex))
                      .all()
                : [];

        const blocksByWorkoutId = new Map<string, WorkoutBlockRow[]>();
        blockRows.forEach((block) => {
            const current = blocksByWorkoutId.get(block.workoutId) ?? [];
            current.push(block);
            blocksByWorkoutId.set(block.workoutId, current);
        });

        return workoutRows.map((workout) =>
            workoutFromDbRows(
                workout,
                blocksByWorkoutId.get(workout.id) ?? [],
                exerciseRows
            )
        );
    },

    getById: (id: string): Workout | null => {
        const workout = db
            .select()
            .from(workoutsTable)
            .where(eq(workoutsTable.id, id))
            .get();

        if (!workout) return null;

        const blocks = db
            .select()
            .from(workoutBlocksTable)
            .where(eq(workoutBlocksTable.workoutId, id))
            .orderBy(asc(workoutBlocksTable.sortIndex))
            .all();

        const blockIds = blocks.map((block) => block.id);
        const exercises =
            blockIds.length > 0
                ? db
                      .select()
                      .from(workoutExercisesTable)
                      .where(inArray(workoutExercisesTable.blockId, blockIds))
                      .orderBy(asc(workoutExercisesTable.sortIndex))
                      .all()
                : [];

        return workoutFromDbRows(workout, blocks, exercises);
    },

    upsert: (workout: Workout, sortIndex: number): void => {
        const rows = workoutToDbRows(workout, sortIndex);

        db.transaction((tx) => {
            tx.insert(workoutsTable)
                .values(rows.workout)
                .onConflictDoUpdate({
                    target: workoutsTable.id,
                    set: rows.workout,
                })
                .run();

            const existingBlocks = tx
                .select()
                .from(workoutBlocksTable)
                .where(eq(workoutBlocksTable.workoutId, workout.id))
                .all();

            const existingBlockIds = existingBlocks.map((block) => block.id);
            if (existingBlockIds.length > 0) {
                tx.delete(workoutExercisesTable)
                    .where(
                        inArray(
                            workoutExercisesTable.blockId,
                            existingBlockIds
                        )
                    )
                    .run();
            }

            tx.delete(workoutBlocksTable)
                .where(eq(workoutBlocksTable.workoutId, workout.id))
                .run();

            if (rows.blocks.length > 0) {
                tx.insert(workoutBlocksTable).values(rows.blocks).run();
            }

            if (rows.exercises.length > 0) {
                tx.insert(workoutExercisesTable).values(rows.exercises).run();
            }
        });
    },

    remove: (id: string): void => {
        db.transaction((tx) => {
            const blocks = tx
                .select()
                .from(workoutBlocksTable)
                .where(eq(workoutBlocksTable.workoutId, id))
                .all();

            const blockIds = blocks.map((block) => block.id);
            if (blockIds.length > 0) {
                tx.delete(workoutExercisesTable)
                    .where(inArray(workoutExercisesTable.blockId, blockIds))
                    .run();
            }

            tx.delete(workoutBlocksTable)
                .where(eq(workoutBlocksTable.workoutId, id))
                .run();

            tx.delete(workoutsTable).where(eq(workoutsTable.id, id)).run();
        });
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
};
