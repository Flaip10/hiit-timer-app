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
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m${s ? ` ${s}s` : ''}` : `${s}s`;
};
