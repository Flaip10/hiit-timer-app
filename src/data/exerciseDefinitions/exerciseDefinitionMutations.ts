import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
    ExerciseDefinition,
    ExerciseDefinitionAvailability,
} from '@src/core/entities/entities';
import { dbServices } from '@src/db/dbServices';

import { workoutSessionKeys } from '../workoutSessions';
import { workoutKeys } from '../workouts/workoutKeys';
import { exerciseDefinitionKeys } from './exerciseDefinitionKeys';

export interface CreateExerciseDefinitionMutationArgs {
    availability?: ExerciseDefinitionAvailability;
    intent: 'create';
    name: string;
}

export interface UpdateExerciseDefinitionChanges {
    availability?: ExerciseDefinitionAvailability;
    name?: string;
}

export interface UpdateExerciseDefinitionMutationArgs {
    changes: UpdateExerciseDefinitionChanges;
    id: string;
    intent: 'update';
}

export interface MergeExerciseDefinitionMutationArgs {
    intent: 'merge';
    sourceId: string;
    targetId: string;
}

export type SaveExerciseDefinitionArgs =
    | CreateExerciseDefinitionMutationArgs
    | UpdateExerciseDefinitionMutationArgs
    | MergeExerciseDefinitionMutationArgs;

export const useSaveExerciseDefinition = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            args: SaveExerciseDefinitionArgs,
        ): Promise<ExerciseDefinition> => {
            switch (args.intent) {
                case 'create':
                    return dbServices.exerciseDefinitionService.createUserExerciseDefinition(
                        {
                            availability: args.availability,
                            name: args.name,
                        },
                    );
                case 'update':
                    return dbServices.exerciseDefinitionService.updateExerciseDefinition(
                        {
                            id: args.id,
                            ...args.changes,
                        },
                    );
                case 'merge':
                    return dbServices.exerciseDefinitionService.mergeExerciseDefinition(
                        {
                            sourceId: args.sourceId,
                            targetId: args.targetId,
                        },
                    );
                default:
                    throw new Error(
                        'Unsupported exercise definition save intent',
                    );
            }
        },
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
