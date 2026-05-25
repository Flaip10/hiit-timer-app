import { useQuery } from '@tanstack/react-query';

import { dbServices } from '@src/db/dbServices';

import { gymSessionKeys } from './gymSessionKeys';

export const useActiveGymSession = () =>
    useQuery({
        queryKey: gymSessionKeys.active(),
        queryFn: () => dbServices.gymSessionService.getActiveGymSession(),
        initialData: () => dbServices.gymSessionService.getActiveGymSession(),
    });
