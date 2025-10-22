export type UUID = string;

/** Defines how an exercise is performed */
export type TimePace = { type: 'time'; workSec: number };
export type RepsPace = { type: 'reps'; reps: number; tempo?: string };
export type Pace = TimePace | RepsPace;

/** Minimal exercise model */
export interface Exercise {
    id: UUID;
    name: string;
    paceOverride?: Pace; // optional override when advanced mode is on
}

/** Defines the structure of a block (a circuit) */
export interface BlockScheme {
    sets: number;
    restBetweenSetsSec: number;
    restBetweenExercisesSec: number;
}

/** One workout block (circuit) */
export interface WorkoutBlock {
    id: UUID;
    title?: string;

    defaultPace: Pace; // applies to all exercises unless overridden
    scheme: BlockScheme; // sets + rests

    advanced?: boolean; // toggles per-exercise overrides
    exercises: Exercise[];
}

/** Whole workout */
export interface Workout {
    id: UUID;
    name: string;
    blocks: WorkoutBlock[];
}

/** Type guards */
export const isTimePace = (p: Pace): p is TimePace => p.type === 'time';
export const isRepsPace = (p: Pace): p is RepsPace => p.type === 'reps';
