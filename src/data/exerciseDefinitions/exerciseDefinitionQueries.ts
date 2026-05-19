import { useQuery } from '@tanstack/react-query';

import { dbServices } from '@src/db/dbServices';
import type { ExerciseDefinitionListParams } from '@src/db/services/exerciseDefinitions/exerciseDefinitionServiceFactory';

import { exerciseDefinitionKeys } from './exerciseDefinitionKeys';

export const useExerciseDefinitions = (
    params?: ExerciseDefinitionListParams,
) =>
    useQuery({
        queryKey: exerciseDefinitionKeys.list(params),
        queryFn: () => dbServices.exerciseDefinitionService.list(params),
        initialData: () =>
            dbServices.exerciseDefinitionService.list(params),
    });
