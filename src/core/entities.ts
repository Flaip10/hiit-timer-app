export type UUID = string;

export type PaceMode =
    | { type: 'time'; workSec: number }
    | { type: 'reps'; reps: number; tempo?: string };

export interface SetScheme {
    sets: number;
    restBetweenSetsSec: number;
}

export interface Exercise {
    id: UUID;
    name: string;
    pace: PaceMode;
    setScheme: SetScheme;
    notes?: string;
}

export interface WorkoutBlock {
    id: UUID;
    title?: string;
    exercises: Exercise[];
    restBetweenExercisesSec: number;
}

export interface Workout {
    id: UUID;
    name: string;
    blocks: WorkoutBlock[];
}
