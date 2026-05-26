export const gymSessionKeys = {
    all: ['gymSessions'] as const,
    active: () => ['gymSessions', 'active'] as const,
    exerciseRecord: (id?: string) =>
        ['gymSessions', 'exerciseRecord', id ?? ''] as const,
    exerciseRecordSets: (recordId?: string) =>
        ['gymSessions', 'exerciseRecord', recordId ?? '', 'sets'] as const,
    availableExerciseDefinitions: (name?: string) =>
        ['gymSessions', 'availableExerciseDefinitions', name ?? ''] as const,
};
