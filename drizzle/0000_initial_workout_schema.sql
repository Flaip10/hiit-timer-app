CREATE TABLE `exercise_definitions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`source` text NOT NULL,
	`availability` text DEFAULT 'both' NOT NULL,
	`created_at_ms` integer NOT NULL,
	`updated_at_ms` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_definitions_normalized_name_unique_idx` ON `exercise_definitions` (`normalized_name`);--> statement-breakpoint
CREATE INDEX `exercise_definitions_source_idx` ON `exercise_definitions` (`source`);--> statement-breakpoint
CREATE INDEX `exercise_definitions_availability_idx` ON `exercise_definitions` (`availability`);--> statement-breakpoint
CREATE TABLE `workout_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_version_id` text NOT NULL,
	`sort_index` integer NOT NULL,
	`title` text,
	`sets` integer NOT NULL,
	`rest_between_sets_sec` integer NOT NULL,
	`rest_between_exercises_sec` integer NOT NULL,
	FOREIGN KEY (`workout_version_id`) REFERENCES `workout_versions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `workout_blocks_version_sort_idx` ON `workout_blocks` (`workout_version_id`,`sort_index`);--> statement-breakpoint
CREATE TABLE `workout_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`block_id` text NOT NULL,
	`sort_index` integer NOT NULL,
	`exercise_definition_id` text,
	`mode` text NOT NULL,
	`value` integer NOT NULL,
	`tempo` text,
	FOREIGN KEY (`block_id`) REFERENCES `workout_blocks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_definition_id`) REFERENCES `exercise_definitions`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `workout_exercises_block_sort_idx` ON `workout_exercises` (`block_id`,`sort_index`);--> statement-breakpoint
CREATE INDEX `workout_exercises_definition_idx` ON `workout_exercises` (`exercise_definition_id`);--> statement-breakpoint
CREATE TABLE `workout_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`started_at_ms` integer NOT NULL,
	`ended_at_ms` integer NOT NULL,
	`workout_version_id` text NOT NULL,
	`workout_name_snapshot` text,
	`total_duration_sec` integer,
	`stats_json` text,
	FOREIGN KEY (`workout_version_id`) REFERENCES `workout_versions`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `workout_sessions_version_idx` ON `workout_sessions` (`workout_version_id`);--> statement-breakpoint
CREATE TABLE `workout_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`updated_at_ms` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`current_version_id` text NOT NULL,
	`created_at_ms` integer NOT NULL,
	`is_favorite` integer DEFAULT false NOT NULL,
	`sort_index` integer NOT NULL,
	FOREIGN KEY (`current_version_id`) REFERENCES `workout_versions`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `workouts_current_version_idx` ON `workouts` (`current_version_id`);