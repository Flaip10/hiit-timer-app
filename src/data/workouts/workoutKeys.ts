export const workoutKeys = {
    all: ['workouts'] as const,
    detail: (id: string) => ['workouts', id] as const,
    currentVersionId: (id: string) =>
        ['workouts', id, 'currentVersionId'] as const,
};
