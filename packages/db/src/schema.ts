import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

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
