import { useQuery } from '@tanstack/react-query';

import { workoutRepository } from '@src/db/repositories/workoutRepository';

import { workoutKeys } from './workoutKeys';

export const useWorkouts = () =>
    useQuery({
        queryKey: workoutKeys.all,
        queryFn: () => workoutRepository.getAll(),
        initialData: () => workoutRepository.getAll(),
    });

export const useWorkout = (id?: string) =>
    useQuery({
        queryKey: workoutKeys.detail(id ?? 'missing'),
        queryFn: () => (id ? workoutRepository.getById(id) : null),
        enabled: !!id,
        initialData: () => (id ? workoutRepository.getById(id) : null),
    });
