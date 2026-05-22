import type {
    ExerciseDefinition,
    ExerciseDefinitionAvailability,
    Workout,
} from '@src/core/entities/entities';
import { normalizeExerciseDefinitionName } from '@src/core/exercises/normalizeExerciseDefinitionName';
import { buildExerciseDefinitionError } from '../../repositories/exerciseDefinitions/exerciseDefinitionErrors';
import { normalizeExerciseName } from '@src/core/exercises/normalizeExerciseName';
import { systemExerciseDefinitions } from '@src/core/exercises/systemExerciseDefinitions';
import { uid } from '@src/core/id';

import type {
    ExerciseDefinitionListParams,
    ExerciseDefinitionRepository,
} from '../../repositories/exerciseDefinitions/exerciseDefinitionRepositoryFactory';
import { systemClock, type Clock } from '../../repositories/repositoryClock';

export type {
    ExerciseDefinitionListFilters,
    ExerciseDefinitionListPagination,
    ExerciseDefinitionListParams,
    ExerciseDefinitionListScope,
} from '../../repositories/exerciseDefinitions/exerciseDefinitionRepositoryFactory';

export interface CreateUserExerciseDefinitionInput {
    availability?: ExerciseDefinitionAvailability;
    name: string;
}

export interface UpdateExerciseDefinitionInput {
    availability?: ExerciseDefinitionAvailability;
    id: string;
    name?: string;
}

export interface MergeExerciseDefinitionInput {
    sourceId: string;
    targetId: string;
}

export interface ExerciseDefinitionService {
    createUserExerciseDefinition: (
        input: CreateUserExerciseDefinitionInput,
    ) => ExerciseDefinition;
    deleteUserExerciseDefinition: (id: string) => void;
    findOrCreateUserExerciseDefinitionByName: (
        name: string,
    ) => ExerciseDefinition | null;
    getById: (id: string) => ExerciseDefinition | null;
    getByNormalizedName: (normalizedName: string) => ExerciseDefinition | null;
    list: (params?: ExerciseDefinitionListParams) => ExerciseDefinition[];
    mergeExerciseDefinition: (
        input: MergeExerciseDefinitionInput,
    ) => ExerciseDefinition;
    resolveWorkoutExerciseDefinitions: (workout: Workout) => Workout;
    seedSystemDefinitions: () => void;
    updateExerciseDefinition: (
        input: UpdateExerciseDefinitionInput,
    ) => ExerciseDefinition;
}

export interface CreateExerciseDefinitionServiceArgs {
    clock?: Clock;
    exerciseDefinitionRepository: ExerciseDefinitionRepository;
}

export const createExerciseDefinitionService = ({
    clock = systemClock,
    exerciseDefinitionRepository,
}: CreateExerciseDefinitionServiceArgs): ExerciseDefinitionService => {
    const getSystemDefinitionByNormalizedName = (
        normalizedName: string,
    ): ExerciseDefinition | null =>
        systemExerciseDefinitions.find(
            (definition) => definition.normalizedName === normalizedName,
        ) ?? null;

    const seedSystemDefinition = (definition: ExerciseDefinition): void => {
        const nameInput = normalizeExerciseDefinitionName(definition.name);
        const existing = exerciseDefinitionRepository.getByNormalizedName(
            nameInput.normalizedName,
        );

        if (existing) return;

        exerciseDefinitionRepository.create({
            id: uid(),
            name: nameInput.name,
            normalizedName: nameInput.normalizedName,
            source: 'system',
            availability: definition.availability,
            createdAtMs: definition.createdAtMs,
            updatedAtMs: definition.updatedAtMs,
        });
    };

    const service: ExerciseDefinitionService = {
        createUserExerciseDefinition: ({
            availability = 'both',
            name,
        }: CreateUserExerciseDefinitionInput): ExerciseDefinition => {
            const nameInput = normalizeExerciseDefinitionName(name);
            const nowMs = clock.now();

            return exerciseDefinitionRepository.create({
                id: uid(),
                name: nameInput.name,
                normalizedName: nameInput.normalizedName,
                source: 'user',
                availability,
                createdAtMs: nowMs,
                updatedAtMs: nowMs,
            });
        },

        deleteUserExerciseDefinition: (id: string): void => {
            const existing = exerciseDefinitionRepository.getById(id);
            if (!existing) {
                throw new Error(`Exercise definition ${id} was not found`);
            }

            if (existing.source === 'system') {
                throw buildExerciseDefinitionError(
                    'DELETE_SYSTEM_FORBIDDEN',
                    `Cannot delete system exercise definition ${id}`,
                );
            }

            if (exerciseDefinitionRepository.hasWorkoutExerciseReferences(id)) {
                throw buildExerciseDefinitionError(
                    'DELETE_REFERENCED',
                    `Cannot delete referenced exercise definition ${id}`,
                );
            }

            exerciseDefinitionRepository.deleteById(id);
        },

        findOrCreateUserExerciseDefinitionByName: (
            name: string,
        ): ExerciseDefinition | null => {
            const trimmedName = name.trim();
            const normalizedName = normalizeExerciseName(trimmedName);
            if (normalizedName.length === 0) return null;

            return (
                exerciseDefinitionRepository.getByNormalizedName(
                    normalizedName,
                ) ??
                service.createUserExerciseDefinition({
                    name: trimmedName,
                })
            );
        },

        list: ({
            filters,
            pagination,
            scope = 'active',
        }: ExerciseDefinitionListParams = {}): ExerciseDefinition[] =>
            exerciseDefinitionRepository.list({
                filters,
                pagination,
                scope,
            }),

        mergeExerciseDefinition: ({
            sourceId,
            targetId,
        }: MergeExerciseDefinitionInput): ExerciseDefinition => {
            if (sourceId === targetId) {
                throw new Error(
                    `Cannot merge exercise definition ${sourceId} into itself`,
                );
            }

            const source = exerciseDefinitionRepository.getById(sourceId);
            if (!source) {
                throw new Error(
                    `Exercise definition ${sourceId} was not found`,
                );
            }

            const target = exerciseDefinitionRepository.getById(targetId);
            if (!target) {
                throw new Error(
                    `Exercise definition ${targetId} was not found`,
                );
            }

            const hasWorkoutReferences =
                exerciseDefinitionRepository.hasWorkoutExerciseReferences(
                    sourceId,
                );
            if (hasWorkoutReferences && target.availability === 'gym') {
                throw buildExerciseDefinitionError(
                    'MERGE_GYM_ONLY_CONFLICT',
                    `Cannot merge workout-referenced exercise definition ${sourceId} into gym-only definition ${targetId}`,
                );
            }
            //Todo: Same checking but reversed when we have gym exercises references

            exerciseDefinitionRepository.replaceWorkoutExerciseDefinitionReferences(
                {
                    sourceId,
                    targetId,
                },
            );

            if (source.source === 'user') {
                exerciseDefinitionRepository.deleteById(sourceId);
            }

            return target;
        },

        getById: (id: string): ExerciseDefinition | null =>
            exerciseDefinitionRepository.getById(id),

        getByNormalizedName: (
            normalizedName: string,
        ): ExerciseDefinition | null =>
            exerciseDefinitionRepository.getByNormalizedName(normalizedName),

        resolveWorkoutExerciseDefinitions: (workout: Workout): Workout => ({
            ...workout,
            blocks: workout.blocks.map((block) => ({
                ...block,
                exercises: block.exercises.map((exercise) => {
                    const name = exercise.name?.trim();
                    if (exercise.exerciseDefinitionId) {
                        const definition = service.getById(
                            exercise.exerciseDefinitionId,
                        );

                        if (
                            definition &&
                            (!name ||
                                normalizeExerciseName(name) ===
                                    definition.normalizedName)
                        ) {
                            return {
                                ...exercise,
                                name: definition.name,
                                exerciseDefinitionId: definition.id,
                            };
                        }
                    }

                    if (!name || name.length === 0) {
                        return {
                            ...exercise,
                            name: undefined,
                            exerciseDefinitionId: undefined,
                        };
                    }

                    const definition =
                        service.findOrCreateUserExerciseDefinitionByName(name);

                    return {
                        ...exercise,
                        name: definition?.name ?? name,
                        exerciseDefinitionId: definition?.id,
                    };
                }),
            })),
        }),

        seedSystemDefinitions: (): void => {
            systemExerciseDefinitions.forEach(seedSystemDefinition);
        },

        updateExerciseDefinition: ({
            availability,
            id,
            name,
        }: UpdateExerciseDefinitionInput): ExerciseDefinition => {
            const nameInput =
                name !== undefined
                    ? normalizeExerciseDefinitionName(name)
                    : undefined;
            const existing = exerciseDefinitionRepository.getById(id);
            if (!existing) {
                throw new Error(`Exercise definition ${id} was not found`);
            }

            if (
                availability === 'gym' &&
                existing.availability !== 'gym' &&
                exerciseDefinitionRepository.hasWorkoutExerciseReferences(id)
            ) {
                throw buildExerciseDefinitionError(
                    'GYM_ONLY_RESTRICTED',
                    `Cannot make workout-referenced exercise definition ${id} gym-only`,
                );
            }
            //Todo: Same checking but reversed when we have gym exercises references

            if (existing.source === 'user') {
                return exerciseDefinitionRepository.update({
                    id: existing.id,
                    name: nameInput?.name,
                    normalizedName: nameInput?.normalizedName,
                    availability,
                    updatedAtMs: clock.now(),
                });
            }

            if (
                nameInput === undefined ||
                existing.normalizedName === nameInput.normalizedName
            ) {
                return existing;
            }

            const updated = exerciseDefinitionRepository.update({
                id: existing.id,
                name: nameInput.name,
                normalizedName: nameInput.normalizedName,
                source: 'user',
                availability,
                updatedAtMs: clock.now(),
            });
            const oldSystemDefinition = getSystemDefinitionByNormalizedName(
                existing.normalizedName,
            );

            if (oldSystemDefinition) {
                seedSystemDefinition(oldSystemDefinition);
            }

            return updated;
        },
    };

    return service;
};
