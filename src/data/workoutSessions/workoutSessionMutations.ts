import { useMutation, useQueryClient } from '@tanstack/react-query';

import { dbServices } from '@src/db/dbServices';
import type { CreateWorkoutSessionArgs } from '@src/db/services/workoutSessions/workoutSessionServiceFactory';

import { workoutSessionKeys } from './workoutSessionKeys';

export const useAddWorkoutSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (args: CreateWorkoutSessionArgs) =>
            dbServices.workoutSessionService.createSession(args),
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
            dbServices.workoutSessionService.deleteSession(id);
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
            dbServices.workoutSessionService.clearSessions();
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
