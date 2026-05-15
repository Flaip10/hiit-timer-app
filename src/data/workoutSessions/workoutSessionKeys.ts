export const workoutSessionKeys = {
    all: ['workoutSessions'] as const,
    recent: (limit: number) => ['workoutSessions', 'recent', limit] as const,
    detail: (id?: string) => ['workoutSessions', id] as const,
};
