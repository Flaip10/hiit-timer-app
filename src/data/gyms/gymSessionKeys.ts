export const gymSessionKeys = {
    all: ['gymSessions'] as const,
    active: () => ['gymSessions', 'active'] as const,
};
