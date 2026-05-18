import type { Workout } from '@src/core/entities/entities';

export interface WorkoutFixtureArgs {
    id?: string;
    name?: string;
    isFavorite?: boolean;
    updatedAtMs?: number;
}

export const createWorkoutFixture = (
    args: WorkoutFixtureArgs = {},
): Workout => {
    const id = args.id ?? 'workout-1';

    return {
        id,
        name: args.name ?? 'Morning Intervals',
        updatedAtMs: args.updatedAtMs ?? 1_700_000_000_000,
        isFavorite: args.isFavorite,
        blocks: [
            {
                id: `${id}-block-1`,
                title: 'Warmup',
                sets: 1,
                restBetweenSetsSec: 0,
                restBetweenExercisesSec: 10,
                exercises: [
                    {
                        id: `${id}-exercise-1`,
                        name: 'Jumping Jacks',
                        mode: 'time',
                        value: 30,
                    },
                ],
            },
            {
                id: `${id}-block-2`,
                title: 'Main',
                sets: 2,
                restBetweenSetsSec: 45,
                restBetweenExercisesSec: 15,
                exercises: [
                    {
                        id: `${id}-exercise-2`,
                        name: 'High Knees',
                        mode: 'time',
                        value: 40,
                    },
                    {
                        id: `${id}-exercise-3`,
                        name: 'Plank',
                        mode: 'time',
                        value: 50,
                    },
                ],
            },
        ],
    };
};

export const createQuickWorkoutFixture = (
    args: WorkoutFixtureArgs = {},
): Workout => {
    const id = args.id ?? 'workout-1';

    return {
        id,
        name: args.name ?? 'Quick Workout',
        updatedAtMs: args.updatedAtMs ?? 1_700_000_000_000,
        isFavorite: args.isFavorite,
        blocks: [
            {
                id: `${id}-block-1`,
                sets: 1,
                restBetweenSetsSec: 0,
                restBetweenExercisesSec: 0,
                exercises: [
                    {
                        id: `${id}-exercise-1`,
                        exerciseDefinitionId: 'def-1',
                        mode: 'time',
                        value: 30,
                    },
                    {
                        id: `${id}-exercise-2`,
                        exerciseDefinitionId: 'def-2',
                        mode: 'time',
                        value: 40,
                    },
                ],
            },
        ],
    };
};

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
