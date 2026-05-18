import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Workout } from '@src/core/entities/entities';
import { dbServices } from '@src/db/dbServices';

import { workoutSessionKeys } from '../workoutSessions';
import { workoutKeys } from './workoutKeys';

interface UpsertWorkoutArgs {
    workout: Workout;
    sourceWorkoutVersionId?: string;
}

const isUpsertWorkoutArgs = (
    value: Workout | UpsertWorkoutArgs,
): value is UpsertWorkoutArgs => 'workout' in value;

export const useUpsertWorkout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (args: Workout | UpsertWorkoutArgs) => {
            const workout = isUpsertWorkoutArgs(args) ? args.workout : args;
            const sourceWorkoutVersionId = isUpsertWorkoutArgs(args)
                ? args.sourceWorkoutVersionId
                : undefined;

            dbServices.workoutService.upsertWorkout({
                workout,
                sourceWorkoutVersionId,
            });
        },
        onSuccess: async (_data, args) => {
            const sourceWorkoutVersionId = isUpsertWorkoutArgs(args)
                ? args.sourceWorkoutVersionId
                : undefined;

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: workoutKeys.all,
                }),
                sourceWorkoutVersionId
                    ? queryClient.invalidateQueries({
                          queryKey: workoutSessionKeys.all,
                      })
                    : Promise.resolve(),
            ]);
        },
    });
};

export const useRemoveWorkout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            dbServices.workoutService.deleteWorkout(id);
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
            dbServices.workoutService.toggleFavorite(workout);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: workoutKeys.all,
            });
        },
    });
};
