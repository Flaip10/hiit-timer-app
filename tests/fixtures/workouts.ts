import type { Workout } from '@src/core/entities/entities';

export interface WorkoutFixtureArgs {
    id?: string;
    isFavorite?: boolean;
    name?: string;
    updatedAtMs?: number;
}

export const createWorkoutFixture = (
    args: WorkoutFixtureArgs = {},
): Workout => ({
    id: args.id ?? 'workout-1',
    name: args.name ?? 'Morning Intervals',
    updatedAtMs: args.updatedAtMs ?? 1_700_000_000_000,
    isFavorite: args.isFavorite,
    blocks: [
        {
            id: `${args.id ?? 'workout-1'}-block-1`,
            title: 'Warmup',
            sets: 1,
            restBetweenSetsSec: 0,
            restBetweenExercisesSec: 10,
            exercises: [
                {
                    id: `${args.id ?? 'workout-1'}-exercise-1`,
                    name: 'Jumping Jacks',
                    mode: 'time',
                    value: 30,
                },
            ],
        },
        {
            id: `${args.id ?? 'workout-1'}-block-2`,
            title: 'Main',
            sets: 2,
            restBetweenSetsSec: 45,
            restBetweenExercisesSec: 15,
            exercises: [
                {
                    id: `${args.id ?? 'workout-1'}-exercise-2`,
                    name: 'High Knees',
                    mode: 'time',
                    value: 40,
                },
                {
                    id: `${args.id ?? 'workout-1'}-exercise-3`,
                    name: 'Plank',
                    mode: 'time',
                    value: 50,
                },
            ],
        },
    ],
});

export const createChangedWorkoutContent = (workout: Workout): Workout => ({
    ...workout,
    blocks: workout.blocks.map((block, blockIndex) =>
        blockIndex === 0
            ? {
                  ...block,
                  exercises: block.exercises.map((exercise, exerciseIndex) =>
                      exerciseIndex === 0
                          ? {
                                ...exercise,
                                value: exercise.value + 10,
                            }
                          : exercise,
                  ),
              }
            : block,
    ),
});
