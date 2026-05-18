import { useQuery } from '@tanstack/react-query';

import { dbServices } from '@src/db/dbServices';

import { workoutKeys } from './workoutKeys';

export const useWorkouts = () =>
    useQuery({
        queryKey: workoutKeys.all,
        queryFn: () => dbServices.workoutService.getAll(),
        initialData: () => dbServices.workoutService.getAll(),
    });

export const useWorkout = (id?: string) =>
    useQuery({
        queryKey: workoutKeys.detail(id ?? 'missing'),
        queryFn: () => (id ? dbServices.workoutService.getById(id) : null),
        enabled: !!id,
        initialData: () =>
            id ? dbServices.workoutService.getById(id) : null,
    });
