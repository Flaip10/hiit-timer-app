import type { ExerciseDefinitionListParams } from '@src/db/services/exerciseDefinitions/exerciseDefinitionServiceFactory';

export const exerciseDefinitionKeys = {
    all: ['exerciseDefinitions'] as const,
    detail: (id?: string) => ['exerciseDefinitions', id] as const,
    list: (params?: ExerciseDefinitionListParams) =>
        ['exerciseDefinitions', params] as const,
};
