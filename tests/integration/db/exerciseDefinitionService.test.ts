import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { eq } from 'drizzle-orm';

import type { ExerciseDefinition, Workout } from '@src/core/entities/entities';
import {
    exerciseDefinitionsTable,
    workoutExercisesTable,
} from '@src/db/schema';

import { createExerciseDefinitionFixture } from '../../fixtures/exerciseDefinitions';
import { createWorkoutFixture } from '../../fixtures/workouts';
import {
    createRepositoryContext,
    type RepositoryContext,
} from '../../helpers/dbIntegrationHelpers';
import { seedExerciseDefinition } from '../../helpers/seedExerciseDefinition';
import { seedPersistedWorkout } from '../../helpers/seedWorkout';

type ExerciseDefinitionRow = typeof exerciseDefinitionsTable.$inferSelect;

const FIXED_NOW_MS = 2_000_000_000_000;

const readExerciseDefinitionRowOrThrow = (
    context: RepositoryContext,
    id: string,
): ExerciseDefinitionRow => {
    const definition = context.testDb.db
        .select()
        .from(exerciseDefinitionsTable)
        .where(eq(exerciseDefinitionsTable.id, id))
        .get();

    expect(definition).toBeDefined();
    if (!definition) {
        throw new Error(`Expected exercise definition row ${id}`);
    }

    return definition;
};

const readExerciseDefinitionByNormalizedName = (
    context: RepositoryContext,
    normalizedName: string,
): ExerciseDefinitionRow | undefined =>
    context.testDb.db
        .select()
        .from(exerciseDefinitionsTable)
        .where(eq(exerciseDefinitionsTable.normalizedName, normalizedName))
        .get();

const readExerciseDefinitionByNormalizedNameOrThrow = (
    context: RepositoryContext,
    normalizedName: string,
): ExerciseDefinitionRow => {
    const definition = readExerciseDefinitionByNormalizedName(
        context,
        normalizedName,
    );

    expect(definition).toBeDefined();
    if (!definition) {
        throw new Error(`Expected exercise definition row ${normalizedName}`);
    }

    return definition;
};

const expectExerciseDefinitionRowToMatchFixture = (
    actual: ExerciseDefinitionRow | undefined,
    expected: ExerciseDefinition,
): void => {
    expect(actual).toMatchObject({
        id: expected.id,
        name: expected.name,
        normalizedName: expected.normalizedName,
        source: expected.source,
        availability: expected.availability,
        createdAtMs: expected.createdAtMs,
        updatedAtMs: expected.updatedAtMs,
    });
};

const seedWorkoutReferencingExerciseDefinition = (
    context: RepositoryContext,
    definition: ExerciseDefinition,
): Workout => {
    const workout = createWorkoutFixture({
        id: `workout-referencing-${definition.id}`,
    });

    workout.blocks[0].exercises[0] = {
        ...workout.blocks[0].exercises[0],
        exerciseDefinitionId: definition.id,
        name: undefined,
    };

    seedPersistedWorkout(context.testDb, workout);

    return workout;
};

const readWorkoutExerciseDefinitionIdOrThrow = (
    context: RepositoryContext,
    exerciseId: string,
): string | null => {
    const exercise = context.testDb.db
        .select({
            exerciseDefinitionId: workoutExercisesTable.exerciseDefinitionId,
        })
        .from(workoutExercisesTable)
        .where(eq(workoutExercisesTable.id, exerciseId))
        .get();

    expect(exercise).toBeDefined();
    if (!exercise) {
        throw new Error(`Expected workout exercise row ${exerciseId}`);
    }

    return exercise.exerciseDefinitionId;
};

describe('exerciseDefinitionService integration', () => {
    let context: RepositoryContext;

    beforeEach(() => {
        context = createRepositoryContext({ now: () => FIXED_NOW_MS });
    });

    afterEach(() => {
        context.testDb.close();
    });

    describe('createUserExerciseDefinition', () => {
        it('persists normalized user-owned identity fields from the input and current clock', () => {
            const expectedPersistedFields = {
                name: 'Animal  Flow',
                normalizedName: 'animal flow',
                source: 'user',
                availability: 'gym',
                createdAtMs: FIXED_NOW_MS,
                updatedAtMs: FIXED_NOW_MS,
            };
            const { exerciseDefinitionService } = context.testDb.dbServices;

            const definition =
                exerciseDefinitionService.createUserExerciseDefinition({
                    availability: 'gym',
                    name: '  Animal  Flow  ',
                });

            const row = readExerciseDefinitionByNormalizedNameOrThrow(
                context,
                expectedPersistedFields.normalizedName,
            );

            expect(definition).toMatchObject(expectedPersistedFields);
            expect(definition.id).toBeTruthy();
            expect(row).toMatchObject(expectedPersistedFields);
            expect(row.id).toBe(definition.id);
        });

        it('rejects duplicate normalized exercise identities', () => {
            const definition = createExerciseDefinitionFixture({
                id: 'definition-cossack-squat',
                name: 'Cossack Squat',
            });
            const { exerciseDefinitionService } = context.testDb.dbServices;

            seedExerciseDefinition(context.testDb, definition);

            expect(() => {
                exerciseDefinitionService.createUserExerciseDefinition({
                    name: ' cossack  squat ',
                });
            }).toThrow(
                `Exercise definition already exists for normalized name "${definition.normalizedName}"`,
            );

            const rows = context.testDb.db
                .select()
                .from(exerciseDefinitionsTable)
                .where(
                    eq(
                        exerciseDefinitionsTable.normalizedName,
                        definition.normalizedName,
                    ),
                )
                .all();

            expect(rows).toHaveLength(1);
        });
    });

    describe('getById', () => {
        it('returns the seeded exercise definition when it exists', () => {
            const definition = createExerciseDefinitionFixture({
                id: 'definition-shadow-boxing',
                name: 'Shadow Boxing',
            });
            const { exerciseDefinitionService } = context.testDb.dbServices;

            seedExerciseDefinition(context.testDb, definition);

            expect(exerciseDefinitionService.getById(definition.id)).toEqual(
                definition,
            );
        });

        it('returns null when the definition does not exist', () => {
            const { exerciseDefinitionService } = context.testDb.dbServices;

            expect(
                exerciseDefinitionService.getById('non-existent-definition'),
            ).toBeNull();
        });
    });

    describe('getByNormalizedName', () => {
        it('returns the seeded exercise definition when the normalized name exists', () => {
            const definition = createExerciseDefinitionFixture({
                id: 'definition-shadow-boxing',
                name: 'Shadow Boxing',
            });
            const { exerciseDefinitionService } = context.testDb.dbServices;

            seedExerciseDefinition(context.testDb, definition);

            expect(
                exerciseDefinitionService.getByNormalizedName(
                    definition.normalizedName,
                ),
            ).toEqual(definition);
        });
    });

    describe('findOrCreateUserExerciseDefinitionByName', () => {
        describe('when a matching normalized name already exists', () => {
            it('reuses the existing exercise identity without inserting a duplicate', () => {
                const definition = createExerciseDefinitionFixture({
                    id: 'definition-battle-ropes',
                    name: 'Battle Ropes',
                });
                const { exerciseDefinitionService } = context.testDb.dbServices;

                seedExerciseDefinition(context.testDb, definition);

                const found =
                    exerciseDefinitionService.findOrCreateUserExerciseDefinitionByName(
                        ' battle  ropes ',
                    );

                const rows = context.testDb.db
                    .select()
                    .from(exerciseDefinitionsTable)
                    .where(
                        eq(
                            exerciseDefinitionsTable.normalizedName,
                            definition.normalizedName,
                        ),
                    )
                    .all();

                expect(found).toEqual(definition);
                expect(rows).toHaveLength(1);
            });
        });

        describe('when the input name is blank', () => {
            it('does not create an exercise identity', () => {
                const { exerciseDefinitionService } = context.testDb.dbServices;

                expect(
                    exerciseDefinitionService.findOrCreateUserExerciseDefinitionByName(
                        '   ',
                    ),
                ).toBeNull();
            });
        });
    });

    describe('list', () => {
        describe('when listing active definitions', () => {
            it('returns user definitions and referenced system definitions ordered by name', () => {
                const userDefinition = createExerciseDefinitionFixture({
                    id: 'definition-z-press',
                    name: 'Z Press',
                });
                const referencedSystemDefinition =
                    readExerciseDefinitionByNormalizedNameOrThrow(
                        context,
                        'burpee',
                    );
                const workoutBase = createWorkoutFixture({
                    id: 'referenced-workout',
                });
                const workout: Workout = {
                    ...workoutBase,
                    blocks: [
                        {
                            ...workoutBase.blocks[0],
                            exercises: [
                                {
                                    id: 'referenced-workout-exercise-1',
                                    exerciseDefinitionId:
                                        referencedSystemDefinition.id,
                                    mode: 'time',
                                    value: 30,
                                },
                            ],
                        },
                    ],
                };
                const { exerciseDefinitionService } = context.testDb.dbServices;

                seedExerciseDefinition(context.testDb, userDefinition);
                seedPersistedWorkout(context.testDb, workout);

                const definitions = exerciseDefinitionService.list();

                expect(
                    definitions.map((definition) => definition.name),
                ).toEqual(['Burpee', 'Z Press']);
            });
        });

        describe('when filters and pagination are provided', () => {
            it('applies name, availability, source and limit options', () => {
                const workoutDefinition = createExerciseDefinitionFixture({
                    id: 'definition-alpha-press',
                    availability: 'workout',
                    name: 'Alpha Press',
                });
                const gymDefinition = createExerciseDefinitionFixture({
                    id: 'definition-alpha-row',
                    availability: 'gym',
                    name: 'Alpha Row',
                });
                const betaDefinition = createExerciseDefinitionFixture({
                    id: 'definition-beta-press',
                    availability: 'workout',
                    name: 'Beta Press',
                });
                const { exerciseDefinitionService } = context.testDb.dbServices;

                seedExerciseDefinition(context.testDb, workoutDefinition);
                seedExerciseDefinition(context.testDb, gymDefinition);
                seedExerciseDefinition(context.testDb, betaDefinition);

                const definitions = exerciseDefinitionService.list({
                    filters: {
                        availability: 'workout',
                        name: 'alpha',
                        source: 'user',
                    },
                    pagination: { limit: 1 },
                });

                expect(definitions).toEqual([workoutDefinition]);
            });
        });
    });

    describe('resolveWorkoutExerciseDefinitions', () => {
        it('links valid identities, creates missing user identities, and clears blank identities', () => {
            const existingDefinition = createExerciseDefinitionFixture({
                id: 'definition-shadow-boxing-resolve',
                name: 'Shadow Boxing',
            });
            const expectedCreatedDefinition = {
                name: 'Animal Flow',
                normalizedName: 'animal flow',
                source: 'user',
                availability: 'both',
                createdAtMs: FIXED_NOW_MS,
                updatedAtMs: FIXED_NOW_MS,
            };
            const workout = createWorkoutFixture({
                id: 'resolve-workout',
            });
            workout.blocks[0].exercises[0] = {
                ...workout.blocks[0].exercises[0],
                exerciseDefinitionId: existingDefinition.id,
                name: ' shadow boxing ',
            };
            workout.blocks[1].exercises[0] = {
                ...workout.blocks[1].exercises[0],
                exerciseDefinitionId: undefined,
                name: '  Animal Flow  ',
            };
            workout.blocks[1].exercises[1] = {
                ...workout.blocks[1].exercises[1],
                exerciseDefinitionId: 'missing-definition',
                name: '   ',
            };
            const { exerciseDefinitionService } = context.testDb.dbServices;

            seedExerciseDefinition(context.testDb, existingDefinition);

            const resolved =
                exerciseDefinitionService.resolveWorkoutExerciseDefinitions(
                    workout,
                );

            const existingExercise = resolved.blocks[0].exercises[0];
            const createdExercise = resolved.blocks[1].exercises[0];
            const blankExercise = resolved.blocks[1].exercises[1];
            const createdDefinition =
                readExerciseDefinitionByNormalizedNameOrThrow(
                    context,
                    expectedCreatedDefinition.normalizedName,
                );

            expect(existingExercise).toMatchObject({
                exerciseDefinitionId: existingDefinition.id,
                name: existingDefinition.name,
            });
            expect(createdExercise).toMatchObject({
                exerciseDefinitionId: createdDefinition.id,
                name: expectedCreatedDefinition.name,
            });
            expect(createdDefinition).toMatchObject(expectedCreatedDefinition);
            expect(blankExercise.exerciseDefinitionId).toBeUndefined();
            expect(blankExercise.name).toBeUndefined();
        });
    });

    describe('updateExerciseDefinition', () => {
        describe('when updating an existing user definition', () => {
            let workoutDefinition: ExerciseDefinition;
            let gymDefinition: ExerciseDefinition;
            let bothDefinition: ExerciseDefinition;

            beforeEach(() => {
                workoutDefinition = createExerciseDefinitionFixture({
                    id: 'definition-workout',
                    availability: 'workout',
                    name: 'Workout Exercise',
                    updatedAtMs: 100,
                });
                gymDefinition = createExerciseDefinitionFixture({
                    id: 'definition-gym',
                    availability: 'gym',
                    name: 'Gym Exercise',
                    updatedAtMs: 200,
                });
                bothDefinition = createExerciseDefinitionFixture({
                    id: 'definition-both',
                    availability: 'both',
                    name: 'Shared Exercise',
                    updatedAtMs: 300,
                });

                seedExerciseDefinition(context.testDb, workoutDefinition);
                seedExerciseDefinition(context.testDb, gymDefinition);
                seedExerciseDefinition(context.testDb, bothDefinition);
            });

            it('updates editable identity fields without changing availability', () => {
                const expected = createExerciseDefinitionFixture({
                    ...workoutDefinition,
                    name: 'New Name',
                    updatedAtMs: FIXED_NOW_MS,
                });
                const { exerciseDefinitionService } = context.testDb.dbServices;

                const updated =
                    exerciseDefinitionService.updateExerciseDefinition({
                        id: workoutDefinition.id,
                        name: 'New Name',
                    });

                const row = readExerciseDefinitionRowOrThrow(
                    context,
                    workoutDefinition.id,
                );

                expect(updated).toEqual(expected);
                expectExerciseDefinitionRowToMatchFixture(row, expected);
            });

            it('allows availability changes to both', () => {
                const expectedWorkoutDefinition =
                    createExerciseDefinitionFixture({
                        ...workoutDefinition,
                        availability: 'both',
                        updatedAtMs: FIXED_NOW_MS,
                    });
                const expectedGymDefinition = createExerciseDefinitionFixture({
                    ...gymDefinition,
                    availability: 'both',
                    updatedAtMs: FIXED_NOW_MS,
                });
                const { exerciseDefinitionService } = context.testDb.dbServices;

                exerciseDefinitionService.updateExerciseDefinition({
                    availability: 'both',
                    id: workoutDefinition.id,
                });
                exerciseDefinitionService.updateExerciseDefinition({
                    availability: 'both',
                    id: gymDefinition.id,
                });

                expectExerciseDefinitionRowToMatchFixture(
                    readExerciseDefinitionRowOrThrow(
                        context,
                        workoutDefinition.id,
                    ),
                    expectedWorkoutDefinition,
                );
                expectExerciseDefinitionRowToMatchFixture(
                    readExerciseDefinitionRowOrThrow(context, gymDefinition.id),
                    expectedGymDefinition,
                );
            });

            it('allows availability changes from both to a single target when unreferenced', () => {
                const expected = createExerciseDefinitionFixture({
                    ...bothDefinition,
                    availability: 'gym',
                    updatedAtMs: FIXED_NOW_MS,
                });
                const { exerciseDefinitionService } = context.testDb.dbServices;

                const updated =
                    exerciseDefinitionService.updateExerciseDefinition({
                        availability: 'gym',
                        id: bothDefinition.id,
                    });

                const row = readExerciseDefinitionRowOrThrow(
                    context,
                    bothDefinition.id,
                );

                expect(updated).toEqual(expected);
                expectExerciseDefinitionRowToMatchFixture(row, expected);
            });

            it('rejects gym-only availability when there are workout references', () => {
                const { exerciseDefinitionService } = context.testDb.dbServices;

                seedWorkoutReferencingExerciseDefinition(
                    context,
                    workoutDefinition,
                );
                seedWorkoutReferencingExerciseDefinition(
                    context,
                    bothDefinition,
                );

                expect(() => {
                    exerciseDefinitionService.updateExerciseDefinition({
                        availability: 'gym',
                        id: workoutDefinition.id,
                    });
                }).toThrow(
                    `Cannot make workout-referenced exercise definition ${workoutDefinition.id} gym-only`,
                );
                expect(() => {
                    exerciseDefinitionService.updateExerciseDefinition({
                        availability: 'gym',
                        id: bothDefinition.id,
                    });
                }).toThrow(
                    `Cannot make workout-referenced exercise definition ${bothDefinition.id} gym-only`,
                );
                expectExerciseDefinitionRowToMatchFixture(
                    readExerciseDefinitionRowOrThrow(
                        context,
                        workoutDefinition.id,
                    ),
                    workoutDefinition,
                );
                expectExerciseDefinitionRowToMatchFixture(
                    readExerciseDefinitionRowOrThrow(
                        context,
                        bothDefinition.id,
                    ),
                    bothDefinition,
                );
            });

            it.todo(
                'rejects workout-only availability when a both-available definition is referenced by gym plans',
            );

            it.todo(
                'rejects workout-only availability when a gym-only definition is referenced by gym plans',
            );
        });

        describe('when updating a renamed system definition', () => {
            it('converts the edited definition to user-owned and restores the original system seed', () => {
                const systemDefinition =
                    readExerciseDefinitionByNormalizedNameOrThrow(
                        context,
                        'burpee',
                    );
                const expectedUpdated = createExerciseDefinitionFixture({
                    availability: 'gym',
                    createdAtMs: systemDefinition.createdAtMs,
                    id: systemDefinition.id,
                    name: 'Loaded Burpee',
                    source: 'user',
                    updatedAtMs: FIXED_NOW_MS,
                });
                const { exerciseDefinitionService } = context.testDb.dbServices;

                const updated =
                    exerciseDefinitionService.updateExerciseDefinition({
                        availability: 'gym',
                        id: systemDefinition.id,
                        name: 'Loaded Burpee',
                    });

                const updatedRow = readExerciseDefinitionRowOrThrow(
                    context,
                    systemDefinition.id,
                );
                const restoredSystemRow =
                    readExerciseDefinitionByNormalizedNameOrThrow(
                        context,
                        systemDefinition.normalizedName,
                    );

                expect(updated).toEqual(expectedUpdated);
                expectExerciseDefinitionRowToMatchFixture(
                    updatedRow,
                    expectedUpdated,
                );
                expect(restoredSystemRow).toMatchObject({
                    name: systemDefinition.name,
                    normalizedName: systemDefinition.normalizedName,
                    source: 'system',
                });
                expect(restoredSystemRow.id).not.toBe(systemDefinition.id);
            });
        });

        it('rejects updates for unknown exercise identities', () => {
            const { exerciseDefinitionService } = context.testDb.dbServices;

            expect(() => {
                exerciseDefinitionService.updateExerciseDefinition({
                    id: 'missing-definition',
                    name: 'Missing Id',
                });
            }).toThrow('Exercise definition missing-definition was not found');
        });
    });

    describe('mergeExerciseDefinition', () => {
        it('moves workout references to the target identity and deletes the user-owned source', () => {
            const sourceDefinition = createExerciseDefinitionFixture({
                id: 'definition-source-press-variation',
                availability: 'workout',
                name: 'Press Variation',
            });
            const targetDefinition = createExerciseDefinitionFixture({
                id: 'definition-target-merged-press',
                availability: 'both',
                name: 'Merged Press',
            });
            const { exerciseDefinitionService } = context.testDb.dbServices;

            seedExerciseDefinition(context.testDb, sourceDefinition);
            seedExerciseDefinition(context.testDb, targetDefinition);
            const workout = seedWorkoutReferencingExerciseDefinition(
                context,
                sourceDefinition,
            );

            const merged = exerciseDefinitionService.mergeExerciseDefinition({
                sourceId: sourceDefinition.id,
                targetId: targetDefinition.id,
            });

            const sourceRow = context.testDb.db
                .select()
                .from(exerciseDefinitionsTable)
                .where(eq(exerciseDefinitionsTable.id, sourceDefinition.id))
                .get();

            expect(merged).toEqual(targetDefinition);
            expect(sourceRow).toBeUndefined();
            expectExerciseDefinitionRowToMatchFixture(
                readExerciseDefinitionRowOrThrow(context, targetDefinition.id),
                targetDefinition,
            );
            expect(
                readWorkoutExerciseDefinitionIdOrThrow(
                    context,
                    workout.blocks[0].exercises[0].id,
                ),
            ).toBe(targetDefinition.id);
            expect(
                readWorkoutExerciseDefinitionIdOrThrow(
                    context,
                    workout.blocks[0].exercises[0].id,
                ),
            ).not.toBe(sourceDefinition.id);
        });

        it('preserves system-owned source definitions after moving references', () => {
            const sourceDefinition =
                readExerciseDefinitionByNormalizedNameOrThrow(
                    context,
                    'burpee',
                );
            const targetDefinition = createExerciseDefinitionFixture({
                id: 'definition-target-loaded-burpee',
                availability: 'both',
                name: 'Loaded Burpee',
            });
            const { exerciseDefinitionService } = context.testDb.dbServices;

            seedExerciseDefinition(context.testDb, targetDefinition);
            const workout = seedWorkoutReferencingExerciseDefinition(
                context,
                sourceDefinition,
            );

            const merged = exerciseDefinitionService.mergeExerciseDefinition({
                sourceId: sourceDefinition.id,
                targetId: targetDefinition.id,
            });

            expect(merged).toEqual(targetDefinition);
            expectExerciseDefinitionRowToMatchFixture(
                readExerciseDefinitionRowOrThrow(context, sourceDefinition.id),
                sourceDefinition,
            );
            expect(
                readWorkoutExerciseDefinitionIdOrThrow(
                    context,
                    workout.blocks[0].exercises[0].id,
                ),
            ).toBe(targetDefinition.id);
            expect(
                readWorkoutExerciseDefinitionIdOrThrow(
                    context,
                    workout.blocks[0].exercises[0].id,
                ),
            ).not.toBe(sourceDefinition.id);
        });

        it('rejects merging an identity into itself', () => {
            const definition = createExerciseDefinitionFixture({
                id: 'definition-self-merge',
                name: 'Self Merge',
            });
            const { exerciseDefinitionService } = context.testDb.dbServices;

            seedExerciseDefinition(context.testDb, definition);

            expect(() => {
                exerciseDefinitionService.mergeExerciseDefinition({
                    sourceId: definition.id,
                    targetId: definition.id,
                });
            }).toThrow(
                `Cannot merge exercise definition ${definition.id} into itself`,
            );
            expectExerciseDefinitionRowToMatchFixture(
                readExerciseDefinitionRowOrThrow(context, definition.id),
                definition,
            );
        });

        it('rejects missing source or target identities', () => {
            const targetDefinition = createExerciseDefinitionFixture({
                id: 'definition-existing-target',
                name: 'Existing Target',
            });
            const sourceDefinition = createExerciseDefinitionFixture({
                id: 'definition-existing-source',
                name: 'Existing Source',
            });
            const { exerciseDefinitionService } = context.testDb.dbServices;

            seedExerciseDefinition(context.testDb, targetDefinition);

            expect(() => {
                exerciseDefinitionService.mergeExerciseDefinition({
                    sourceId: 'missing-source',
                    targetId: targetDefinition.id,
                });
            }).toThrow('Exercise definition missing-source was not found');

            seedExerciseDefinition(context.testDb, sourceDefinition);

            expect(() => {
                exerciseDefinitionService.mergeExerciseDefinition({
                    sourceId: sourceDefinition.id,
                    targetId: 'missing-target',
                });
            }).toThrow('Exercise definition missing-target was not found');
            expectExerciseDefinitionRowToMatchFixture(
                readExerciseDefinitionRowOrThrow(context, sourceDefinition.id),
                sourceDefinition,
            );
        });

        it('rejects merging workout references into a gym-only target', () => {
            const sourceDefinition = createExerciseDefinitionFixture({
                id: 'definition-source-workout-reference',
                availability: 'workout',
                name: 'Source Workout Reference',
            });
            const targetDefinition = createExerciseDefinitionFixture({
                id: 'definition-target-gym-only',
                availability: 'gym',
                name: 'Target Gym Only',
            });
            const { exerciseDefinitionService } = context.testDb.dbServices;

            seedExerciseDefinition(context.testDb, sourceDefinition);
            seedExerciseDefinition(context.testDb, targetDefinition);
            const workout = seedWorkoutReferencingExerciseDefinition(
                context,
                sourceDefinition,
            );

            expect(() => {
                exerciseDefinitionService.mergeExerciseDefinition({
                    sourceId: sourceDefinition.id,
                    targetId: targetDefinition.id,
                });
            }).toThrow(
                `Cannot merge workout-referenced exercise definition ${sourceDefinition.id} into gym-only definition ${targetDefinition.id}`,
            );
            expectExerciseDefinitionRowToMatchFixture(
                readExerciseDefinitionRowOrThrow(context, sourceDefinition.id),
                sourceDefinition,
            );
            expect(
                readWorkoutExerciseDefinitionIdOrThrow(
                    context,
                    workout.blocks[0].exercises[0].id,
                ),
            ).toBe(sourceDefinition.id);
            expect(
                readWorkoutExerciseDefinitionIdOrThrow(
                    context,
                    workout.blocks[0].exercises[0].id,
                ),
            ).not.toBe(targetDefinition.id);
        });
        it.todo(
            'rejects merging gym references into a workout-only target when a gym definition is referenced by gym plans',
        );
    });

    describe('deleteUserExerciseDefinition', () => {
        describe('when a user definition is unreferenced', () => {
            it('deletes the exercise identity', () => {
                const definition = createExerciseDefinitionFixture({
                    id: 'definition-delete-me',
                    name: 'Delete Me',
                });
                const { exerciseDefinitionService } = context.testDb.dbServices;

                seedExerciseDefinition(context.testDb, definition);

                exerciseDefinitionService.deleteUserExerciseDefinition(
                    definition.id,
                );

                const deleted = context.testDb.db
                    .select()
                    .from(exerciseDefinitionsTable)
                    .where(eq(exerciseDefinitionsTable.id, definition.id))
                    .get();

                expect(deleted).toBeUndefined();
            });
        });

        describe('when a definition is protected', () => {
            it('preserves system and referenced exercise identities', () => {
                const systemDefinition =
                    readExerciseDefinitionByNormalizedNameOrThrow(
                        context,
                        'burpee',
                    );
                const userDefinition = createExerciseDefinitionFixture({
                    id: 'definition-referenced',
                    name: 'Referenced Exercise',
                });
                const workout = createWorkoutFixture({
                    id: 'referenced-delete-workout',
                });
                workout.blocks[0].exercises[0] = {
                    ...workout.blocks[0].exercises[0],
                    exerciseDefinitionId: userDefinition.id,
                    name: undefined,
                };
                const { exerciseDefinitionService } = context.testDb.dbServices;

                seedExerciseDefinition(context.testDb, userDefinition);
                seedPersistedWorkout(context.testDb, workout);

                expect(() => {
                    exerciseDefinitionService.deleteUserExerciseDefinition(
                        systemDefinition.id,
                    );
                }).toThrow(
                    `Cannot delete system exercise definition ${systemDefinition.id}`,
                );
                expect(() => {
                    exerciseDefinitionService.deleteUserExerciseDefinition(
                        userDefinition.id,
                    );
                }).toThrow(
                    `Cannot delete referenced exercise definition ${userDefinition.id}`,
                );

                expectExerciseDefinitionRowToMatchFixture(
                    readExerciseDefinitionRowOrThrow(
                        context,
                        userDefinition.id,
                    ),
                    userDefinition,
                );
            });
        });
    });
});
