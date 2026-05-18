import { useQuery } from '@tanstack/react-query';

import { workoutSessionService } from '@src/db';

import { workoutSessionKeys } from './workoutSessionKeys';

export const useWorkoutSessions = () =>
    useQuery({
        queryKey: workoutSessionKeys.all,
        queryFn: () => workoutSessionService.getAll(),
        initialData: () => workoutSessionService.getAll(),
    });

export const useRecentWorkoutSessions = (limit = 5) =>
    useQuery({
        queryKey: workoutSessionKeys.recent(limit),
        queryFn: () => workoutSessionService.getRecent(limit),
        initialData: () => workoutSessionService.getRecent(limit),
    });

export const useWorkoutSession = (id?: string) =>
    useQuery({
        queryKey: workoutSessionKeys.detail(id),
        queryFn: () => (id ? workoutSessionService.getById(id) : null),
        enabled: !!id,
        initialData: () => (id ? workoutSessionService.getById(id) : null),
    });
