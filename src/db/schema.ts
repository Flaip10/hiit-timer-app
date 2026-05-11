import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const workoutsTable = sqliteTable('workouts', {
    id: text('id').primaryKey(),
    currentVersionId: text('current_version_id').notNull(),
    createdAtMs: integer('created_at_ms').notNull(),
    isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
    sortIndex: integer('sort_index').notNull(),
});

export const workoutVersionsTable = sqliteTable('workout_versions', {
    id: text('id').primaryKey(),
    workoutId: text('workout_id').references(() => workoutsTable.id, {
        onDelete: 'set null',
    }),
    name: text('name').notNull(),
    updatedAtMs: integer('updated_at_ms').notNull(),
}, (table) => [
    index('workout_versions_workout_id_idx').on(table.workoutId),
]);

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
    index('workout_blocks_version_sort_idx').on(
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
    name: text('name'),
    mode: text('mode', { enum: ['time', 'reps'] }).notNull(),
    value: integer('value').notNull(),
    tempo: text('tempo'),
}, (table) => [
    index('workout_exercises_block_sort_idx').on(
        table.blockId,
        table.sortIndex
    ),
]);

export const workoutSessionsTable = sqliteTable('workout_sessions', {
    id: text('id').primaryKey(),
    startedAtMs: integer('started_at_ms').notNull(),
    endedAtMs: integer('ended_at_ms').notNull(),
    workoutId: text('workout_id').references(() => workoutsTable.id, {
        onDelete: 'set null',
    }),
    workoutVersionId: text('workout_version_id')
        .notNull()
        .references(() => workoutVersionsTable.id, { onDelete: 'restrict' }),
    workoutNameSnapshot: text('workout_name_snapshot'),
    totalDurationSec: integer('total_duration_sec'),
    statsJson: text('stats_json'),
}, (table) => [
    index('workout_sessions_version_idx').on(table.workoutVersionId),
    index('workout_sessions_workout_id_idx').on(table.workoutId),
]);
