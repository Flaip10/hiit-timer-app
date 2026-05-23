import { describe, expect, it } from '@jest/globals';

import {
    groupExercisesByBlockId,
    workoutFromDbRows,
    workoutsByVersionIdFromDbRows,
    workoutsFromDbRows,
    workoutToVersionDbRows,
    type WorkoutBlockDbRow,
    type WorkoutExerciseWithDefinitionRow,
    type WorkoutVersionDbRow,
    type WorkoutVersionWithActiveWorkoutRow,
    type WorkoutWithCurrentVersionRow,
} from '@src/db/mappers/workouts/workoutMapper';
import { createWorkoutFixture } from '../../../fixtures/workouts';

const expectDefined = <Value>(value: Value | undefined): Value => {
    expect(value).toBeDefined();
    if (value === undefined) {
        throw new Error('Expected defined value');
    }

    return value;
};

describe('workoutToVersionDbRows', () => {
    it('maps runtime workout content to immutable version rows with fresh content IDs', () => {
        const workout = createWorkoutFixture();
        const srcBlock1 = expectDefined(workout.blocks[0]);
        const srcBlock2 = expectDefined(workout.blocks[1]);
        const srcEx1 = expectDefined(srcBlock1.exercises[0]);
        const srcEx2 = expectDefined(srcBlock2.exercises[0]);
        const srcEx3 = expectDefined(srcBlock2.exercises[1]);

        const rows = workoutToVersionDbRows(workout, 'version-1');

        expect(rows.version).toEqual({
            id: 'version-1',
            name: workout.name,
            updatedAtMs: workout.updatedAtMs,
        });

        const totalExercises = workout.blocks.reduce(
            (sum, b) => sum + b.exercises.length,
            0,
        );
        expect(rows.blocks).toHaveLength(workout.blocks.length);
        expect(rows.exercises).toHaveLength(totalExercises);

        const firstBlock = expectDefined(rows.blocks[0]);
        const secondBlock = expectDefined(rows.blocks[1]);
        const firstExercise = expectDefined(rows.exercises[0]);
        const secondExercise = expectDefined(rows.exercises[1]);
        const thirdExercise = expectDefined(rows.exercises[2]);

        expect(firstBlock.id).not.toBe(srcBlock1.id);
        expect(secondBlock.id).not.toBe(srcBlock2.id);
        expect(firstBlock.id).not.toBe(secondBlock.id);

        expect(firstBlock).toMatchObject({
            workoutVersionId: 'version-1',
            sortIndex: 0,
            title: srcBlock1.title ?? null,
            sets: srcBlock1.sets,
            restBetweenSetsSec: srcBlock1.restBetweenSetsSec,
            restBetweenExercisesSec: srcBlock1.restBetweenExercisesSec,
        });
        expect(secondBlock).toMatchObject({
            workoutVersionId: 'version-1',
            sortIndex: 1,
            title: srcBlock2.title ?? null,
            sets: srcBlock2.sets,
            restBetweenSetsSec: srcBlock2.restBetweenSetsSec,
            restBetweenExercisesSec: srcBlock2.restBetweenExercisesSec,
        });

        expect(firstExercise.id).not.toBe(srcEx1.id);
        expect(firstExercise).toMatchObject({
            blockId: firstBlock.id,
            sortIndex: 0,
            exerciseDefinitionId: srcEx1.exerciseDefinitionId ?? null,
            mode: srcEx1.mode,
            value: srcEx1.value,
            tempo: srcEx1.tempo ?? null,
        });
        expect(secondExercise).toMatchObject({
            blockId: secondBlock.id,
            sortIndex: 0,
            exerciseDefinitionId: srcEx2.exerciseDefinitionId ?? null,
            mode: srcEx2.mode,
            value: srcEx2.value,
            tempo: srcEx2.tempo ?? null,
        });
        expect(thirdExercise).toMatchObject({
            blockId: secondBlock.id,
            sortIndex: 1,
            exerciseDefinitionId: srcEx3.exerciseDefinitionId ?? null,
            mode: srcEx3.mode,
            value: srcEx3.value,
            tempo: srcEx3.tempo ?? null,
        });
    });
});

describe('workoutFromDbRows', () => {
    it('hydrates a workout from rows sorted by sort index', () => {
        const version: WorkoutVersionDbRow = {
            id: 'version-1',
            name: 'Strength',
            updatedAtMs: 200,
        };
        const blockFirst: WorkoutBlockDbRow = {
            id: 'block-1',
            workoutVersionId: version.id,
            sortIndex: 0,
            title: 'First',
            sets: 1,
            restBetweenSetsSec: 0,
            restBetweenExercisesSec: 10,
        };
        const blockSecond: WorkoutBlockDbRow = {
            id: 'block-2',
            workoutVersionId: version.id,
            sortIndex: 1,
            title: null,
            sets: 2,
            restBetweenSetsSec: 45,
            restBetweenExercisesSec: 15,
        };
        const ex1: WorkoutExerciseWithDefinitionRow = {
            id: 'exercise-1',
            blockId: blockFirst.id,
            sortIndex: 0,
            exerciseDefinitionId: null,
            exerciseDefinitionName: 'High Knees',
            mode: 'time',
            value: 30,
            tempo: null,
        };
        const ex2: WorkoutExerciseWithDefinitionRow = {
            id: 'exercise-2',
            blockId: blockFirst.id,
            sortIndex: 1,
            exerciseDefinitionId: null,
            exerciseDefinitionName: null,
            mode: 'time',
            value: 20,
            tempo: null,
        };
        const exercisesByBlockId = groupExercisesByBlockId([ex2, ex1]);

        const workout = workoutFromDbRows(
            version,
            [blockSecond, blockFirst],
            exercisesByBlockId,
            { workoutId: 'active-workout-1', isFavorite: false },
        );

        expect(workout).toEqual({
            id: 'active-workout-1',
            name: version.name,
            updatedAtMs: version.updatedAtMs,
            isFavorite: false,
            blocks: [
                {
                    id: blockFirst.id,
                    title: blockFirst.title ?? undefined,
                    sets: blockFirst.sets,
                    restBetweenSetsSec: blockFirst.restBetweenSetsSec,
                    restBetweenExercisesSec: blockFirst.restBetweenExercisesSec,
                    exercises: [
                        {
                            id: ex1.id,
                            name: ex1.exerciseDefinitionName ?? undefined,
                            exerciseDefinitionId: ex1.exerciseDefinitionId ?? undefined,
                            mode: ex1.mode,
                            value: ex1.value,
                            tempo: ex1.tempo ?? undefined,
                        },
                        {
                            id: ex2.id,
                            name: ex2.exerciseDefinitionName ?? undefined,
                            exerciseDefinitionId: ex2.exerciseDefinitionId ?? undefined,
                            mode: ex2.mode,
                            value: ex2.value,
                            tempo: ex2.tempo ?? undefined,
                        },
                    ],
                },
                {
                    id: blockSecond.id,
                    title: blockSecond.title ?? undefined,
                    sets: blockSecond.sets,
                    restBetweenSetsSec: blockSecond.restBetweenSetsSec,
                    restBetweenExercisesSec: blockSecond.restBetweenExercisesSec,
                    exercises: [],
                },
            ],
        });
    });
});

describe('workoutsFromDbRows', () => {
    it('hydrates active workouts from joined workout and version rows', () => {
        const row1: WorkoutWithCurrentVersionRow = {
            workouts: {
                id: 'workout-1',
                name: 'Workout One',
                currentVersionId: 'version-1',
                createdAtMs: 100,
                isFavorite: true,
                sortIndex: 0,
            },
            workout_versions: {
                id: 'version-1',
                name: 'Workout One',
                updatedAtMs: 300,
            },
        };
        const row2: WorkoutWithCurrentVersionRow = {
            workouts: {
                id: 'workout-2',
                name: 'Workout Two',
                currentVersionId: 'version-2',
                createdAtMs: 200,
                isFavorite: false,
                sortIndex: 1,
            },
            workout_versions: {
                id: 'version-2',
                name: 'Workout Two',
                updatedAtMs: 400,
            },
        };
        const block1: WorkoutBlockDbRow = {
            id: 'block-1',
            workoutVersionId: row1.workout_versions.id,
            sortIndex: 0,
            title: 'Block One',
            sets: 1,
            restBetweenSetsSec: 0,
            restBetweenExercisesSec: 0,
        };
        const block2: WorkoutBlockDbRow = {
            id: 'block-2',
            workoutVersionId: row2.workout_versions.id,
            sortIndex: 0,
            title: 'Block Two',
            sets: 2,
            restBetweenSetsSec: 30,
            restBetweenExercisesSec: 15,
        };
        const exercises: WorkoutExerciseWithDefinitionRow[] = [
            {
                id: 'exercise-1',
                blockId: block2.id,
                sortIndex: 0,
                exerciseDefinitionId: null,
                exerciseDefinitionName: 'Plank',
                mode: 'time',
                value: 60,
                tempo: null,
            },
        ];

        const workouts = workoutsFromDbRows([row1, row2], [block1, block2], exercises);

        expect(workouts).toHaveLength(2);
        expect(expectDefined(workouts[0])).toMatchObject({
            id: row1.workouts.id,
            name: row1.workouts.name,
            isFavorite: row1.workouts.isFavorite,
        });
        expect(expectDefined(workouts[0]).blocks).toHaveLength(
            [block1, block2].filter(b => b.workoutVersionId === row1.workout_versions.id).length,
        );
        expect(expectDefined(workouts[1])).toMatchObject({
            id: row2.workouts.id,
            name: row2.workouts.name,
            isFavorite: row2.workouts.isFavorite,
        });
        expect(expectDefined(expectDefined(workouts[1]).blocks[0]).exercises).toHaveLength(
            exercises.filter(e => e.blockId === block2.id).length,
        );
    });
});

describe('workoutsByVersionIdFromDbRows', () => {
    it('hydrates workouts keyed by version id for session snapshot lookup', () => {
        const row: WorkoutVersionWithActiveWorkoutRow = {
            workouts: null,
            workout_versions: {
                id: 'version-1',
                name: 'Historical',
                updatedAtMs: 500,
            },
        };
        const block: WorkoutBlockDbRow = {
            id: 'block-1',
            workoutVersionId: row.workout_versions.id,
            sortIndex: 0,
            title: null,
            sets: 1,
            restBetweenSetsSec: 0,
            restBetweenExercisesSec: 0,
        };

        const workoutsByVersionId = workoutsByVersionIdFromDbRows([row], [block], []);

        expect(workoutsByVersionId.size).toBe(1);
        expect(workoutsByVersionId.get(row.workout_versions.id)).toEqual({
            id: row.workout_versions.id,
            name: row.workout_versions.name,
            updatedAtMs: row.workout_versions.updatedAtMs,
            isFavorite: undefined,
            blocks: [
                {
                    id: block.id,
                    title: block.title ?? undefined,
                    sets: block.sets,
                    restBetweenSetsSec: block.restBetweenSetsSec,
                    restBetweenExercisesSec: block.restBetweenExercisesSec,
                    exercises: [],
                },
            ],
        });
    });
});
