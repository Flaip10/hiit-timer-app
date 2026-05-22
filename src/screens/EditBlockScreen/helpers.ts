import type { WorkoutBlock } from '@src/core/entities/entities';
import { uid } from '@core/id';

export type BlockValidationTargetId = 'setup' | `exercise:${string}`;

export interface BlockValidationError {
    key:
        | 'setsMin'
        | 'exercisesMin'
        | 'exerciseNameRequired'
        | 'exerciseDurationMin'
        | 'exerciseRepsMin';
    exerciseIndex?: number;
    targetId: BlockValidationTargetId;
}

export interface ValidateBlockOptions {
    shouldRequireExerciseNames?: boolean;
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
    block: WorkoutBlock | null,
    options: ValidateBlockOptions = {},
): BlockValidationError[] => {
    if (!block) return [];
    const errors: BlockValidationError[] = [];

    if (block.sets <= 0) {
        errors.push({
            key: 'setsMin',
            targetId: 'setup',
        });
    }

    if (block.exercises.length === 0) {
        errors.push({
            key: 'exercisesMin',
            targetId: 'setup',
        });
    }

    block.exercises.forEach((ex, ei) => {
        const hasDefinition = !!ex.exerciseDefinitionId;
        const hasName =
            ex.name !== undefined && ex.name.trim().length > 0;

        if (
            options.shouldRequireExerciseNames === true &&
            !hasDefinition &&
            !hasName
        ) {
            errors.push({
                key: 'exerciseNameRequired',
                exerciseIndex: ei + 1,
                targetId: `exercise:${ex.id}`,
            });
        }

        if (ex.mode === 'time' && ex.value <= 0) {
            errors.push({
                key: 'exerciseDurationMin',
                exerciseIndex: ei + 1,
                targetId: `exercise:${ex.id}`,
            });
        }

        if (ex.mode === 'reps' && ex.value <= 0) {
            errors.push({
                key: 'exerciseRepsMin',
                exerciseIndex: ei + 1,
                targetId: `exercise:${ex.id}`,
            });
        }
    });

    return errors;
};
