import type {
    ExerciseMode,
    Workout,
    WorkoutBlock,
} from '@src/core/entities/entities';

import type {
    workoutBlocksTable,
    workoutExercisesTable,
    workoutsTable,
} from '../schema';

export interface WorkoutRow {
    id: string;
    name: string;
    updatedAtMs: number;
    isFavorite: boolean;
    sortIndex: number;
}

export interface WorkoutBlockRow {
    id: string;
    workoutId: string;
    sortIndex: number;
    title: string | null;
    sets: number;
    restBetweenSetsSec: number;
    restBetweenExercisesSec: number;
}

export interface WorkoutExerciseRow {
    id: string;
    blockId: string;
    sortIndex: number;
    name: string | null;
    mode: ExerciseMode;
    value: number;
    tempo: string | null;
}

export interface WorkoutDbRows {
    workout: typeof workoutsTable.$inferInsert;
    blocks: (typeof workoutBlocksTable.$inferInsert)[];
    exercises: (typeof workoutExercisesTable.$inferInsert)[];
}

export const workoutToDbRows = (
    workout: Workout,
    sortIndex: number
): WorkoutDbRows => {
    const blocks = workout.blocks.map((block, blockIndex) => ({
        id: block.id,
        workoutId: workout.id,
        sortIndex: blockIndex,
        title: block.title ?? null,
        sets: block.sets,
        restBetweenSetsSec: block.restBetweenSetsSec,
        restBetweenExercisesSec: block.restBetweenExercisesSec,
    }));

    const exercises = workout.blocks.flatMap((block) =>
        block.exercises.map((exercise, exerciseIndex) => ({
            id: exercise.id,
            blockId: block.id,
            sortIndex: exerciseIndex,
            name: exercise.name ?? null,
            mode: exercise.mode,
            value: exercise.value,
            tempo: exercise.tempo ?? null,
        }))
    );

    return {
        workout: {
            id: workout.id,
            name: workout.name,
            updatedAtMs: workout.updatedAtMs,
            isFavorite: workout.isFavorite === true,
            sortIndex,
        },
        blocks,
        exercises,
    };
};

export const workoutFromDbRows = (
    workout: WorkoutRow,
    blocks: WorkoutBlockRow[],
    exercises: WorkoutExerciseRow[]
): Workout => {
    const exercisesByBlockId = new Map<string, WorkoutExerciseRow[]>();

    exercises.forEach((exercise) => {
        const current = exercisesByBlockId.get(exercise.blockId) ?? [];
        current.push(exercise);
        exercisesByBlockId.set(exercise.blockId, current);
    });

    const workoutBlocks: WorkoutBlock[] = blocks
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

    return {
        id: workout.id,
        name: workout.name,
        blocks: workoutBlocks,
        updatedAtMs: workout.updatedAtMs,
        isFavorite: workout.isFavorite,
    };
};
