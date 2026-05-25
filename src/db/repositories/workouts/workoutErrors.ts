import {
    isAppErrorCode,
    type AppError,
    type AppErrorDefinition,
} from '@src/core/errors/appError';

export const workoutErrors = {
    unnamedExercises: {
        code: 'UNNAMED_EXERCISES',
        message: 'Cannot save a workout with unnamed exercises',
    },
} as const satisfies Record<string, AppErrorDefinition<string>>;

export type WorkoutErrorCode =
    (typeof workoutErrors)[keyof typeof workoutErrors]['code'];

export interface WorkoutError extends AppError<WorkoutErrorCode> {}

export interface WorkoutErrorDefinition
    extends AppErrorDefinition<WorkoutErrorCode> {}

const workoutErrorCodes = Object.values(workoutErrors).map(
    (definition) => definition.code,
);

export const createWorkoutError = (
    definition: WorkoutErrorDefinition,
): WorkoutError =>
    Object.assign(new Error(definition.message), { code: definition.code });

export const isWorkoutError = (e: unknown): e is WorkoutError =>
    isAppErrorCode(e, workoutErrorCodes);
