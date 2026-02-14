export type UUID = string;

/**
 * - 'time' → value is seconds
 * - 'reps' → value is reps (tempo may optionally describe cadence)
 */
export type ExerciseMode = 'time' | 'reps';

/**
 * Option 1:
 *   mode: 'time'
 *   value: <seconds>
 *
 * Option 2:
 *   mode: 'reps'
 *   value: <reps>
 *   tempo?: '3-1-3' | '2-0-2' | string
 */
export interface Exercise {
    id: UUID;
    name?: string;

    mode: ExerciseMode;

    /**
     * When mode === 'time' → value is duration in seconds.
     * When mode === 'reps' → value is number of reps.
     */
    value: number;

    /**
     * Optional tempo / cadence for reps (ignored for time mode).
     */
    tempo?: string;
}
export interface WorkoutBlock {
    id: UUID;
    title?: string;

    sets: number;
    restBetweenSetsSec: number;
    restBetweenExercisesSec: number;

    exercises: Exercise[];
}

export interface Workout {
    id: UUID;
    name: string;
    blocks: WorkoutBlock[];
    updatedAtMs: number;
    isFavorite?: boolean;
}
