export const workoutKeys = {
    all: ['workouts'] as const,
    detail: (id: string) => ['workouts', id] as const,
};
