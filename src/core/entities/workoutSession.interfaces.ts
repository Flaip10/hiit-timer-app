import { Workout } from './entities';

export interface WorkoutSessionStats {
    completedSets: number;
    completedExercises: number;

    totalWorkSec: number;
    totalRestSec: number;

    totalPausedSec?: number;
    totalBlockPauseSec?: number;

    completedSetsByBlock?: number[];
    completedExercisesByBlock?: number[];
    workSecByBlock?: number[];
    restSecByBlock?: number[];
}

export interface WorkoutSession {
    id: string;

    startedAtMs: number;
    endedAtMs: number;

    workoutSnapshot: Workout;
    workoutId?: string;
    workoutNameSnapshot?: string;

    totalDurationSec?: number;

    stats?: WorkoutSessionStats;
}
