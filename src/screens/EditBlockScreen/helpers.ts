import type { WorkoutBlock } from '@src/core/entities/entities';
import { uid } from '@core/id';

export interface BlockValidationError {
    key:
        | 'setsMin'
        | 'exercisesMin'
        | 'exerciseDurationMin'
        | 'exerciseRepsMin';
    exerciseIndex?: number;
}

// Parse a string/number → non-negative integer
export const toPosInt = (s: string | number, fallback = 0): number => {
    const n = typeof s === 'number' ? s : parseInt(String(s), 10);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
};

// Ensure block has exactly N exercises
export const ensureExerciseCount = (
    block: WorkoutBlock,
    count: number
): WorkoutBlock => {
    const next: WorkoutBlock = { ...block, exercises: [...block.exercises] };

    while (next.exercises.length < count) {
        next.exercises.push({
            id: uid(),
            mode: 'time',
            value: 20,
        });
    }

    while (next.exercises.length > count) {
        next.exercises.pop();
    }

    return next;
};

// Override ALL exercise durations (value)
// Called when user edits the "duration" stepper
export const applyDurationToAll = (
    block: WorkoutBlock,
    sec: number
): WorkoutBlock => {
    return {
        ...block,
        exercises: block.exercises.map((ex) => ({
            ...ex,
            mode: 'time',
            value: sec,
        })),
    };
};

// Block-level validation rules
export const validateBlock = (
    block: WorkoutBlock | null
): BlockValidationError[] => {
    if (!block) return [];
    const errors: BlockValidationError[] = [];

    if (block.sets <= 0) {
        errors.push({ key: 'setsMin' });
    }

    if (block.exercises.length === 0) {
        errors.push({ key: 'exercisesMin' });
    }

    block.exercises.forEach((ex, ei) => {
        if (ex.mode === 'time' && ex.value <= 0) {
            errors.push({
                key: 'exerciseDurationMin',
                exerciseIndex: ei + 1,
            });
        }

        if (ex.mode === 'reps' && ex.value <= 0) {
            errors.push({
                key: 'exerciseRepsMin',
                exerciseIndex: ei + 1,
            });
        }
    });

    return errors;
};
