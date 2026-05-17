import { useQuery } from '@tanstack/react-query';

import { workoutService } from '@src/db';

import { workoutKeys } from './workoutKeys';

export const useWorkouts = () =>
    useQuery({
        queryKey: workoutKeys.all,
        queryFn: () => workoutService.getAll(),
        initialData: () => workoutService.getAll(),
    });

export const useWorkout = (id?: string) =>
    useQuery({
        queryKey: workoutKeys.detail(id ?? 'missing'),
        queryFn: () => (id ? workoutService.getById(id) : null),
        enabled: !!id,
        initialData: () => (id ? workoutService.getById(id) : null),
    });
