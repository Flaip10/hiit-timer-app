import { useQuery } from '@tanstack/react-query';

import type { ExerciseDefinition } from '@src/core/entities/entities';
import { dbServices } from '@src/db/dbServices';
import type { ExerciseDefinitionListParams } from '@src/db/services/exerciseDefinitions/exerciseDefinitionServiceFactory';

import { exerciseDefinitionKeys } from './exerciseDefinitionKeys';

interface UseExerciseDefinitionsOptions {
    enabled?: boolean;
}

export const useExerciseDefinitions = (
    params?: ExerciseDefinitionListParams,
    options: UseExerciseDefinitionsOptions = {},
) =>
    useQuery({
        queryKey: exerciseDefinitionKeys.list(params),
        queryFn: () => dbServices.exerciseDefinitionService.list(params),
        enabled: options.enabled ?? true,
        initialData: (): ExerciseDefinition[] =>
            options.enabled === false
                ? []
                : dbServices.exerciseDefinitionService.list(params),
    });

export const useExerciseDefinition = (id?: string) =>
    useQuery({
        queryKey: exerciseDefinitionKeys.detail(id),
        queryFn: () =>
            id ? dbServices.exerciseDefinitionService.getById(id) : null,
        enabled: !!id,
        initialData: () =>
            id ? dbServices.exerciseDefinitionService.getById(id) : null,
    });
