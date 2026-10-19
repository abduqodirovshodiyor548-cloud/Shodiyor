import { randomUUID } from "node:crypto";
import { GOAL_LEVELS, GOAL_STATUSES, PLAN_LEVELS, TASK_STATUSES, type RecurrenceRule } from "@loiha/shared";
import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

const now = sql`(unixepoch('subsec') * 1000)`;
const timestamp = (name: string) => integer(name, { mode: "timestamp_ms" });

/** Kalit-qiymat sozlamalari (integratsiyalar, brend, cron vaqtlari va h.k.). */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).$type<unknown>().notNull(),
  updatedAt: timestamp("updated_at").notNull().default(now),
});

export const JOB_STATUSES = ["queued", "running", "succeeded", "failed", "cancelled"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

/** Fon vazifalari navbati. Hozircha asosan Claude CLI chaqiruvlari. */
export const jobs = sqliteTable(
  "jobs",
  {
    id: text("id").primaryKey(),
    kind: text("kind").notNull(),
    profile: text("profile").notNull().default("default"),
    status: text("status", { enum: JOB_STATUSES }).notNull().default("queued"),
    input: text("input", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    result: text("result"),
    error: text("error"),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(1),
    claudeSessionId: text("claude_session_id"),
    costUsd: real("cost_usd"),
    cancelRequested: integer("cancel_requested", { mode: "boolean" }).notNull().default(false),
    runAfter: timestamp("run_after").notNull().default(now),
    createdAt: timestamp("created_at").notNull().default(now),
    startedAt: timestamp("started_at"),
    finishedAt: timestamp("finished_at"),
  },
  (t) => [index("jobs_status_run_after_idx").on(t.status, t.runAfter)],
);

/** Job davomida chiqqan hodisalar (Claude stream-json xabarlari, loglar). SSE shu jadvaldan qayta o'ynatiladi. */
export const jobEvents = sqliteTable(
  "job_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    jobId: text("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    seq: integer("seq").notNull(),
    type: text("type").notNull(),
    data: text("data", { mode: "json" }).$type<unknown>().notNull(),
    createdAt: timestamp("created_at").notNull().default(now),
  },
  (t) => [uniqueIndex("job_events_job_seq_idx").on(t.jobId, t.seq)],
);

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type JobEvent = typeof jobEvents.$inferSelect;

// ─── Maqsadlar va vazifalar (S1) ───────────────────────────────────────────────

// Enum qiymatlari @loiha/shared da (API sxemalari bilan bitta manba).
export { GOAL_LEVELS, GOAL_STATUSES, PLAN_LEVELS, TASK_STATUSES };
export type { GoalLevel, GoalStatus, PlanLevel, TaskStatus } from "@loiha/shared";

const uuid = (name: string) => text(name).$defaultFn(() => randomUUID());
const updatedAt = () =>
  timestamp("updated_at")
    .notNull()
    .default(now)
    .$onUpdate(() => new Date());
/** `YYYY-MM-DD` ko'rinishidagi sana (lokal kalendar kuni, vaqt zonasisiz). */
const isoDate = (name: string) => text(name);

/**
 * Maqsadlar ierarxiyasi: yil → kvartal → oy → hafta.
 * Davr `period_start`…`period_end` (ikkalasi ham kiradi) bilan beriladi; chegaralar S1-02 da hisoblanadi.
 * `progress` — 0…1, key result va vazifalardan yig'iladigan kesh (S1-03).
 */
export const goals = sqliteTable(
  "goals",
  {
    id: uuid("id").primaryKey(),
    parentId: text("parent_id").references((): AnySQLiteColumn => goals.id, { onDelete: "set null" }),
    level: text("level", { enum: GOAL_LEVELS }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status", { enum: GOAL_STATUSES }).notNull().default("active"),
    periodStart: isoDate("period_start").notNull(),
    periodEnd: isoDate("period_end").notNull(),
    progress: real("progress").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().default(now),
    updatedAt: updatedAt(),
    completedAt: timestamp("completed_at"),
  },
  (t) => [
    index("goals_level_period_idx").on(t.level, t.periodStart),
    index("goals_parent_idx").on(t.parentId),
    check("goals_period_check", sql`${t.periodStart} <= ${t.periodEnd}`),
    check("goals_progress_check", sql`${t.progress} BETWEEN 0 AND 1`),
  ],
);

/**
 * Maqsadning o'lchanadigan natijalari.
 * `target_value` berilsa progress raqamdan (start → target), aks holda bog'langan vazifalardan hisoblanadi.
 */
export const keyResults = sqliteTable(
  "key_results",
  {
    id: uuid("id").primaryKey(),
    goalId: text("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    startValue: real("start_value").notNull().default(0),
    targetValue: real("target_value"),
    currentValue: real("current_value").notNull().default(0),
    unit: text("unit"),
    progress: real("progress").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().default(now),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("key_results_goal_idx").on(t.goalId),
    check("key_results_progress_check", sql`${t.progress} BETWEEN 0 AND 1`),
  ],
);

/**
 * Takrorlanuvchi vazifa seriyalari (S1-04). Seriya o'zi vazifa emas — progressga kirmaydi;
 * har bir takrorlanish `tasks` da alohida kunlik vazifa sifatida yaratiladi (`recurrence_id` + `occurrence_date`).
 * `generated_until` — shu sanagacha (kiradi) vazifalar yaratilgan; o'chirilgan takrorlanish qayta yaratilmaydi.
 */
export const taskRecurrences = sqliteTable(
  "task_recurrences",
  {
    id: uuid("id").primaryKey(),
    goalId: text("goal_id").references(() => goals.id, { onDelete: "set null" }),
    keyResultId: text("key_result_id").references(() => keyResults.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    notes: text("notes"),
    priority: integer("priority").notNull().default(0),
    estimateMinutes: integer("estimate_minutes"),
    rule: text("rule", { mode: "json" }).$type<RecurrenceRule>().notNull(),
    startDate: isoDate("start_date").notNull(),
    endDate: isoDate("end_date"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    generatedUntil: isoDate("generated_until"),
    createdAt: timestamp("created_at").notNull().default(now),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("task_recurrences_active_idx").on(t.active),
    check("task_recurrences_priority_check", sql`${t.priority} BETWEEN 0 AND 3`),
    check("task_recurrences_dates_check", sql`${t.endDate} IS NULL OR ${t.startDate} <= ${t.endDate}`),
  ],
);

/**
 * Vazifalar. Maqsad yoki key result'ga bog'lanishi ixtiyoriy (inbox vazifalari).
 * Rejalashtirish: `plan_level` + `plan_start` (kun — o'sha sana, hafta — dushanba, oy — 1-kun); ikkalasi ham bo'sh — rejalashtirilmagan.
 * `priority`: 0 — yo'q, 1 — past, 2 — o'rta, 3 — yuqori.
 */
export const tasks = sqliteTable(
  "tasks",
  {
    id: uuid("id").primaryKey(),
    goalId: text("goal_id").references(() => goals.id, { onDelete: "set null" }),
    keyResultId: text("key_result_id").references(() => keyResults.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    notes: text("notes"),
    status: text("status", { enum: TASK_STATUSES }).notNull().default("todo"),
    priority: integer("priority").notNull().default(0),
    planLevel: text("plan_level", { enum: PLAN_LEVELS }),
    planStart: isoDate("plan_start"),
    dueDate: isoDate("due_date"),
    estimateMinutes: integer("estimate_minutes"),
    /** Takrorlanuvchi seriya (S1-04); seriya o'chirilsa vazifa oddiy vazifa bo'lib qoladi. */
    recurrenceId: text("recurrence_id").references(() => taskRecurrences.id, { onDelete: "set null" }),
    /** Seriyadagi takrorlanish sanasi; vazifa boshqa kunga ko'chirilsa ham o'zgarmaydi. */
    occurrenceDate: isoDate("occurrence_date"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().default(now),
    updatedAt: updatedAt(),
    completedAt: timestamp("completed_at"),
  },
  (t) => [
    index("tasks_plan_idx").on(t.planLevel, t.planStart),
    uniqueIndex("tasks_recurrence_occurrence_idx").on(t.recurrenceId, t.occurrenceDate),
    index("tasks_goal_idx").on(t.goalId),
    index("tasks_key_result_idx").on(t.keyResultId),
    index("tasks_status_idx").on(t.status),
    check("tasks_priority_check", sql`${t.priority} BETWEEN 0 AND 3`),
    check("tasks_plan_check", sql`(${t.planLevel} IS NULL) = (${t.planStart} IS NULL)`),
  ],
);

/** Teglar; nomi katta-kichik harfdan qat'i nazar yagona. */
export const tags = sqliteTable(
  "tags",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    color: text("color"),
    createdAt: timestamp("created_at").notNull().default(now),
  },
  (t) => [uniqueIndex("tags_name_idx").on(sql`lower(${t.name})`)],
);

export const taskTags = sqliteTable(
  "task_tags",
  {
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.taskId, t.tagId] }), index("task_tags_tag_idx").on(t.tagId)],
);

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type KeyResult = typeof keyResults.$inferSelect;
export type NewKeyResult = typeof keyResults.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type TaskRecurrence = typeof taskRecurrences.$inferSelect;
export type NewTaskRecurrence = typeof taskRecurrences.$inferInsert;
