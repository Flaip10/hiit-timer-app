import { describe, expect, it } from '@jest/globals';

import type { Workout } from '@src/core/entities/entities';
import {
    groupExercisesByBlockId,
    workoutFromDbRows,
    workoutsByVersionIdFromDbRows,
    workoutsFromDbRows,
    workoutToVersionDbRows,
    type WorkoutBlockRow,
    type WorkoutExerciseRow,
    type WorkoutVersionRow,
    type WorkoutWithVersionRow,
} from '@src/db/mappers/workoutMapper';

const expectDefined = <Value>(value: Value | undefined): Value => {
    expect(value).toBeDefined();
    if (value === undefined) {
        throw new Error('Expected defined value');
    }

    return value;
};

const createWorkout = (): Workout => ({
    id: 'workout-1',
    name: 'Leg Day',
    updatedAtMs: 1_700_000_000_000,
    isFavorite: true,
    blocks: [
        {
            id: 'runtime-block-1',
            title: 'Warmup',
            sets: 1,
            restBetweenSetsSec: 0,
            restBetweenExercisesSec: 10,
            exercises: [
                {
                    id: 'runtime-exercise-1',
                    name: 'Jumping Jacks',
                    mode: 'time',
                    value: 30,
                },
            ],
        },
        {
            id: 'runtime-block-2',
            sets: 3,
            restBetweenSetsSec: 60,
            restBetweenExercisesSec: 20,
            exercises: [
                {
                    id: 'runtime-exercise-2',
                    name: 'Wall Sit',
                    mode: 'time',
                    value: 45,
                },
            ],
        },
    ],
});

describe('workoutToVersionDbRows', () => {
    it('maps runtime workout content to immutable version rows with fresh content IDs', () => {
        const workout = createWorkout();

        const rows = workoutToVersionDbRows(
            workout,
            'version-1',
            workout.id
        );

        expect(rows.version).toEqual({
            id: 'version-1',
            workoutId: 'workout-1',
            name: 'Leg Day',
            updatedAtMs: 1_700_000_000_000,
        });
        expect(rows.blocks).toHaveLength(2);
        expect(rows.exercises).toHaveLength(2);

        const firstBlock = expectDefined(rows.blocks[0]);
        const secondBlock = expectDefined(rows.blocks[1]);
        const firstExercise = expectDefined(rows.exercises[0]);
        const secondExercise = expectDefined(rows.exercises[1]);

        expect(firstBlock.id).not.toBe('runtime-block-1');
        expect(secondBlock.id).not.toBe('runtime-block-2');
        expect(firstBlock.id).not.toBe(secondBlock.id);
        expect(firstBlock).toMatchObject({
            workoutVersionId: 'version-1',
            sortIndex: 0,
            title: 'Warmup',
            sets: 1,
            restBetweenSetsSec: 0,
            restBetweenExercisesSec: 10,
        });
        expect(secondBlock).toMatchObject({
            workoutVersionId: 'version-1',
            sortIndex: 1,
            title: null,
            sets: 3,
            restBetweenSetsSec: 60,
            restBetweenExercisesSec: 20,
        });

        expect(firstExercise.id).not.toBe('runtime-exercise-1');
        expect(secondExercise.id).not.toBe('runtime-exercise-2');
        expect(firstExercise).toMatchObject({
            blockId: firstBlock.id,
            sortIndex: 0,
            name: 'Jumping Jacks',
            mode: 'time',
            value: 30,
            tempo: null,
        });
        expect(secondExercise).toMatchObject({
            blockId: secondBlock.id,
            sortIndex: 0,
            name: 'Wall Sit',
            mode: 'time',
            value: 45,
            tempo: null,
        });
    });
});

describe('workoutFromDbRows', () => {
    it('hydrates a workout from rows sorted by sort index', () => {
        const version: WorkoutVersionRow = {
            id: 'version-1',
            workoutId: 'workout-1',
            name: 'Strength',
            updatedAtMs: 200,
        };
        const blocks: WorkoutBlockRow[] = [
            {
                id: 'block-2',
                workoutVersionId: 'version-1',
                sortIndex: 1,
                title: null,
                sets: 2,
                restBetweenSetsSec: 45,
                restBetweenExercisesSec: 15,
            },
            {
                id: 'block-1',
                workoutVersionId: 'version-1',
                sortIndex: 0,
                title: 'First',
                sets: 1,
                restBetweenSetsSec: 0,
                restBetweenExercisesSec: 10,
            },
        ];
        const exercisesByBlockId = groupExercisesByBlockId([
            {
                id: 'exercise-2',
                blockId: 'block-1',
                sortIndex: 1,
                name: null,
                mode: 'time',
                value: 20,
                tempo: null,
            },
            {
                id: 'exercise-1',
                blockId: 'block-1',
                sortIndex: 0,
                name: 'High Knees',
                mode: 'time',
                value: 30,
                tempo: null,
            },
        ]);

        const workout = workoutFromDbRows(version, blocks, exercisesByBlockId, {
            workoutId: 'active-workout-1',
            isFavorite: false,
        });

        expect(workout).toEqual({
            id: 'active-workout-1',
            name: 'Strength',
            updatedAtMs: 200,
            isFavorite: false,
            blocks: [
                {
                    id: 'block-1',
                    title: 'First',
                    sets: 1,
                    restBetweenSetsSec: 0,
                    restBetweenExercisesSec: 10,
                    exercises: [
                        {
                            id: 'exercise-1',
                            name: 'High Knees',
                            mode: 'time',
                            value: 30,
                            tempo: undefined,
                        },
                        {
                            id: 'exercise-2',
                            name: undefined,
                            mode: 'time',
                            value: 20,
                            tempo: undefined,
                        },
                    ],
                },
                {
                    id: 'block-2',
                    title: undefined,
                    sets: 2,
                    restBetweenSetsSec: 45,
                    restBetweenExercisesSec: 15,
                    exercises: [],
                },
            ],
        });
    });
});

describe('workoutsFromDbRows', () => {
    it('hydrates active workouts from joined workout and version rows', () => {
        const rows: WorkoutWithVersionRow[] = [
            {
                workouts: {
                    id: 'workout-1',
                    currentVersionId: 'version-1',
                    createdAtMs: 100,
                    isFavorite: true,
                    sortIndex: 0,
                },
                workout_versions: {
                    id: 'version-1',
                    workoutId: 'workout-1',
                    name: 'Workout One',
                    updatedAtMs: 300,
                },
            },
            {
                workouts: {
                    id: 'workout-2',
                    currentVersionId: 'version-2',
                    createdAtMs: 200,
                    isFavorite: false,
                    sortIndex: 1,
                },
                workout_versions: {
                    id: 'version-2',
                    workoutId: 'workout-2',
                    name: 'Workout Two',
                    updatedAtMs: 400,
                },
            },
        ];
        const blocks: WorkoutBlockRow[] = [
            {
                id: 'block-1',
                workoutVersionId: 'version-1',
                sortIndex: 0,
                title: 'Block One',
                sets: 1,
                restBetweenSetsSec: 0,
                restBetweenExercisesSec: 0,
            },
            {
                id: 'block-2',
                workoutVersionId: 'version-2',
                sortIndex: 0,
                title: 'Block Two',
                sets: 2,
                restBetweenSetsSec: 30,
                restBetweenExercisesSec: 15,
            },
        ];
        const exercises: WorkoutExerciseRow[] = [
            {
                id: 'exercise-1',
                blockId: 'block-2',
                sortIndex: 0,
                name: 'Plank',
                mode: 'time',
                value: 60,
                tempo: null,
            },
        ];

        const workouts = workoutsFromDbRows(rows, blocks, exercises);

        expect(workouts).toHaveLength(2);
        expect(expectDefined(workouts[0])).toMatchObject({
            id: 'workout-1',
            name: 'Workout One',
            isFavorite: true,
        });
        expect(expectDefined(workouts[0]).blocks).toHaveLength(1);
        expect(expectDefined(workouts[1])).toMatchObject({
            id: 'workout-2',
            name: 'Workout Two',
            isFavorite: false,
        });
        expect(expectDefined(expectDefined(workouts[1]).blocks[0]).exercises)
            .toHaveLength(1);
    });
});

describe('workoutsByVersionIdFromDbRows', () => {
    it('hydrates workouts keyed by version id for session snapshot lookup', () => {
        const versions: WorkoutVersionRow[] = [
            {
                id: 'version-1',
                workoutId: null,
                name: 'Historical',
                updatedAtMs: 500,
            },
        ];
        const blocks: WorkoutBlockRow[] = [
            {
                id: 'block-1',
                workoutVersionId: 'version-1',
                sortIndex: 0,
                title: null,
                sets: 1,
                restBetweenSetsSec: 0,
                restBetweenExercisesSec: 0,
            },
        ];

        const workoutsByVersionId = workoutsByVersionIdFromDbRows(
            versions,
            blocks,
            []
        );

        expect(workoutsByVersionId.size).toBe(1);
        expect(workoutsByVersionId.get('version-1')).toEqual({
            id: 'version-1',
            name: 'Historical',
            updatedAtMs: 500,
            isFavorite: undefined,
            blocks: [
                {
                    id: 'block-1',
                    title: undefined,
                    sets: 1,
                    restBetweenSetsSec: 0,
                    restBetweenExercisesSec: 0,
                    exercises: [],
                },
            ],
        });
    });
});
