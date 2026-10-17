CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text,
	`level` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'active' NOT NULL,
	`period_start` text NOT NULL,
	`period_end` text NOT NULL,
	`progress` real DEFAULT 0 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "goals_period_check" CHECK("goals"."period_start" <= "goals"."period_end"),
	CONSTRAINT "goals_progress_check" CHECK("goals"."progress" BETWEEN 0 AND 1)
);
--> statement-breakpoint
CREATE INDEX `goals_level_period_idx` ON `goals` (`level`,`period_start`);--> statement-breakpoint
CREATE INDEX `goals_parent_idx` ON `goals` (`parent_id`);--> statement-breakpoint
CREATE TABLE `key_results` (
	`id` text PRIMARY KEY NOT NULL,
	`goal_id` text NOT NULL,
	`title` text NOT NULL,
	`start_value` real DEFAULT 0 NOT NULL,
	`target_value` real,
	`current_value` real DEFAULT 0 NOT NULL,
	`unit` text,
	`progress` real DEFAULT 0 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "key_results_progress_check" CHECK("key_results"."progress" BETWEEN 0 AND 1)
);
--> statement-breakpoint
CREATE INDEX `key_results_goal_idx` ON `key_results` (`goal_id`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_idx` ON `tags` (lower("name"));--> statement-breakpoint
CREATE TABLE `task_tags` (
	`task_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`task_id`, `tag_id`),
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `task_tags_tag_idx` ON `task_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`goal_id` text,
	`key_result_id` text,
	`title` text NOT NULL,
	`notes` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`plan_level` text,
	`plan_start` text,
	`due_date` text,
	`estimate_minutes` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`key_result_id`) REFERENCES `key_results`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "tasks_priority_check" CHECK("tasks"."priority" BETWEEN 0 AND 3),
	CONSTRAINT "tasks_plan_check" CHECK(("tasks"."plan_level" IS NULL) = ("tasks"."plan_start" IS NULL))
);
--> statement-breakpoint
CREATE INDEX `tasks_plan_idx` ON `tasks` (`plan_level`,`plan_start`);--> statement-breakpoint
CREATE INDEX `tasks_goal_idx` ON `tasks` (`goal_id`);--> statement-breakpoint
CREATE INDEX `tasks_key_result_idx` ON `tasks` (`key_result_id`);--> statement-breakpoint
CREATE INDEX `tasks_status_idx` ON `tasks` (`status`);