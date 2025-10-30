import { isRepsPace, isTimePace, type Workout } from '@core/entities';

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

        const sets = Math.max(0, b.scheme.sets);
        const restSet = b.scheme.restBetweenSetsSec;
        const restEx = b.scheme.restBetweenExercisesSec;

        // base pace
        const baseTime = isTimePace(b.defaultPace) ? b.defaultPace.workSec : 0;

        // detect reps anywhere
        if (isRepsPace(b.defaultPace)) hasReps = true;
        b.exercises.forEach((ex) => {
            if (ex.paceOverride && isRepsPace(ex.paceOverride)) {
                hasReps = true;
            }
        });

        // rough time (only for timed parts)
        const timedPerExercise = isTimePace(b.defaultPace) ? baseTime : 0;
        const timedPerSet = timedPerExercise * L + Math.max(0, L - 1) * restEx;
        const totalForBlock =
            sets * timedPerSet + Math.max(0, sets - 1) * restSet;

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
