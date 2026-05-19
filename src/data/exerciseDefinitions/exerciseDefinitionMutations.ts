import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
    ExerciseDefinition,
    ExerciseDefinitionAvailability,
} from '@src/core/entities/entities';
import { dbServices } from '@src/db/dbServices';

import { workoutSessionKeys } from '../workoutSessions';
import { workoutKeys } from '../workouts';
import { exerciseDefinitionKeys } from './exerciseDefinitionKeys';

export interface UpsertExerciseDefinitionArgs {
    availability?: ExerciseDefinitionAvailability;
    id?: string;
    name: string;
}

export const useUpsertExerciseDefinition = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            availability,
            id,
            name,
        }: UpsertExerciseDefinitionArgs): Promise<ExerciseDefinition | null> =>
            dbServices.exerciseDefinitionService.updateExerciseDefinition(
                {
                    availability,
                    id,
                    name,
                },
                id ? 'relink-existing' : 'create-new',
            ),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: exerciseDefinitionKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: workoutKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: workoutSessionKeys.all,
                }),
            ]);
        },
    });
};
