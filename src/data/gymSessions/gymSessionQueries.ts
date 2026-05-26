import { useQuery } from '@tanstack/react-query';

import { dbServices } from '@src/db/dbServices';
import type { ExerciseDefinition } from '@src/core/entities/entities';
import type {
    GymExerciseRecord,
    GymExerciseRecordSet,
} from '@src/core/entities/gym.interfaces';

import { gymSessionKeys } from './gymSessionKeys';

const getGymExerciseRecord = (id?: string): GymExerciseRecord | null => {
    if (!id) return null;

    const activeSession = dbServices.gymSessionService.getActiveGymSession();

    return (
        activeSession?.exerciseRecords.find((record) => record.id === id) ??
        null
    );
};

export const useActiveGymSession = () =>
    useQuery({
        queryKey: gymSessionKeys.active(),
        queryFn: () => dbServices.gymSessionService.getActiveGymSession(),
        initialData: () => dbServices.gymSessionService.getActiveGymSession(),
    });

export const useGymExerciseRecord = (id?: string) =>
    useQuery({
        queryKey: gymSessionKeys.exerciseRecord(id),
        queryFn: () => getGymExerciseRecord(id),
        enabled: !!id,
        initialData: () => getGymExerciseRecord(id),
    });

export const useGymExerciseRecordSets = (recordId?: string) =>
    useQuery({
        queryKey: gymSessionKeys.exerciseRecordSets(recordId),
        queryFn: () => getGymExerciseRecord(recordId)?.sets ?? [],
        enabled: !!recordId,
        initialData: (): GymExerciseRecordSet[] =>
            getGymExerciseRecord(recordId)?.sets ?? [],
    });

export const useGymExerciseDefinitions = (name?: string) =>
    useQuery({
        queryKey: gymSessionKeys.availableExerciseDefinitions(name),
        queryFn: () =>
            dbServices.exerciseDefinitionService.list({
                filters: {
                    availability: 'gym',
                    name,
                },
                scope: 'all',
            }),
        initialData: (): ExerciseDefinition[] =>
            dbServices.exerciseDefinitionService.list({
                filters: {
                    availability: 'gym',
                    name,
                },
                scope: 'all',
            }),
    });
