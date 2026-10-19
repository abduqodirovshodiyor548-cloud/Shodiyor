import { z } from "zod";
import { isIsoDate, parsePeriodKey } from "./period.ts";
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
  /** Kunning fokus vazifasi ("Bugun" sahifasi). */
  focus: z.boolean().optional(),
  sortOrder: sortOrder.optional(),
  /** To'liq teglar to'plami (yangilashda almashtiriladi). */
  tagIds: z.array(id).max(50).optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// ---------- So'rov filtrlari (S1-06) ----------
//
// Davr filtri: `period` kaliti (`2026`, `2026-Q4`, `2026-10`, `2026-W43`, `2026-10-19`) yoki `from`/`to` sanalari
// (biri berilmasa — chegarasiz). Natijaga davr bilan kesishadigan yozuvlar kiradi.

/** Query satridagi bool: `true`/`1` yoki `false`/`0`. */
const queryBool = z.enum(["true", "false", "1", "0"]).transform((v) => v === "true" || v === "1");
/** Vergul bilan ajratilgan qiymatlar ro'yxati, masalan `status=todo,in_progress`. */
const csvEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .string()
    .transform((s) => s.split(",").filter(Boolean))
    .pipe(z.array(z.enum(values)).min(1));

/** Matnli qidiruv (S1-11): nom va izoh ichida, katta-kichik harfga qaramay. */
const searchField = z.string().trim().min(1).max(200).optional();

const periodFilterFields = {
  period: z
    .string()
    .refine((k) => parsePeriodKey(k) !== null, "Noto'g'ri davr kaliti")
    .optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
};
type PeriodFilter = { period?: string; from?: string; to?: string };
const periodFilterValid = (q: PeriodFilter) => !(q.period && (q.from || q.to)) && !(q.from && q.to && q.from > q.to);
const periodFilterMessage = { message: "`period` yoki `from`/`to` (from ≤ to) dan bittasini bering" };

/** Filtrdan sana oralig'i; filtr berilmagan bo'lsa `null`. */
export function periodRange(q: PeriodFilter): { start: string; end: string } | null {
  if (q.period) {
    const p = parsePeriodKey(q.period);
    if (!p) throw new RangeError(`Noto'g'ri davr kaliti: ${q.period}`);
    return { start: p.start, end: p.end };
  }
  if (!q.from && !q.to) return null;
  return { start: q.from ?? "0000-01-01", end: q.to ?? "9999-12-31" };
}

export const listGoalsQuerySchema = z
  .object({
    level: csvEnum(GOAL_LEVELS).optional(),
    status: csvEnum(GOAL_STATUSES).optional(),
    /** `root` — ota maqsadi yo'qlar. */
    parentId: z.union([z.literal("root"), id]).optional(),
    q: searchField,
    ...periodFilterFields,
  })
  .refine(periodFilterValid, periodFilterMessage);
export type ListGoalsQuery = z.infer<typeof listGoalsQuerySchema>;

export const listTasksQuerySchema = z
  .object({
    goalId: id.optional(),
    keyResultId: id.optional(),
    recurrenceId: id.optional(),
    status: csvEnum(TASK_STATUSES).optional(),
    planLevel: csvEnum(PLAN_LEVELS).optional(),
    /** `true` — faqat rejalashtirilmagan (inbox) vazifalar. Davr filtri bilan birga berilmaydi. */
    unplanned: queryBool.optional(),
    q: searchField,
    tagId: id.optional(),
    ...periodFilterFields,
    limit: z.coerce.number().int().min(1).max(1000).default(200),
  })
  .refine(periodFilterValid, periodFilterMessage)
  .refine((q) => !(q.unplanned && periodRange(q)), { message: "`unplanned` davr filtri bilan birga berilmaydi" });
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export const goalTreeQuerySchema = z
  .object({
    /** Berilsa — shu maqsad va uning avlodlari; aks holda davrdagi barcha ildiz maqsadlar. */
    rootId: id.optional(),
    status: csvEnum(GOAL_STATUSES).optional(),
    /** Har bir tugunga uning vazifalarini qo'shish. */
    includeTasks: queryBool.optional(),
    ...periodFilterFields,
  })
  .refine(periodFilterValid, periodFilterMessage);
export type GoalTreeQuery = z.infer<typeof goalTreeQuerySchema>;

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

/** Maqsadlar daraxti tuguni (S1-06). `taskCounts` — maqsadga bog'langan (KR orqali ham), bekor qilinmagan vazifalar. */
export interface GoalTreeNode extends GoalDto {
  keyResults: KeyResultDto[];
  taskCounts: { total: number; done: number };
  /** Faqat `includeTasks` so'ralganda. */
  tasks?: TaskDto[];
  children: GoalTreeNode[];
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
  focus: boolean;
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
