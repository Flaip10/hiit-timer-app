export type UUID = string;

// Discriminated union for pace
export type TimePace = { type: 'time'; workSec: number };
export type RepsPace = { type: 'reps'; reps: number; tempo?: string };

// Rename PaceMode → Pace (clearer)
export type Pace = TimePace | RepsPace;

export interface SetScheme {
    sets: number;
    restBetweenSetsSec: number;
}

export interface Exercise {
    id: UUID;
    name: string;
    pace: Pace;
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

// Type guards (use these to narrow)
export const isTimePace = (p: Pace): p is TimePace => p.type === 'time';
export const isRepsPace = (p: Pace): p is RepsPace => p.type === 'reps';
