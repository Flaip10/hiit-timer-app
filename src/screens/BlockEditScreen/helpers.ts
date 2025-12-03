import type { WorkoutBlock } from '@core/entities';
import { uid } from '@core/id';

// Parse a string/number → non-negative integer
export const toPosInt = (s: string | number, fallback = 0): number => {
    const n = typeof s === 'number' ? s : parseInt(String(s ?? ''), 10);
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
            name: `Exercise ${next.exercises.length + 1}`,
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
export const validateBlock = (block: WorkoutBlock | null): string[] => {
    if (!block) return [];
    const errs: string[] = [];

    if (block.sets <= 0) {
        errs.push('Sets must be greater than zero.');
    }

    if (block.exercises.length === 0) {
        errs.push('Add at least one exercise.');
    }

    block.exercises.forEach((ex, ei) => {
        if (!ex.name.trim()) {
            errs.push(`Exercise ${ei + 1}: name is required.`);
        }

        if (ex.mode === 'time' && ex.value <= 0) {
            errs.push(`Exercise ${ei + 1}: duration must be > 0 seconds.`);
        }

        if (ex.mode === 'reps' && ex.value <= 0) {
            errs.push(`Exercise ${ei + 1}: reps must be > 0.`);
        }
    });

    return errs;
};
