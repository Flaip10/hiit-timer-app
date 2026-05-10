import type {
    Exercise,
    ExerciseMode,
    Workout,
    WorkoutBlock,
} from '@src/core/entities/entities';
import type {
    WorkoutSession,
    WorkoutSessionStats,
} from '@src/core/entities/workoutSession.interfaces';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string =>
    typeof value === 'string';

const isNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

const isStringArray = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every(isString);

const isNumberArray = (value: unknown): value is number[] =>
    Array.isArray(value) && value.every(isNumber);

const isExerciseMode = (value: unknown): value is ExerciseMode =>
    value === 'time' || value === 'reps';

export const isExercise = (value: unknown): value is Exercise => {
    if (!isRecord(value)) return false;
    if (!isString(value.id)) return false;
    if (!isExerciseMode(value.mode)) return false;
    if (!isNumber(value.value)) return false;
    if (value.name !== undefined && !isString(value.name)) return false;
    if (value.tempo !== undefined && !isString(value.tempo)) return false;

    return true;
};

export const isWorkoutBlock = (value: unknown): value is WorkoutBlock => {
    if (!isRecord(value)) return false;
    if (!isString(value.id)) return false;
    if (value.title !== undefined && !isString(value.title)) return false;
    if (!isNumber(value.sets)) return false;
    if (!isNumber(value.restBetweenSetsSec)) return false;
    if (!isNumber(value.restBetweenExercisesSec)) return false;
    if (!Array.isArray(value.exercises)) return false;

    return value.exercises.every(isExercise);
};

export const isWorkout = (value: unknown): value is Workout => {
    if (!isRecord(value)) return false;
    if (!isString(value.id)) return false;
    if (!isString(value.name)) return false;
    if (!isNumber(value.updatedAtMs)) return false;
    if (value.isFavorite !== undefined && typeof value.isFavorite !== 'boolean') {
        return false;
    }
    if (!Array.isArray(value.blocks)) return false;

    return value.blocks.every(isWorkoutBlock);
};

export const isWorkoutSessionStats = (
    value: unknown
): value is WorkoutSessionStats => {
    if (!isRecord(value)) return false;
    if (!isNumber(value.completedSets)) return false;
    if (!isNumber(value.completedExercises)) return false;
    if (!isNumber(value.totalWorkSec)) return false;
    if (!isNumber(value.totalRestSec)) return false;

    if (value.totalPrepSec !== undefined && !isNumber(value.totalPrepSec)) {
        return false;
    }
    if (value.totalPausedSec !== undefined && !isNumber(value.totalPausedSec)) {
        return false;
    }
    if (
        value.totalBlockPauseSec !== undefined &&
        !isNumber(value.totalBlockPauseSec)
    ) {
        return false;
    }
    if (
        value.completedSetsByBlock !== undefined &&
        !isNumberArray(value.completedSetsByBlock)
    ) {
        return false;
    }
    if (
        value.completedExercisesByBlock !== undefined &&
        !isNumberArray(value.completedExercisesByBlock)
    ) {
        return false;
    }
    if (value.workSecByBlock !== undefined && !isNumberArray(value.workSecByBlock)) {
        return false;
    }
    if (value.restSecByBlock !== undefined && !isNumberArray(value.restSecByBlock)) {
        return false;
    }
    if (value.prepSecByBlock !== undefined && !isNumberArray(value.prepSecByBlock)) {
        return false;
    }

    return true;
};

export const isWorkoutSession = (value: unknown): value is WorkoutSession => {
    if (!isRecord(value)) return false;
    if (!isString(value.id)) return false;
    if (!isNumber(value.startedAtMs)) return false;
    if (!isNumber(value.endedAtMs)) return false;
    if (!isWorkout(value.workoutSnapshot)) return false;
    if (value.workoutId !== undefined && !isString(value.workoutId)) return false;
    if (
        value.workoutNameSnapshot !== undefined &&
        !isString(value.workoutNameSnapshot)
    ) {
        return false;
    }
    if (
        value.totalDurationSec !== undefined &&
        !isNumber(value.totalDurationSec)
    ) {
        return false;
    }
    if (value.stats !== undefined && !isWorkoutSessionStats(value.stats)) {
        return false;
    }

    return true;
};

export const isStringList = (value: unknown): value is string[] =>
    isStringArray(value);
