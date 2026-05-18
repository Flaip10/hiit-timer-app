import type { Workout, WorkoutBlock } from '@src/core/entities/entities';
import { uid } from '@src/core/id';

import type {
    workoutBlocksTable,
    workoutExercisesTable,
    workoutVersionsTable,
    workoutsTable,
} from '../../schema';

export type WorkoutDbRow = typeof workoutsTable.$inferSelect;
export type WorkoutVersionDbRow = typeof workoutVersionsTable.$inferSelect;
export type WorkoutBlockDbRow = typeof workoutBlocksTable.$inferSelect;
type WorkoutExerciseTableRow = typeof workoutExercisesTable.$inferSelect;

export interface WorkoutExerciseWithDefinitionRow
    extends WorkoutExerciseTableRow {
    exerciseDefinitionName: string | null;
}

interface WorkoutVersionDbRows {
    version: typeof workoutVersionsTable.$inferInsert;
    blocks: (typeof workoutBlocksTable.$inferInsert)[];
    exercises: (typeof workoutExercisesTable.$inferInsert)[];
}

export interface WorkoutWithCurrentVersionRow {
    workouts: WorkoutDbRow;
    workout_versions: WorkoutVersionDbRow;
}

export interface WorkoutVersionWithActiveWorkoutRow {
    workouts: WorkoutDbRow | null;
    workout_versions: WorkoutVersionDbRow;
}

const groupBlocksByVersionId = (
    blocks: WorkoutBlockDbRow[],
): Map<string, WorkoutBlockDbRow[]> => {
    const blocksByVersionId = new Map<string, WorkoutBlockDbRow[]>();

    blocks.forEach((block) => {
        const current = blocksByVersionId.get(block.workoutVersionId) ?? [];
        current.push(block);
        blocksByVersionId.set(block.workoutVersionId, current);
    });

    return blocksByVersionId;
};

export const groupExercisesByBlockId = (
    exercises: WorkoutExerciseWithDefinitionRow[],
): Map<string, WorkoutExerciseWithDefinitionRow[]> => {
    const exercisesByBlockId = new Map<
        string,
        WorkoutExerciseWithDefinitionRow[]
    >();

    exercises.forEach((exercise) => {
        const current = exercisesByBlockId.get(exercise.blockId) ?? [];
        current.push(exercise);
        exercisesByBlockId.set(exercise.blockId, current);
    });

    return exercisesByBlockId;
};

const workoutBlocksFromDbRows = (
    blocks: WorkoutBlockDbRow[],
    exercisesByBlockId: Map<string, WorkoutExerciseWithDefinitionRow[]>,
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
                    name: exercise.exerciseDefinitionName ?? undefined,
                    exerciseDefinitionId:
                        exercise.exerciseDefinitionId ?? undefined,
                    mode: exercise.mode,
                    value: exercise.value,
                    tempo: exercise.tempo ?? undefined,
                })),
        }));

export const workoutToVersionDbRows = (
    workoutSnapshot: Workout,
    workoutVersionId: string,
): WorkoutVersionDbRows => {
    const blockDbIdByWorkoutBlockId = new Map<string, string>();

    const blocks = workoutSnapshot.blocks.map((block, blockIndex) => {
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

    const exercises = workoutSnapshot.blocks.flatMap((block) => {
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
            exerciseDefinitionId: exercise.exerciseDefinitionId ?? null,
            mode: exercise.mode,
            value: exercise.value,
            tempo: exercise.tempo ?? null,
        }));
    });

    return {
        version: {
            id: workoutVersionId,
            name: workoutSnapshot.name,
            updatedAtMs: workoutSnapshot.updatedAtMs,
        },
        blocks,
        exercises,
    };
};

export const workoutFromDbRows = (
    version: WorkoutVersionDbRow,
    blocks: WorkoutBlockDbRow[],
    exercisesByBlockId: Map<string, WorkoutExerciseWithDefinitionRow[]>,
    args?: { workoutId?: string; workoutName?: string; isFavorite?: boolean },
): Workout => {
    const workoutBlocks = workoutBlocksFromDbRows(blocks, exercisesByBlockId);

    return {
        id: args?.workoutId ?? version.id,
        name: args?.workoutName ?? version.name,
        blocks: workoutBlocks,
        updatedAtMs: version.updatedAtMs,
        isFavorite: args?.isFavorite,
    };
};

export const workoutsFromDbRows = (
    rows: WorkoutWithCurrentVersionRow[],
    blocks: WorkoutBlockDbRow[],
    exercises: WorkoutExerciseWithDefinitionRow[],
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
                workoutName: row.workouts.name,
                isFavorite: row.workouts.isFavorite,
            },
        ),
    );
};

export const workoutsByVersionIdFromDbRows = (
    rows: WorkoutVersionWithActiveWorkoutRow[],
    blocks: WorkoutBlockDbRow[],
    exercises: WorkoutExerciseWithDefinitionRow[],
): Map<string, Workout> => {
    const blocksByVersionId = groupBlocksByVersionId(blocks);
    const exercisesByBlockId = groupExercisesByBlockId(exercises);

    return new Map(
        rows.map((row) => [
            row.workout_versions.id,
            workoutFromDbRows(
                row.workout_versions,
                blocksByVersionId.get(row.workout_versions.id) ?? [],
                exercisesByBlockId,
                row.workouts
                    ? {
                          workoutId: row.workouts.id,
                          workoutName: row.workouts.name,
                          isFavorite: row.workouts.isFavorite,
                      }
                    : undefined,
            ),
        ]),
    );
};
