import { z } from "zod";
import { isIsoDate } from "./period.ts";
import { recurrenceRuleSchema, type RecurrenceRule } from "./recurrence.ts";

// ---------- Maqsadlar, key result'lar, vazifalar: API sxemalari va DTO'lar (S1-05) ----------
//
// Sxemalar server (REST), dashboard-mcp (S1-12) va web formalari uchun umumiy.
// PATCH qoidasi: maydon berilmasa (`undefined`) — o'zgarmaydi, `null` — tozalanadi.

/** Maqsad darajalari: yuqoridan pastga. Kunlik daraja — vazifalar. */
export const GOAL_LEVELS = ["year", "quarter", "month", "week"] as const;
export type GoalLevel = (typeof GOAL_LEVELS)[number];

/** Vazifa rejalashtirilgan davr darajasi: aniq kun, yoki hafta/oy ichida kun belgilanmagan. */
export const PLAN_LEVELS = ["day", "week", "month"] as const;
export type PlanLevel = (typeof PLAN_LEVELS)[number];

export const GOAL_STATUSES = ["active", "done", "dropped"] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

export const TASK_STATUSES = ["todo", "in_progress", "done", "cancelled"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

const id = z.uuid();
const isoDate = z.string().refine(isIsoDate, "Noto'g'ri sana (YYYY-MM-DD)");
const title = z.string().trim().min(1, "Nom bo'sh").max(500);
const longText = z.string().max(20_000);
const priority = z.number().int().min(0).max(3);
const sortOrder = z.number().int();
const estimateMinutes = z
  .number()
  .int()
  .min(1)
  .max(24 * 60);

// ---------- Maqsadlar ----------

export const createGoalSchema = z.object({
  level: z.enum(GOAL_LEVELS),
  title,
  description: longText.nullish(),
  parentId: id.nullish(),
  /** Davr ichidagi istalgan sana; server uni `level` davrining chegaralariga keltiradi. */
  date: isoDate,
  status: z.enum(GOAL_STATUSES).optional(),
  sortOrder: sortOrder.optional(),
});
export type CreateGoalInput = z.infer<typeof createGoalSchema>;

/** Darajani o'zgartirib bo'lmaydi — yangi maqsad yarating. */
export const updateGoalSchema = createGoalSchema.omit({ level: true }).partial();
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

// ---------- Key result'lar ----------

export const createKeyResultSchema = z.object({
  goalId: id,
  title,
  startValue: z.number().finite().optional(),
  /** Berilsa progress raqamdan, `null` bo'lsa bog'langan vazifalardan hisoblanadi. */
  targetValue: z.number().finite().nullish(),
  currentValue: z.number().finite().optional(),
  unit: z.string().trim().max(50).nullish(),
  sortOrder: sortOrder.optional(),
});
export type CreateKeyResultInput = z.infer<typeof createKeyResultSchema>;

export const updateKeyResultSchema = createKeyResultSchema.omit({ goalId: true }).partial();
export type UpdateKeyResultInput = z.infer<typeof updateKeyResultSchema>;

// ---------- Vazifalar ----------

/** Reja: daraja va davr ichidagi istalgan sana (server davr boshiga keltiradi). */
export const taskPlanSchema = z.object({ level: z.enum(PLAN_LEVELS), date: isoDate });
export type TaskPlanInput = z.infer<typeof taskPlanSchema>;

export const createTaskSchema = z.object({
  title,
  notes: longText.nullish(),
  goalId: id.nullish(),
  /** Berilsa `goalId` KR maqsadidan olinadi. */
  keyResultId: id.nullish(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: priority.optional(),
  plan: taskPlanSchema.nullish(),
  dueDate: isoDate.nullish(),
  estimateMinutes: estimateMinutes.nullish(),
  sortOrder: sortOrder.optional(),
  /** To'liq teglar to'plami (yangilashda almashtiriladi). */
  tagIds: z.array(id).max(50).optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const listTasksQuerySchema = z.object({
  goalId: id.optional(),
  keyResultId: id.optional(),
  recurrenceId: id.optional(),
  status: z.enum(TASK_STATUSES).optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(200),
});
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

// ---------- Takrorlanuvchi seriyalar ----------

const recurrenceFields = z.object({
  title,
  notes: longText.nullish(),
  goalId: id.nullish(),
  keyResultId: id.nullish(),
  priority: priority.optional(),
  estimateMinutes: estimateMinutes.nullish(),
  rule: recurrenceRuleSchema,
  startDate: isoDate,
  endDate: isoDate.nullish(),
  active: z.boolean().optional(),
});
const datesOrdered = (r: { startDate?: string; endDate?: string | null }) =>
  !r.startDate || !r.endDate || r.startDate <= r.endDate;
const datesMessage = { message: "Tugash sanasi boshlanishdan oldin", path: ["endDate"] };

export const createRecurrenceSchema = recurrenceFields.refine(datesOrdered, datesMessage);
export type CreateRecurrenceInput = z.infer<typeof createRecurrenceSchema>;

export const updateRecurrenceSchema = recurrenceFields.partial().refine(datesOrdered, datesMessage);
export type UpdateRecurrenceInput = z.infer<typeof updateRecurrenceSchema>;

// ---------- Teglar ----------

export const createTagSchema = z.object({
  name: z.string().trim().min(1, "Nom bo'sh").max(50),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Rang #RRGGBB ko'rinishida")
    .nullish(),
});
export type CreateTagInput = z.infer<typeof createTagSchema>;

export const updateTagSchema = createTagSchema.partial();
export type UpdateTagInput = z.infer<typeof updateTagSchema>;

// ---------- DTO'lar (vaqt belgilari — epoch ms) ----------

export interface GoalDto {
  id: string;
  parentId: string | null;
  level: GoalLevel;
  title: string;
  description: string | null;
  status: GoalStatus;
  periodStart: string;
  periodEnd: string;
  /** Masalan `2026-Q4`, `2026-W43`. */
  periodKey: string;
  progress: number;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

export interface KeyResultDto {
  id: string;
  goalId: string;
  title: string;
  startValue: number;
  targetValue: number | null;
  currentValue: number;
  unit: string | null;
  progress: number;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface GoalDetailDto extends GoalDto {
  keyResults: KeyResultDto[];
}

export interface TaskDto {
  id: string;
  goalId: string | null;
  keyResultId: string | null;
  title: string;
  notes: string | null;
  status: TaskStatus;
  priority: number;
  planLevel: PlanLevel | null;
  planStart: string | null;
  dueDate: string | null;
  estimateMinutes: number | null;
  recurrenceId: string | null;
  occurrenceDate: string | null;
  sortOrder: number;
  tagIds: string[];
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

export interface RecurrenceDto {
  id: string;
  goalId: string | null;
  keyResultId: string | null;
  title: string;
  notes: string | null;
  priority: number;
  estimateMinutes: number | null;
  rule: RecurrenceRule;
  /** Masalan "Har hafta: ish kunlari". */
  ruleText: string;
  startDate: string;
  endDate: string | null;
  active: boolean;
  generatedUntil: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface TagDto {
  id: string;
  name: string;
  color: string | null;
  createdAt: number;
}
