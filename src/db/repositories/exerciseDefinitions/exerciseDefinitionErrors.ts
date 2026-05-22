export type ExerciseDefinitionErrorCode =
    | 'DUPLICATE_NAME'
    | 'GYM_ONLY_RESTRICTED';

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
    (e.code === 'DUPLICATE_NAME' || e.code === 'GYM_ONLY_RESTRICTED');
