export type WorkoutErrorCode = 'UNNAMED_EXERCISES';

export interface WorkoutError extends Error {
    readonly code: WorkoutErrorCode;
}

export const buildWorkoutError = (
    code: WorkoutErrorCode,
    message: string,
): WorkoutError => Object.assign(new Error(message), { code });

export const isWorkoutError = (e: unknown): e is WorkoutError =>
    e instanceof Error && 'code' in e && e.code === 'UNNAMED_EXERCISES';
