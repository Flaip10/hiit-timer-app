import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Workout } from '@src/core/entities/entities';
import { workoutRepository } from '@src/db/repositories/workoutRepository';

import { workoutKeys } from './workoutKeys';

export const useUpsertWorkout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (workout: Workout) => {
            workoutRepository.upsert(workout, -workout.updatedAtMs);
            return workout;
        },
        onSuccess: async (workout) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: workoutKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: workoutKeys.detail(workout.id),
                }),
            ]);
        },
    });
};

export const useRemoveWorkout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            workoutRepository.remove(id);
            return id;
        },
        onSuccess: async (id) => {
            queryClient.removeQueries({
                queryKey: workoutKeys.detail(id),
            });
            await queryClient.invalidateQueries({
                queryKey: workoutKeys.all,
            });
        },
    });
};

export const useToggleFavoriteWorkout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (workout: Workout) => {
            const nextWorkout: Workout = {
                ...workout,
                isFavorite: !workout.isFavorite,
            };

            workoutRepository.upsert(nextWorkout, -nextWorkout.updatedAtMs);
            return nextWorkout;
        },
        onSuccess: async (workout) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: workoutKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: workoutKeys.detail(workout.id),
                }),
            ]);
        },
    });
};
