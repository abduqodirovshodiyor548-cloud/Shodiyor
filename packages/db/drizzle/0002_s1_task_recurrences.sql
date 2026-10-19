CREATE TABLE `task_recurrences` (
	`id` text PRIMARY KEY NOT NULL,
	`goal_id` text,
	`key_result_id` text,
	`title` text NOT NULL,
	`notes` text,
	`priority` integer DEFAULT 0 NOT NULL,
	`estimate_minutes` integer,
	`rule` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`active` integer DEFAULT true NOT NULL,
	`generated_until` text,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`key_result_id`) REFERENCES `key_results`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "task_recurrences_priority_check" CHECK("task_recurrences"."priority" BETWEEN 0 AND 3),
	CONSTRAINT "task_recurrences_dates_check" CHECK("task_recurrences"."end_date" IS NULL OR "task_recurrences"."start_date" <= "task_recurrences"."end_date")
);
--> statement-breakpoint
CREATE INDEX `task_recurrences_active_idx` ON `task_recurrences` (`active`);--> statement-breakpoint
ALTER TABLE `tasks` ADD `recurrence_id` text REFERENCES task_recurrences(id) ON DELETE set null;--> statement-breakpoint
ALTER TABLE `tasks` ADD `occurrence_date` text;--> statement-breakpoint
CREATE UNIQUE INDEX `tasks_recurrence_occurrence_idx` ON `tasks` (`recurrence_id`,`occurrence_date`);