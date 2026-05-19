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
    getCurrentVersionId: (workoutId: string) => string | null;
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

const assertWorkoutExercisesCanBePersisted = (workout: Workout): void => {
    workout.blocks.forEach((block) => {
        block.exercises.forEach((exercise) => {
            const hasDefinition = !!exercise.exerciseDefinitionId;
            const hasName =
                exercise.name !== undefined && exercise.name.trim().length > 0;

            if (!hasDefinition && !hasName) {
                throw new Error('Cannot save a workout with unnamed exercises');
            }
        });
    });
};

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

            workoutRepository.insertWorkoutVersion(resolvedWorkout, versionId);
            workoutRepository.insertWorkout({
                id: resolvedWorkout.id,
                name: resolvedWorkout.name,
                currentVersionId: versionId,
                createdAtMs: resolvedWorkout.updatedAtMs,
                isFavorite: resolvedWorkout.isFavorite === true,
                sortIndex,
            });
            return;
        }

        const currentWorkout = workoutRepository.getWorkoutByVersionId(
            existingWorkout.currentVersionId,
        );
        const shouldCreateVersion =
            currentWorkout === null ||
            !hasSameWorkoutContent(currentWorkout, resolvedWorkout);
        const nextVersionId = shouldCreateVersion
            ? workoutRepository.createWorkoutVersion(resolvedWorkout)
            : existingWorkout.currentVersionId;

        workoutRepository.updateWorkout({
            id: resolvedWorkout.id,
            currentVersionId: nextVersionId,
            isFavorite: resolvedWorkout.isFavorite === true,
            name: resolvedWorkout.name,
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

        workoutRepository.insertWorkout({
            id: resolvedWorkout.id,
            name: resolvedWorkout.name,
            currentVersionId: sourceWorkoutVersionId,
            createdAtMs: clock.now(),
            isFavorite: resolvedWorkout.isFavorite === true,
            sortIndex: getSortIndex(resolvedWorkout),
        });
    };

    return {
        getAll: (): Workout[] => workoutRepository.getAll(),

        getById: (id: string): Workout | null => workoutRepository.getById(id),

        getCurrentVersionId: (workoutId: string): string | null =>
            workoutRepository.getCurrentVersionId(workoutId),

        upsertWorkout: ({
            sourceWorkoutVersionId,
            workout,
        }: UpsertWorkoutArgs): void => {
            assertWorkoutExercisesCanBePersisted(workout);

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
