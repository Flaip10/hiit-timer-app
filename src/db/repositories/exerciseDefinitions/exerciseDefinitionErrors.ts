import {
    isAppErrorCode,
    type AppError,
    type AppErrorDefinition,
} from '@src/core/errors/appError';

export const exerciseDefinitionErrors = {
    deleteReferenced: {
        code: 'DELETE_REFERENCED',
        message: 'Cannot delete referenced exercise definition',
    },
    deleteSystemForbidden: {
        code: 'DELETE_SYSTEM_FORBIDDEN',
        message: 'Cannot delete system exercise definition',
    },
    duplicateName: {
        code: 'DUPLICATE_NAME',
        message: 'Exercise definition already exists',
    },
    gymOnlyRestricted: {
        code: 'GYM_ONLY_RESTRICTED',
        message: 'Cannot make workout-referenced exercise definition gym-only',
    },
    mergeGymOnlyConflict: {
        code: 'MERGE_GYM_ONLY_CONFLICT',
        message:
            'Cannot merge workout-referenced exercise definition into gym-only definition',
    },
} as const satisfies Record<string, AppErrorDefinition<string>>;

export type ExerciseDefinitionErrorCode =
    (typeof exerciseDefinitionErrors)[keyof typeof exerciseDefinitionErrors]['code'];

export interface ExerciseDefinitionError
    extends AppError<ExerciseDefinitionErrorCode> {}

export interface ExerciseDefinitionErrorDefinition
    extends AppErrorDefinition<ExerciseDefinitionErrorCode> {}

const exerciseDefinitionErrorCodes = Object.values(
    exerciseDefinitionErrors,
).map((definition) => definition.code);

export const createExerciseDefinitionError = (
    definition: ExerciseDefinitionErrorDefinition,
    message: string = definition.message,
): ExerciseDefinitionError =>
    Object.assign(new Error(message), { code: definition.code });

export const isExerciseDefinitionError = (
    e: unknown,
): e is ExerciseDefinitionError =>
    isAppErrorCode(e, exerciseDefinitionErrorCodes);
