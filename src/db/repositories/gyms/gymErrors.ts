import {
    isAppErrorCode,
    type AppError,
    type AppErrorDefinition,
} from '@src/core/errors/appError';

export const gymErrors = {
    activeSessionExists: {
        code: 'ACTIVE_SESSION_EXISTS',
        message: 'An active gym session already exists',
    },
    activeSessionNotFound: {
        code: 'ACTIVE_SESSION_NOT_FOUND',
        message: 'Active gym session was not found',
    },
    exerciseDefinitionNotFound: {
        code: 'EXERCISE_DEFINITION_NOT_FOUND',
        message: 'Exercise definition was not found',
    },
    exerciseDefinitionNotGymAvailable: {
        code: 'EXERCISE_DEFINITION_NOT_GYM_AVAILABLE',
        message: 'Exercise definition is not available for gym sessions',
    },
    exerciseRecordNotFound: {
        code: 'EXERCISE_RECORD_NOT_FOUND',
        message: 'Gym exercise record was not found',
    },
    exerciseRecordNotInActiveSession: {
        code: 'EXERCISE_RECORD_NOT_IN_ACTIVE_SESSION',
        message: 'Gym exercise record is not in an active session',
    },
    exerciseSetNotFound: {
        code: 'EXERCISE_SET_NOT_FOUND',
        message: 'Gym exercise record set was not found',
    },
    invalidGymExerciseRecordTimeRange: {
        code: 'INVALID_GYM_EXERCISE_RECORD',
        message: 'Gym exercise record cannot complete before it starts',
    },
    invalidGymSessionTimeRange: {
        code: 'INVALID_GYM_SESSION',
        message: 'Gym session cannot end before it starts',
    },
    invalidGymSet: {
        code: 'INVALID_GYM_SET',
        message: 'Gym set must include reps, weight, duration, or distance',
    },
    sessionNotFound: {
        code: 'SESSION_NOT_FOUND',
        message: 'Gym session was not found',
    },
    sessionNotMutable: {
        code: 'SESSION_NOT_MUTABLE',
        message: 'Gym session is not active',
    },
} as const satisfies Record<string, AppErrorDefinition<string>>;

export type GymErrorCode =
    (typeof gymErrors)[keyof typeof gymErrors]['code'];

export interface GymError extends AppError<GymErrorCode> {}

export interface GymErrorDefinition extends AppErrorDefinition<GymErrorCode> {}

const gymErrorCodes = Object.values(gymErrors).map(
    (definition) => definition.code,
);

export const createGymError = (definition: GymErrorDefinition): GymError =>
    Object.assign(new Error(definition.message), { code: definition.code });

export const isGymError = (e: unknown): e is GymError =>
    isAppErrorCode(e, gymErrorCodes);
