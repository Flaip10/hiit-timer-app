import { and, asc, eq, exists, like, or } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import type {
    ExerciseDefinition,
    ExerciseDefinitionAvailability,
    ExerciseDefinitionSource,
} from '@src/core/entities/entities';
import { normalizeExerciseName } from '@src/core/exercises/normalizeExerciseName';

import {
    exerciseDefinitionsTable,
    workoutExercisesTable,
} from '../../schema';
import { buildExerciseDefinitionError } from './exerciseDefinitionErrors';
import type * as schema from '../../schema';

export type ExerciseDefinitionRepositoryDb = BaseSQLiteDatabase<
    'sync',
    unknown,
    typeof schema
>;

type ExerciseDefinitionDbInsert = typeof exerciseDefinitionsTable.$inferInsert;
type ExerciseDefinitionDbRow = typeof exerciseDefinitionsTable.$inferSelect;

export interface CreateExerciseDefinitionInput {
    availability: ExerciseDefinitionAvailability;
    createdAtMs: number;
    id: string;
    name: string;
    normalizedName: string;
    source: ExerciseDefinitionSource;
    updatedAtMs: number;
}

export interface UpdateExerciseDefinitionInput {
    availability?: ExerciseDefinitionAvailability;
    id: string;
    name?: string;
    normalizedName?: string;
    source?: ExerciseDefinitionSource;
    updatedAtMs: number;
}

export interface ExerciseDefinitionListFilters {
    availability?: ExerciseDefinitionAvailability;
    name?: string;
    namePrefix?: string;
    source?: ExerciseDefinitionSource;
}

export interface ExerciseDefinitionListPagination {
    limit?: number;
}

export type ExerciseDefinitionListScope = 'active' | 'all';

export interface ExerciseDefinitionListParams {
    filters?: ExerciseDefinitionListFilters;
    pagination?: ExerciseDefinitionListPagination;
    scope?: ExerciseDefinitionListScope;
}

export interface ExerciseDefinitionRepository {
    create: (input: CreateExerciseDefinitionInput) => ExerciseDefinition;
    deleteById: (id: string) => void;
    getAll: () => ExerciseDefinition[];
    getById: (id: string) => ExerciseDefinition | null;
    getByNormalizedName: (normalizedName: string) => ExerciseDefinition | null;
    hasWorkoutExerciseReferences: (id: string) => boolean;
    list: (params?: ExerciseDefinitionListParams) => ExerciseDefinition[];
    replaceWorkoutExerciseDefinitionReferences: (input: {
        sourceId: string;
        targetId: string;
    }) => void;
    update: (input: UpdateExerciseDefinitionInput) => ExerciseDefinition;
}

export interface CreateExerciseDefinitionRepositoryArgs {
    db: ExerciseDefinitionRepositoryDb;
}

const exerciseDefinitionFromRow = (
    row: ExerciseDefinitionDbRow,
): ExerciseDefinition => ({
    id: row.id,
    name: row.name,
    normalizedName: row.normalizedName,
    source: row.source,
    availability: row.availability,
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
});

export const createExerciseDefinitionRepository = ({
    db,
}: CreateExerciseDefinitionRepositoryArgs): ExerciseDefinitionRepository => {
    const assertUniqueNormalizedName = (
        normalizedName: string,
        existingId?: string,
    ): void => {
        if (normalizedName.length === 0) {
            throw new Error('Exercise definition normalized name cannot be blank');
        }

        const existing = repository.getByNormalizedName(normalizedName);
        if (existing && existing.id !== existingId) {
            throw buildExerciseDefinitionError(
                'DUPLICATE_NAME',
                `Exercise definition already exists for normalized name "${normalizedName}"`,
            );
        }
    };

    const normalizeLimit = (limit?: number): number | undefined =>
        limit !== undefined && Number.isInteger(limit) && limit > 0
            ? limit
            : undefined;

    const normalizeNameFilter = (name?: string): string | undefined => {
        if (!name) return undefined;

        const normalizedName = normalizeExerciseName(name);

        return normalizedName.length > 0 ? normalizedName : undefined;
    };

    const repository: ExerciseDefinitionRepository = {
        create: (input: CreateExerciseDefinitionInput): ExerciseDefinition => {
            assertUniqueNormalizedName(input.normalizedName);

            const definitionInsert: ExerciseDefinitionDbInsert = input;

            db.insert(exerciseDefinitionsTable)
                .values(definitionInsert)
                .run();

            return input;
        },

        deleteById: (id: string): void => {
            db.delete(exerciseDefinitionsTable)
                .where(eq(exerciseDefinitionsTable.id, id))
                .run();
        },

        getAll: (): ExerciseDefinition[] =>
            db
                .select()
                .from(exerciseDefinitionsTable)
                .orderBy(asc(exerciseDefinitionsTable.name))
                .all()
                .map(exerciseDefinitionFromRow),

        getById: (id: string): ExerciseDefinition | null => {
            const row = db
                .select()
                .from(exerciseDefinitionsTable)
                .where(eq(exerciseDefinitionsTable.id, id))
                .get();

            return row ? exerciseDefinitionFromRow(row) : null;
        },

        getByNormalizedName: (
            normalizedName: string,
        ): ExerciseDefinition | null => {
            const row = db
                .select()
                .from(exerciseDefinitionsTable)
                .where(eq(exerciseDefinitionsTable.normalizedName, normalizedName))
                .get();

            return row ? exerciseDefinitionFromRow(row) : null;
        },

        hasWorkoutExerciseReferences: (id: string): boolean => {
            const reference = db
                .select({ id: workoutExercisesTable.id })
                .from(workoutExercisesTable)
                .where(eq(workoutExercisesTable.exerciseDefinitionId, id))
                .limit(1)
                .get();

            return reference !== undefined;
        },

        list: ({
            filters,
            pagination,
            scope = 'active',
        }: ExerciseDefinitionListParams = {}): ExerciseDefinition[] => {
            const normalizedNameFilter = normalizeNameFilter(filters?.name);
            const normalizedNamePrefixFilter = normalizeNameFilter(
                filters?.namePrefix,
            );
            const conditions = [
                scope === 'active'
                    ? or(
                          eq(exerciseDefinitionsTable.source, 'user'),
                          exists(
                              db
                                  .select({ id: workoutExercisesTable.id })
                                  .from(workoutExercisesTable)
                                  .where(
                                      eq(
                                          workoutExercisesTable.exerciseDefinitionId,
                                          exerciseDefinitionsTable.id,
                                      ),
                                  ),
                          ),
                      )
                    : undefined,
                filters?.source
                    ? eq(exerciseDefinitionsTable.source, filters.source)
                    : undefined,
                filters?.availability
                    ? or(
                          eq(exerciseDefinitionsTable.availability, 'both'),
                          eq(
                              exerciseDefinitionsTable.availability,
                              filters.availability,
                          ),
                      )
                    : undefined,
                normalizedNameFilter
                    ? like(
                          exerciseDefinitionsTable.normalizedName,
                          `%${normalizedNameFilter}%`,
                      )
                    : undefined,
                normalizedNamePrefixFilter
                    ? like(
                          exerciseDefinitionsTable.normalizedName,
                          `${normalizedNamePrefixFilter}%`,
                      )
                    : undefined,
            ];
            const whereClause = and(...conditions);
            const query = db
                .select()
                .from(exerciseDefinitionsTable)
                .where(whereClause)
                .orderBy(asc(exerciseDefinitionsTable.name));
            const limit = normalizeLimit(pagination?.limit);
            const rows =
                limit === undefined ? query.all() : query.limit(limit).all();

            return rows.map(exerciseDefinitionFromRow);
        },

        replaceWorkoutExerciseDefinitionReferences: ({
            sourceId,
            targetId,
        }): void => {
            db.update(workoutExercisesTable)
                .set({ exerciseDefinitionId: targetId })
                .where(eq(workoutExercisesTable.exerciseDefinitionId, sourceId))
                .run();
        },

        update: (input: UpdateExerciseDefinitionInput): ExerciseDefinition => {
            const existing = repository.getById(input.id);
            if (!existing) {
                throw new Error(`Exercise definition ${input.id} was not found`);
            }

            if (input.normalizedName !== undefined) {
                assertUniqueNormalizedName(input.normalizedName, input.id);
            }

            const next: ExerciseDefinition = {
                ...existing,
                name: input.name ?? existing.name,
                normalizedName: input.normalizedName ?? existing.normalizedName,
                source: input.source ?? existing.source,
                availability: input.availability ?? existing.availability,
                updatedAtMs: input.updatedAtMs,
            };
            const updateValues: Partial<ExerciseDefinitionDbInsert> = {
                name: next.name,
                normalizedName: next.normalizedName,
                source: next.source,
                availability: next.availability,
                updatedAtMs: next.updatedAtMs,
            };

            db.update(exerciseDefinitionsTable)
                .set(updateValues)
                .where(eq(exerciseDefinitionsTable.id, input.id))
                .run();

            return next;
        },
    };

    return repository;
};
