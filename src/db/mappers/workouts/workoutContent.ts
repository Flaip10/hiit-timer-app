import type {
    Workout,
    WorkoutBlock,
    WorkoutExercise,
} from '@src/core/entities/entities';

interface CanonicalExerciseContent {
    exerciseDefinitionId?: string;
    name?: string;
    mode: WorkoutExercise['mode'];
    value: number;
    tempo?: string;
}

interface CanonicalBlockContent {
    title?: string;
    sets: number;
    restBetweenSetsSec: number;
    restBetweenExercisesSec: number;
    exercises: CanonicalExerciseContent[];
}

interface CanonicalWorkoutContent {
    blocks: CanonicalBlockContent[];
}

const canonicalExerciseContent = (
    exercise: WorkoutExercise
): CanonicalExerciseContent => ({
    exerciseDefinitionId: exercise.exerciseDefinitionId,
    name: exercise.exerciseDefinitionId ? undefined : exercise.name,
    mode: exercise.mode,
    value: exercise.value,
    tempo: exercise.tempo,
});

const canonicalBlockContent = (block: WorkoutBlock): CanonicalBlockContent => ({
    title: block.title,
    sets: block.sets,
    restBetweenSetsSec: block.restBetweenSetsSec,
    restBetweenExercisesSec: block.restBetweenExercisesSec,
    exercises: block.exercises.map(canonicalExerciseContent),
});

const canonicalWorkoutContent = (workout: Workout): CanonicalWorkoutContent => ({
    blocks: workout.blocks.map(canonicalBlockContent),
});

export const hasSameWorkoutContent = (
    left: Workout,
    right: Workout
): boolean =>
    JSON.stringify(canonicalWorkoutContent(left)) ===
    JSON.stringify(canonicalWorkoutContent(right));

export const createWorkoutContentKey = (workout: Workout): string =>
    JSON.stringify(canonicalWorkoutContent(workout));
