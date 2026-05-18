import type { Workout } from '@src/core/entities/entities';
import { uid } from '@src/core/id';

import { hasSameWorkoutContent } from '../../mappers/workouts/workoutContent';
import type { WorkoutRepository } from '../../repositories/workouts/workoutRepositoryFactory';
import type { WorkoutSessionRepository } from '../../repositories/workoutSessions/workoutSessionRepositoryFactory';
import { systemClock, type Clock } from '../../repositories/repositoryClock';
import type { ExerciseDefinitionService } from '../exerciseDefinitions/exerciseDefinitionServiceFactory';

export interface UpsertWorkoutArgs {
    sourceWorkoutVersionId?: string;
    workout: Workout;
}

export interface WorkoutService {
    getAll: () => Workout[];
    getById: (id: string) => Workout | null;
    upsertWorkout: (args: UpsertWorkoutArgs) => void;
    toggleFavorite: (workout: Workout) => void;
    deleteWorkout: (id: string) => void;
}

export interface CreateWorkoutServiceArgs {
    clock?: Clock;
    exerciseDefinitionService: ExerciseDefinitionService;
    workoutRepository: WorkoutRepository;
    workoutSessionRepository: WorkoutSessionRepository;
}

const getSortIndex = (workout: Workout): number => -workout.updatedAtMs;

export const createWorkoutService = ({
    clock = systemClock,
    exerciseDefinitionService,
    workoutRepository,
    workoutSessionRepository,
}: CreateWorkoutServiceArgs): WorkoutService => {
    const deleteWorkoutVersionIfOrphan = (versionId: string): void => {
        if (
            !workoutRepository.hasWorkoutForVersion(versionId) &&
            !workoutSessionRepository.hasSessionForVersion(versionId)
        ) {
            workoutRepository.deleteWorkoutVersion(versionId);
        }
    };

    const upsertResolvedWorkout = (resolvedWorkout: Workout): void => {
        const sortIndex = getSortIndex(resolvedWorkout);
        const existingWorkout = workoutRepository.getWorkoutRow(
            resolvedWorkout.id,
        );

        if (!existingWorkout) {
            const versionId = uid();

            workoutRepository.insertWorkout({
                id: resolvedWorkout.id,
                currentVersionId: versionId,
                createdAtMs: resolvedWorkout.updatedAtMs,
                isFavorite: resolvedWorkout.isFavorite === true,
                sortIndex,
            });
            workoutRepository.insertWorkoutVersion(
                resolvedWorkout,
                versionId,
                resolvedWorkout.id,
            );
            return;
        }

        const currentWorkout = workoutRepository.getWorkoutByVersionId(
            existingWorkout.currentVersionId,
        );
        const shouldCreateVersion =
            currentWorkout === null ||
            !hasSameWorkoutContent(currentWorkout, resolvedWorkout);
        const nextVersionId = shouldCreateVersion
            ? workoutRepository.createWorkoutVersion(
                  resolvedWorkout,
                  resolvedWorkout.id,
              )
            : existingWorkout.currentVersionId;

        workoutRepository.updateWorkout({
            id: resolvedWorkout.id,
            currentVersionId: nextVersionId,
            isFavorite: resolvedWorkout.isFavorite === true,
            sortIndex,
        });

        if (shouldCreateVersion) {
            deleteWorkoutVersionIfOrphan(existingWorkout.currentVersionId);
        }
    };

    const upsertResolvedWorkoutFromSourceVersion = (
        resolvedWorkout: Workout,
        sourceWorkoutVersionId: string,
    ): void => {
        const sourceVersionWorkout = workoutRepository.getWorkoutByVersionId(
            sourceWorkoutVersionId,
        );
        const shouldReuseSourceVersion =
            sourceVersionWorkout !== null &&
            hasSameWorkoutContent(sourceVersionWorkout, resolvedWorkout);

        if (!shouldReuseSourceVersion) {
            upsertResolvedWorkout(resolvedWorkout);
            return;
        }

        const existingWorkout = workoutRepository.getWorkoutRow(
            resolvedWorkout.id,
        );
        if (existingWorkout) {
            throw new Error(
                `Cannot restore workout ${resolvedWorkout.id}: already exists`,
            );
        }

        const sourceVersion = workoutRepository.getWorkoutVersionRow(
            sourceWorkoutVersionId,
        );
        if (sourceVersion?.workoutId) {
            throw new Error(
                `Cannot restore workout ${resolvedWorkout.id}: source version already belongs to workout ${sourceVersion.workoutId}`,
            );
        }

        workoutRepository.insertWorkout({
            id: resolvedWorkout.id,
            currentVersionId: sourceWorkoutVersionId,
            createdAtMs: clock.now(),
            isFavorite: resolvedWorkout.isFavorite === true,
            sortIndex: getSortIndex(resolvedWorkout),
        });
        workoutRepository.relinkWorkoutVersion({
            workoutId: resolvedWorkout.id,
            workoutVersionId: sourceWorkoutVersionId,
        });
        workoutSessionRepository.relinkWorkoutToSessions({
            workoutId: resolvedWorkout.id,
            workoutVersionId: sourceWorkoutVersionId,
        });
    };

    return {
        getAll: (): Workout[] => workoutRepository.getAll(),

        getById: (id: string): Workout | null => workoutRepository.getById(id),

        upsertWorkout: ({
            sourceWorkoutVersionId,
            workout,
        }: UpsertWorkoutArgs): void => {
            const resolvedWorkout =
                exerciseDefinitionService.resolveWorkoutExerciseDefinitions(
                    workout,
                );
            if (sourceWorkoutVersionId) {
                upsertResolvedWorkoutFromSourceVersion(
                    resolvedWorkout,
                    sourceWorkoutVersionId,
                );
                return;
            }

            upsertResolvedWorkout(resolvedWorkout);
        },

        toggleFavorite: (workout: Workout): void => {
            const nextWorkout: Workout = {
                ...workout,
                isFavorite: !workout.isFavorite,
            };

            upsertResolvedWorkout(
                exerciseDefinitionService.resolveWorkoutExerciseDefinitions(
                    nextWorkout,
                ),
            );
        },

        deleteWorkout: (id: string): void => {
            const workout = workoutRepository.getWorkoutRow(id);

            workoutRepository.deleteWorkout(id);

            if (workout) {
                deleteWorkoutVersionIfOrphan(workout.currentVersionId);
            }
        },
    };
};
