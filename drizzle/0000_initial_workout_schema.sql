CREATE TABLE `workout_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_id` text NOT NULL,
	`sort_index` integer NOT NULL,
	`title` text,
	`sets` integer NOT NULL,
	`rest_between_sets_sec` integer NOT NULL,
	`rest_between_exercises_sec` integer NOT NULL,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workout_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`block_id` text NOT NULL,
	`sort_index` integer NOT NULL,
	`name` text,
	`mode` text NOT NULL,
	`value` integer NOT NULL,
	`tempo` text,
	FOREIGN KEY (`block_id`) REFERENCES `workout_blocks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workout_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`started_at_ms` integer NOT NULL,
	`ended_at_ms` integer NOT NULL,
	`workout_id` text,
	`workout_name_snapshot` text,
	`total_duration_sec` integer,
	`workout_snapshot_json` text NOT NULL,
	`stats_json` text,
	`sort_index` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`updated_at_ms` integer NOT NULL,
	`is_favorite` integer DEFAULT false NOT NULL,
	`sort_index` integer NOT NULL
);
