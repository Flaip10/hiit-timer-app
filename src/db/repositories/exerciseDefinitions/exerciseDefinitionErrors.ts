export type ExerciseDefinitionErrorCode =
    | 'DELETE_REFERENCED'
    | 'DELETE_SYSTEM_FORBIDDEN'
    | 'DUPLICATE_NAME'
    | 'GYM_ONLY_RESTRICTED'
    | 'MERGE_GYM_ONLY_CONFLICT';

export interface ExerciseDefinitionError extends Error {
    readonly code: ExerciseDefinitionErrorCode;
}

export const buildExerciseDefinitionError = (
    code: ExerciseDefinitionErrorCode,
    message: string,
): ExerciseDefinitionError => Object.assign(new Error(message), { code });

export const isExerciseDefinitionError = (
    e: unknown,
): e is ExerciseDefinitionError =>
    e instanceof Error &&
    'code' in e &&
    (e.code === 'DELETE_REFERENCED' ||
        e.code === 'DELETE_SYSTEM_FORBIDDEN' ||
        e.code === 'DUPLICATE_NAME' ||
        e.code === 'GYM_ONLY_RESTRICTED' ||
        e.code === 'MERGE_GYM_ONLY_CONFLICT');
