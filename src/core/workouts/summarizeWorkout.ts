import type { Workout } from '@src/core/entities/entities';

export interface WorkoutSummary {
    blocks: number;
    exercises: number;
    hasReps: boolean;
    approxSec: number;
}

export const summarizeWorkout = (w: Workout | undefined): WorkoutSummary => {
    if (!w) {
        return { blocks: 0, exercises: 0, hasReps: false, approxSec: 0 };
    }

    let exercises = 0;
    let hasReps = false;
    let approxSec = 0;

    w.blocks.forEach((b) => {
        const L = b.exercises.length;
        exercises += L;

        // detect reps
        if (b.exercises.some((ex) => ex.mode === 'reps')) {
            hasReps = true;
        }

        // TIME ESTIMATE — only count time-mode exercises
        const timePerSet = b.exercises.reduce(
            (acc, ex, idx) =>
                acc +
                (ex.mode === 'time' ? ex.value : 0) +
                (idx < L - 1 ? b.restBetweenExercisesSec : 0),
            0
        );

        const totalForBlock =
            b.sets * timePerSet +
            Math.max(0, b.sets - 1) * b.restBetweenSetsSec;

        approxSec += totalForBlock;
    });

    return {
        blocks: w.blocks.length,
        exercises,
        hasReps,
        approxSec,
    };
};

export const formatWorkoutDuration = (sec: number): string => {
    const total = Math.max(0, Math.floor(sec));

    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    if (h > 0) {
        return `${h}h${m > 0 ? ` ${m}m` : ''}`;
    }

    if (m > 0) {
        return `${m}m${s > 0 ? ` ${s}s` : ''}`;
    }

    return `${s}s`;
};
