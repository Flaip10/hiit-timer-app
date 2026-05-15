import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
    type CreateWorkoutSessionArgs,
    workoutSessionRepository,
} from '@src/db/repositories/workoutSessionRepository';

import { workoutSessionKeys } from './workoutSessionKeys';

export const useAddWorkoutSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (args: CreateWorkoutSessionArgs) =>
            workoutSessionRepository.create(args),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: workoutSessionKeys.all,
            });
        },
    });
};

export const useRemoveWorkoutSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            workoutSessionRepository.remove(id);
            return id;
        },
        onSuccess: async (id) => {
            queryClient.removeQueries({
                queryKey: workoutSessionKeys.detail(id),
            });
            await queryClient.invalidateQueries({
                queryKey: workoutSessionKeys.all,
            });
        },
    });
};

export const useClearWorkoutSessions = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            workoutSessionRepository.clear();
        },
        onSuccess: async () => {
            queryClient.removeQueries({
                queryKey: workoutSessionKeys.all,
            });
            await queryClient.invalidateQueries({
                queryKey: workoutSessionKeys.all,
            });
        },
    });
};
