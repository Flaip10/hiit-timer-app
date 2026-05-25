import { useMutation, useQueryClient } from '@tanstack/react-query';

import { dbServices } from '@src/db/dbServices';

import { gymSessionKeys } from './gymSessionKeys';

export const useStartGymSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () =>
            dbServices.gymSessionService.startEmptyGymSession(),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: gymSessionKeys.all,
            });
        },
    });
};
