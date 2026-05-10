import { useQuery } from '@tanstack/react-query';

import { workoutSessionRepository } from '@src/db/repositories/workoutSessionRepository';

import { workoutSessionKeys } from './workoutSessionKeys';

export const useWorkoutSessions = () =>
    useQuery({
        queryKey: workoutSessionKeys.all,
        queryFn: () => workoutSessionRepository.getAll(),
        initialData: () => workoutSessionRepository.getAll(),
    });

export const useRecentWorkoutSessions = (limit = 5) =>
    useQuery({
        queryKey: workoutSessionKeys.recent(limit),
        queryFn: () => workoutSessionRepository.getRecent(limit),
        initialData: () => workoutSessionRepository.getRecent(limit),
    });

export const useWorkoutSession = (id?: string) =>
    useQuery({
        queryKey: workoutSessionKeys.detail(id),
        queryFn: () => (id ? workoutSessionRepository.getById(id) : null),
        enabled: !!id,
        initialData: () => (id ? workoutSessionRepository.getById(id) : null),
    });
