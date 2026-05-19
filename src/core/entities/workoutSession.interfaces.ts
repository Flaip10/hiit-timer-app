import type { Workout } from './entities';

export interface WorkoutSessionStats {
    completedSets: number;
    completedExercises: number;

    totalWorkSec: number;
    totalRestSec: number;
    totalPrepSec?: number;

    totalPausedSec?: number;
    totalBlockPauseSec?: number;

    completedSetsByBlock?: number[];
    completedExercisesByBlock?: number[];
    workSecByBlock?: number[];
    restSecByBlock?: number[];
    prepSecByBlock?: number[];
}

export interface WorkoutSession {
    id: string;

    startedAtMs: number;
    endedAtMs: number;

    workoutSnapshot: Workout;
    activeWorkoutId?: string;
    workoutVersionId: string;

    totalDurationSec?: number;

    stats?: WorkoutSessionStats;
}
