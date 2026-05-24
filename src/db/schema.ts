import { sql } from 'drizzle-orm';
import {
    index,
    integer,
    sqliteTable,
    text,
    uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

export const exerciseDefinitionsTable = sqliteTable('exercise_definitions', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    source: text('source', { enum: ['system', 'user'] }).notNull(),
    availability: text('availability', {
        enum: ['both', 'workout', 'gym'],
    }).notNull().default('both'),
    createdAtMs: integer('created_at_ms').notNull(),
    updatedAtMs: integer('updated_at_ms').notNull(),
}, (table) => [
    uniqueIndex('exercise_definitions_normalized_name_unique_idx').on(
        table.normalizedName
    ),
    index('exercise_definitions_source_idx').on(table.source),
    index('exercise_definitions_availability_idx').on(table.availability),
]);

export const workoutsTable = sqliteTable('workouts', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    currentVersionId: text('current_version_id')
        .notNull()
        .references((): AnySQLiteColumn => workoutVersionsTable.id, {
            onDelete: 'restrict',
        }),
    createdAtMs: integer('created_at_ms').notNull(),
    isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
    sortIndex: integer('sort_index').notNull(),
}, (table) => [
    index('workouts_current_version_idx').on(table.currentVersionId),
]);

export const workoutVersionsTable = sqliteTable('workout_versions', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    updatedAtMs: integer('updated_at_ms').notNull(),
});

export const workoutBlocksTable = sqliteTable('workout_blocks', {
    id: text('id').primaryKey(),
    workoutVersionId: text('workout_version_id')
        .notNull()
        .references(() => workoutVersionsTable.id, { onDelete: 'cascade' }),
    sortIndex: integer('sort_index').notNull(),
    title: text('title'),
    sets: integer('sets').notNull(),
    restBetweenSetsSec: integer('rest_between_sets_sec').notNull(),
    restBetweenExercisesSec: integer('rest_between_exercises_sec').notNull(),
}, (table) => [
    uniqueIndex('workout_blocks_version_sort_unique_idx').on(
        table.workoutVersionId,
        table.sortIndex
    ),
]);

export const workoutExercisesTable = sqliteTable('workout_exercises', {
    id: text('id').primaryKey(),
    blockId: text('block_id')
        .notNull()
        .references(() => workoutBlocksTable.id, { onDelete: 'cascade' }),
    sortIndex: integer('sort_index').notNull(),
    exerciseDefinitionId: text('exercise_definition_id').references(
        () => exerciseDefinitionsTable.id,
        { onDelete: 'restrict' }
    ),
    mode: text('mode', { enum: ['time', 'reps'] }).notNull(),
    value: integer('value').notNull(),
    tempo: text('tempo'),
}, (table) => [
    uniqueIndex('workout_exercises_block_sort_unique_idx').on(
        table.blockId,
        table.sortIndex
    ),
    index('workout_exercises_definition_idx').on(table.exerciseDefinitionId),
]);

export const workoutSessionsTable = sqliteTable('workout_sessions', {
    id: text('id').primaryKey(),
    startedAtMs: integer('started_at_ms').notNull(),
    endedAtMs: integer('ended_at_ms').notNull(),
    workoutVersionId: text('workout_version_id')
        .notNull()
        .references(() => workoutVersionsTable.id, { onDelete: 'restrict' }),
    totalDurationSec: integer('total_duration_sec'),
    statsJson: text('stats_json'),
}, (table) => [
    index('workout_sessions_version_idx').on(table.workoutVersionId),
]);

export const gymPlansTable = sqliteTable('gym_plans', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    createdAtMs: integer('created_at_ms').notNull(),
    updatedAtMs: integer('updated_at_ms').notNull(),
    isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
    isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
}, (table) => [
    index('gym_plans_archived_updated_idx').on(
        table.isArchived,
        table.updatedAtMs,
    ),
    index('gym_plans_favorite_idx').on(table.isFavorite),
]);

export const gymPlanSectionsTable = sqliteTable('gym_plan_sections', {
    id: text('id').primaryKey(),
    gymPlanId: text('gym_plan_id')
        .notNull()
        .references(() => gymPlansTable.id, { onDelete: 'cascade' }),
    title: text('title'),
    sortIndex: integer('sort_index').notNull(),
    createdAtMs: integer('created_at_ms').notNull(),
    updatedAtMs: integer('updated_at_ms').notNull(),
}, (table) => [
    uniqueIndex('gym_plan_sections_plan_sort_unique_idx').on(
        table.gymPlanId,
        table.sortIndex,
    ),
]);

export const gymPlanExercisesTable = sqliteTable('gym_plan_exercises', {
    id: text('id').primaryKey(),
    gymPlanSectionId: text('gym_plan_section_id')
        .notNull()
        .references(() => gymPlanSectionsTable.id, { onDelete: 'cascade' }),
    exerciseDefinitionId: text('exercise_definition_id')
        .notNull()
        .references(() => exerciseDefinitionsTable.id, { onDelete: 'restrict' }),
    sortIndex: integer('sort_index').notNull(),
    targetSets: integer('target_sets'),
    targetReps: integer('target_reps'),
    targetWeightGrams: integer('target_weight_grams'),
    targetDurationSec: integer('target_duration_sec'),
    targetDistanceMeters: integer('target_distance_meters'),
    restSec: integer('rest_sec'),
    notes: text('notes'),
    createdAtMs: integer('created_at_ms').notNull(),
    updatedAtMs: integer('updated_at_ms').notNull(),
}, (table) => [
    uniqueIndex('gym_plan_exercises_section_sort_unique_idx').on(
        table.gymPlanSectionId,
        table.sortIndex,
    ),
    index('gym_plan_exercises_definition_idx').on(table.exerciseDefinitionId),
]);

export const gymSessionsTable = sqliteTable('gym_sessions', {
    id: text('id').primaryKey(),
    startedAtMs: integer('started_at_ms').notNull(),
    endedAtMs: integer('ended_at_ms'),
    status: text('status', {
        enum: ['active', 'completed', 'discarded'],
    }).notNull(),
    sourceGymPlanId: text('source_gym_plan_id').references(
        () => gymPlansTable.id,
        { onDelete: 'set null' },
    ),
    notes: text('notes'),
    createdAtMs: integer('created_at_ms').notNull(),
    updatedAtMs: integer('updated_at_ms').notNull(),
}, (table) => [
    uniqueIndex('gym_sessions_single_active_idx')
        .on(table.status)
        .where(sql`${table.status} = 'active'`),
    index('gym_sessions_status_started_idx').on(
        table.status,
        table.startedAtMs,
    ),
    index('gym_sessions_source_plan_idx').on(table.sourceGymPlanId),
]);

export const gymExerciseRecordsTable = sqliteTable('gym_exercise_records', {
    id: text('id').primaryKey(),
    gymSessionId: text('gym_session_id')
        .notNull()
        .references(() => gymSessionsTable.id, { onDelete: 'cascade' }),
    exerciseDefinitionId: text('exercise_definition_id')
        .notNull()
        .references(() => exerciseDefinitionsTable.id, { onDelete: 'restrict' }),
    sourceGymPlanExerciseId: text('source_gym_plan_exercise_id').references(
        () => gymPlanExercisesTable.id,
        { onDelete: 'set null' },
    ),
    sortIndex: integer('sort_index').notNull(),
    startedAtMs: integer('started_at_ms'),
    completedAtMs: integer('completed_at_ms'),
    notes: text('notes'),
    createdAtMs: integer('created_at_ms').notNull(),
    updatedAtMs: integer('updated_at_ms').notNull(),
}, (table) => [
    uniqueIndex('gym_exercise_records_session_sort_unique_idx').on(
        table.gymSessionId,
        table.sortIndex,
    ),
    index('gym_exercise_records_definition_idx').on(
        table.exerciseDefinitionId,
    ),
    index('gym_exercise_records_source_plan_exercise_idx').on(
        table.sourceGymPlanExerciseId,
    ),
]);

export const gymExerciseRecordSetsTable = sqliteTable('gym_exercise_record_sets', {
    id: text('id').primaryKey(),
    gymExerciseRecordId: text('gym_exercise_record_id')
        .notNull()
        .references(() => gymExerciseRecordsTable.id, { onDelete: 'cascade' }),
    setIndex: integer('set_index').notNull(),
    reps: integer('reps'),
    weightGrams: integer('weight_grams'),
    durationSec: integer('duration_sec'),
    distanceMeters: integer('distance_meters'),
    rpeTenths: integer('rpe_tenths'),
    isWarmup: integer('is_warmup', { mode: 'boolean' }).notNull().default(false),
    completedAtMs: integer('completed_at_ms'),
    notes: text('notes'),
    createdAtMs: integer('created_at_ms').notNull(),
    updatedAtMs: integer('updated_at_ms').notNull(),
}, (table) => [
    uniqueIndex('gym_exercise_record_sets_record_set_unique_idx').on(
        table.gymExerciseRecordId,
        table.setIndex,
    ),
]);
