import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const workoutsTable = sqliteTable('workouts', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    updatedAtMs: integer('updated_at_ms').notNull(),
    isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
    sortIndex: integer('sort_index').notNull(),
});

export const workoutBlocksTable = sqliteTable('workout_blocks', {
    id: text('id').primaryKey(),
    workoutId: text('workout_id')
        .notNull()
        .references(() => workoutsTable.id, { onDelete: 'cascade' }),
    sortIndex: integer('sort_index').notNull(),
    title: text('title'),
    sets: integer('sets').notNull(),
    restBetweenSetsSec: integer('rest_between_sets_sec').notNull(),
    restBetweenExercisesSec: integer('rest_between_exercises_sec').notNull(),
});

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
});

export const workoutSessionsTable = sqliteTable('workout_sessions', {
    id: text('id').primaryKey(),
    startedAtMs: integer('started_at_ms').notNull(),
    endedAtMs: integer('ended_at_ms').notNull(),
    workoutId: text('workout_id'),
    workoutNameSnapshot: text('workout_name_snapshot'),
    totalDurationSec: integer('total_duration_sec'),
    workoutSnapshotJson: text('workout_snapshot_json').notNull(),
    statsJson: text('stats_json'),
    sortIndex: integer('sort_index').notNull(),
});
