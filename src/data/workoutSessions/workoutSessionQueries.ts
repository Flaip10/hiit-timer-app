import { useQuery } from '@tanstack/react-query';

import { dbServices } from '@src/db/dbServices';

import { workoutSessionKeys } from './workoutSessionKeys';

export const useWorkoutSessions = () =>
    useQuery({
        queryKey: workoutSessionKeys.all,
        queryFn: () => dbServices.workoutSessionService.getAll(),
        initialData: () => dbServices.workoutSessionService.getAll(),
    });

export const useRecentWorkoutSessions = (limit = 5) =>
    useQuery({
        queryKey: workoutSessionKeys.recent(limit),
        queryFn: () => dbServices.workoutSessionService.getRecent(limit),
        initialData: () => dbServices.workoutSessionService.getRecent(limit),
    });

export const useWorkoutSession = (id?: string) =>
    useQuery({
        queryKey: workoutSessionKeys.detail(id),
        queryFn: () =>
            id ? dbServices.workoutSessionService.getById(id) : null,
        enabled: !!id,
        initialData: () =>
            id ? dbServices.workoutSessionService.getById(id) : null,
    });
