import type { Workout, WorkoutBlock } from '@src/core/entities/entities';
import { uid } from '@src/core/id';

import type {
    workoutBlocksTable,
    workoutExercisesTable,
    workoutVersionsTable,
    workoutsTable,
} from '../schema';

export type WorkoutRow = typeof workoutsTable.$inferSelect;
export type WorkoutVersionRow = typeof workoutVersionsTable.$inferSelect;
export type WorkoutBlockRow = typeof workoutBlocksTable.$inferSelect;
export type WorkoutExerciseRow = typeof workoutExercisesTable.$inferSelect;

interface WorkoutVersionDbRows {
    version: typeof workoutVersionsTable.$inferInsert;
    blocks: (typeof workoutBlocksTable.$inferInsert)[];
    exercises: (typeof workoutExercisesTable.$inferInsert)[];
}

export interface WorkoutWithVersionRow {
    workouts: WorkoutRow;
    workout_versions: WorkoutVersionRow;
}

const groupBlocksByVersionId = (
    blocks: WorkoutBlockRow[],
): Map<string, WorkoutBlockRow[]> => {
    const blocksByVersionId = new Map<string, WorkoutBlockRow[]>();

    blocks.forEach((block) => {
        const current = blocksByVersionId.get(block.workoutVersionId) ?? [];
        current.push(block);
        blocksByVersionId.set(block.workoutVersionId, current);
    });

    return blocksByVersionId;
};

export const groupExercisesByBlockId = (
    exercises: WorkoutExerciseRow[],
): Map<string, WorkoutExerciseRow[]> => {
    const exercisesByBlockId = new Map<string, WorkoutExerciseRow[]>();

    exercises.forEach((exercise) => {
        const current = exercisesByBlockId.get(exercise.blockId) ?? [];
        current.push(exercise);
        exercisesByBlockId.set(exercise.blockId, current);
    });

    return exercisesByBlockId;
};

const workoutBlocksFromDbRows = (
    blocks: WorkoutBlockRow[],
    exercisesByBlockId: Map<string, WorkoutExerciseRow[]>,
): WorkoutBlock[] =>
    blocks
        .slice()
        .sort((left, right) => left.sortIndex - right.sortIndex)
        .map((block) => ({
            id: block.id,
            title: block.title ?? undefined,
            sets: block.sets,
            restBetweenSetsSec: block.restBetweenSetsSec,
            restBetweenExercisesSec: block.restBetweenExercisesSec,
            exercises: (exercisesByBlockId.get(block.id) ?? [])
                .slice()
                .sort((left, right) => left.sortIndex - right.sortIndex)
                .map((exercise) => ({
                    id: exercise.id,
                    name: exercise.name ?? undefined,
                    mode: exercise.mode,
                    value: exercise.value,
                    tempo: exercise.tempo ?? undefined,
                })),
        }));

export const workoutToVersionDbRows = (
    workout: Workout,
    workoutVersionId: string,
    workoutId: string | null,
): WorkoutVersionDbRows => {
    const blockDbIdByWorkoutBlockId = new Map<string, string>();

    const blocks = workout.blocks.map((block, blockIndex) => {
        const blockDbId = uid();
        blockDbIdByWorkoutBlockId.set(block.id, blockDbId);

        return {
            id: blockDbId,
            workoutVersionId,
            sortIndex: blockIndex,
            title: block.title ?? null,
            sets: block.sets,
            restBetweenSetsSec: block.restBetweenSetsSec,
            restBetweenExercisesSec: block.restBetweenExercisesSec,
        };
    });

    const exercises = workout.blocks.flatMap((block) => {
        const blockDbId = blockDbIdByWorkoutBlockId.get(block.id);
        if (!blockDbId) {
            throw new Error(
                `Missing DB block ID for workout block ${block.id}`,
            );
        }

        return block.exercises.map((exercise, exerciseIndex) => ({
            id: uid(),
            blockId: blockDbId,
            sortIndex: exerciseIndex,
            name: exercise.name ?? null,
            mode: exercise.mode,
            value: exercise.value,
            tempo: exercise.tempo ?? null,
        }));
    });

    return {
        version: {
            id: workoutVersionId,
            workoutId,
            name: workout.name,
            updatedAtMs: workout.updatedAtMs,
        },
        blocks,
        exercises,
    };
};

export const workoutFromDbRows = (
    version: WorkoutVersionRow,
    blocks: WorkoutBlockRow[],
    exercisesByBlockId: Map<string, WorkoutExerciseRow[]>,
    args?: { workoutId?: string; isFavorite?: boolean },
): Workout => {
    const workoutBlocks = workoutBlocksFromDbRows(blocks, exercisesByBlockId);

    return {
        id: args?.workoutId ?? version.workoutId ?? version.id,
        name: version.name,
        blocks: workoutBlocks,
        updatedAtMs: version.updatedAtMs,
        isFavorite: args?.isFavorite,
    };
};

export const workoutsFromDbRows = (
    rows: WorkoutWithVersionRow[],
    blocks: WorkoutBlockRow[],
    exercises: WorkoutExerciseRow[],
): Workout[] => {
    const blocksByVersionId = groupBlocksByVersionId(blocks);
    const exercisesByBlockId = groupExercisesByBlockId(exercises);

    return rows.map((row) =>
        workoutFromDbRows(
            row.workout_versions,
            blocksByVersionId.get(row.workout_versions.id) ?? [],
            exercisesByBlockId,
            {
                workoutId: row.workouts.id,
                isFavorite: row.workouts.isFavorite,
            },
        ),
    );
};

export const workoutsByVersionIdFromDbRows = (
    versions: WorkoutVersionRow[],
    blocks: WorkoutBlockRow[],
    exercises: WorkoutExerciseRow[],
): Map<string, Workout> => {
    const blocksByVersionId = groupBlocksByVersionId(blocks);
    const exercisesByBlockId = groupExercisesByBlockId(exercises);

    return new Map(
        versions.map((version) => [
            version.id,
            workoutFromDbRows(
                version,
                blocksByVersionId.get(version.id) ?? [],
                exercisesByBlockId,
            ),
        ]),
    );
};
