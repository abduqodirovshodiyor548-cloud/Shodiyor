import { and, asc, desc, eq, gte, inArray, isNull, lte, ne, or, sql, type SQL } from "drizzle-orm";
import {
  GOAL_LEVELS,
  describeRecurrence,
  periodKey,
  periodOf,
  periodRange,
  addDays,
  toLocalIsoDate,
  type CreateGoalInput,
  type CreateKeyResultInput,
  type CreateRecurrenceInput,
  type CreateTagInput,
  type CreateTaskInput,
  type GoalDetailDto,
  type GoalDto,
  type GoalLevel,
  type GoalTreeNode,
  type GoalTreeQuery,
  type KeyResultDto,
  type ListGoalsQuery,
  type ListTasksQuery,
  type RecurrenceDto,
  type TagDto,
  type TaskDto,
  type TaskPlanInput,
  type UpdateGoalInput,
  type UpdateKeyResultInput,
  type UpdateRecurrenceInput,
  type UpdateTagInput,
  type UpdateTaskInput,
} from "@loiha/shared";
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import type { Db } from "./index.ts";
import { recomputeForTask, recomputeFromKeyResult, recomputeGoalUpwards, type Tx } from "./progress.ts";
import { materializeRecurrences, resetFutureOccurrences } from "./recurrence.ts";
import {
  goals,
  keyResults,
  tags,
  taskRecurrences,
  taskTags,
  tasks,
  type Goal,
  type KeyResult,
  type Tag,
  type Task,
  type TaskRecurrence,
} from "./schema.ts";

// Maqsadlar, key result'lar, vazifalar, takrorlanuvchi seriyalar va teglar ustida yozish amallari (S1-05).
// REST API (apps/server) va dashboard-mcp (S1-12) shu funksiyalardan foydalanadi: tekshiruvlar va progress keshini
// yangilash (Q-031) bitta joyda. Har bir yozish o'z tranzaksiyasida, `recompute*` bilan birga bajariladi.

export type PlanningErrorCode = "not_found" | "invalid" | "conflict";

/** Biznes qoidasi buzilganda; server uni HTTP statusga o'giradi (404 / 400 / 409). */
export class PlanningError extends Error {
  constructor(
    readonly code: PlanningErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PlanningError";
  }
}

const notFound = (what: string) => new PlanningError("not_found", `${what} topilmadi`);
const ms = (d: Date) => d.getTime();
const msOrNull = (d: Date | null) => d?.getTime() ?? null;

// ---------- DTO ----------

export function toGoalDto(g: Goal): GoalDto {
  return {
    ...g,
    periodKey: periodKey({ level: g.level, start: g.periodStart }),
    createdAt: ms(g.createdAt),
    updatedAt: ms(g.updatedAt),
    completedAt: msOrNull(g.completedAt),
  };
}

export function toKeyResultDto(kr: KeyResult): KeyResultDto {
  return { ...kr, createdAt: ms(kr.createdAt), updatedAt: ms(kr.updatedAt) };
}

function toTaskDto(t: Task, tagIds: string[]): TaskDto {
  return {
    ...t,
    tagIds,
    createdAt: ms(t.createdAt),
    updatedAt: ms(t.updatedAt),
    completedAt: msOrNull(t.completedAt),
  };
}

export function toRecurrenceDto(r: TaskRecurrence): RecurrenceDto {
  return { ...r, ruleText: describeRecurrence(r.rule), createdAt: ms(r.createdAt), updatedAt: ms(r.updatedAt) };
}

export function toTagDto(t: Tag): TagDto {
  return { ...t, createdAt: ms(t.createdAt) };
}

// ---------- Umumiy tekshiruvlar ----------

function requireGoal(db: Tx, id: string): Goal {
  const goal = db.select().from(goals).where(eq(goals.id, id)).get();
  if (!goal) throw notFound("Maqsad");
  return goal;
}

function requireKeyResult(db: Tx, id: string): KeyResult {
  const kr = db.select().from(keyResults).where(eq(keyResults.id, id)).get();
  if (!kr) throw notFound("Key result");
  return kr;
}

function requireTask(db: Tx, id: string): Task {
  const task = db.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!task) throw notFound("Vazifa");
  return task;
}

function requireRecurrence(db: Tx, id: string): TaskRecurrence {
  const r = db.select().from(taskRecurrences).where(eq(taskRecurrences.id, id)).get();
  if (!r) throw notFound("Takrorlanuvchi vazifa");
  return r;
}

const levelRank = (level: GoalLevel) => GOAL_LEVELS.indexOf(level);

/** Ota maqsad darajasi yuqori va davri bola davrini to'liq qamragan bo'lishi kerak (sikl ham shu bilan istisno). */
function checkParent(db: Tx, parentId: string, level: GoalLevel, start: string, end: string): void {
  const parent = requireGoal(db, parentId);
  if (levelRank(parent.level) >= levelRank(level)) {
    throw new PlanningError("invalid", `Ota maqsad darajasi (${parent.level}) ${level} dan yuqori bo'lishi kerak`);
  }
  if (start < parent.periodStart || end > parent.periodEnd) {
    throw new PlanningError("invalid", "Maqsad davri ota maqsad davri ichida bo'lishi kerak");
  }
}

/** Status o'zgarganda `completed_at`: yakunlanganda hozirgi vaqt, qayta ochilganda `null`. */
function completedAtFor(done: boolean, prev: { completedAt: Date | null } | null): Date | null | undefined {
  if (done) return prev?.completedAt ?? new Date();
  return prev?.completedAt ? null : undefined;
}

/**
 * Vazifa/seriyaning maqsad va KR bog'lanishi. KR berilsa maqsad KR maqsadidan olinadi
 * (progress faqat KR orqali sanaladi, Q-030; KR o'chirilsa vazifa maqsadning to'g'ridan-to'g'ri vazifasiga aylanadi).
 */
function resolveLink(
  db: Tx,
  goalId: string | null | undefined,
  keyResultId: string | null | undefined,
): { goalId: string | null; keyResultId: string | null } {
  if (keyResultId) {
    const kr = requireKeyResult(db, keyResultId);
    if (goalId && goalId !== kr.goalId) {
      throw new PlanningError("invalid", "Key result boshqa maqsadga tegishli");
    }
    return { goalId: kr.goalId, keyResultId };
  }
  if (goalId) requireGoal(db, goalId);
  return { goalId: goalId ?? null, keyResultId: null };
}

/** PATCH uchun: faqat o'zgargan maydon(lar) asosida yangi bog'lanish. Hech biri berilmasa `null`. */
function mergeLink(
  db: Tx,
  current: { goalId: string | null; keyResultId: string | null },
  input: { goalId?: string | null; keyResultId?: string | null },
): { goalId: string | null; keyResultId: string | null } | null {
  if (input.goalId === undefined && input.keyResultId === undefined) return null;
  if (input.keyResultId !== undefined) {
    // KR o'zgardi: maqsad KR'dan olinadi; KR olib tashlansa — maqsad (berilgan yoki joriy) qoladi.
    return resolveLink(
      db,
      input.goalId !== undefined ? input.goalId : input.keyResultId ? null : current.goalId,
      input.keyResultId,
    );
  }
  // Faqat maqsad o'zgardi: joriy KR yangi maqsadga tegishli bo'lsagina saqlanadi.
  const kr = current.keyResultId ? requireKeyResult(db, current.keyResultId) : null;
  return resolveLink(db, input.goalId, kr && kr.goalId === input.goalId ? kr.id : null);
}

function planColumns(plan: TaskPlanInput | null | undefined) {
  if (plan === undefined) return {};
  if (plan === null) return { planLevel: null, planStart: null };
  return { planLevel: plan.level, planStart: periodOf(plan.level, plan.date).start };
}

/**
 * `LIKE` qidiruvi: `%`, `_` va `\` belgilari so'zma-so'z qidiriladi.
 * SQLite LIKE faqat ASCII harflarda katta-kichikni farqlamaydi — lotin o'zbek yozuvi uchun yetarli.
 */
function textSearch(q: string, ...columns: AnySQLiteColumn[]): SQL {
  const pattern = `%${q.replace(/[\\%_]/g, (c) => "\\" + c)}%`;
  return or(...columns.map((c) => sql`${c} LIKE ${pattern} ESCAPE '\\'`))!;
}

// ---------- Maqsadlar ----------

/** Davr bilan kesishadigan maqsadlar: `period_start <= end AND period_end >= start`. */
function goalFilter(q: Pick<ListGoalsQuery, "level" | "status" | "period" | "from" | "to">): SQL[] {
  const where: SQL[] = [];
  if (q.level) where.push(inArray(goals.level, q.level));
  if (q.status) where.push(inArray(goals.status, q.status));
  const range = periodRange(q);
  if (range) where.push(lte(goals.periodStart, range.end), gte(goals.periodEnd, range.start));
  return where;
}

export function listGoals(db: Db, query: ListGoalsQuery = {}): GoalDto[] {
  const where = goalFilter(query);
  if (query.parentId === "root") where.push(isNull(goals.parentId));
  else if (query.parentId) where.push(eq(goals.parentId, query.parentId));
  if (query.q) where.push(textSearch(query.q, goals.title, goals.description));
  return db
    .select()
    .from(goals)
    .where(and(...where))
    .orderBy(asc(goals.periodStart), asc(goals.sortOrder), asc(goals.createdAt))
    .all()
    .map(toGoalDto);
}

export function getGoal(db: Db, id: string): GoalDetailDto {
  const goal = requireGoal(db, id);
  const krs = db
    .select()
    .from(keyResults)
    .where(eq(keyResults.goalId, id))
    .orderBy(asc(keyResults.sortOrder), asc(keyResults.createdAt))
    .all();
  return { ...toGoalDto(goal), keyResults: krs.map(toKeyResultDto) };
}

export function createGoal(db: Db, input: CreateGoalInput): GoalDto {
  return db.transaction((tx) => {
    const period = periodOf(input.level, input.date);
    if (input.parentId) checkParent(tx, input.parentId, input.level, period.start, period.end);
    const status = input.status ?? "active";
    const goal = tx
      .insert(goals)
      .values({
        level: input.level,
        title: input.title,
        description: input.description ?? null,
        parentId: input.parentId ?? null,
        status,
        periodStart: period.start,
        periodEnd: period.end,
        sortOrder: input.sortOrder ?? 0,
        completedAt: status === "done" ? new Date() : null,
      })
      .returning()
      .get();
    recomputeGoalUpwards(tx, goal.id);
    return toGoalDto(requireGoal(tx, goal.id));
  });
}

export function updateGoal(db: Db, id: string, input: UpdateGoalInput): GoalDto {
  return db.transaction((tx) => {
    const goal = requireGoal(tx, id);
    const period = input.date ? periodOf(goal.level, input.date) : { start: goal.periodStart, end: goal.periodEnd };
    const parentId = input.parentId !== undefined ? input.parentId : goal.parentId;
    if (parentId) checkParent(tx, parentId, goal.level, period.start, period.end);
    if (period.start !== goal.periodStart) {
      const outside = tx
        .select({ start: goals.periodStart, end: goals.periodEnd })
        .from(goals)
        .where(eq(goals.parentId, id))
        .all()
        .some((c) => c.start < period.start || c.end > period.end);
      if (outside) throw new PlanningError("conflict", "Bola maqsadlar yangi davrdan tashqarida qoladi");
    }
    tx.update(goals)
      .set({
        title: input.title,
        description: input.description,
        parentId,
        status: input.status,
        periodStart: period.start,
        periodEnd: period.end,
        sortOrder: input.sortOrder,
        completedAt: input.status ? completedAtFor(input.status === "done", goal) : undefined,
      })
      .where(eq(goals.id, id))
      .run();
    recomputeGoalUpwards(tx, id);
    if (goal.parentId && goal.parentId !== parentId) recomputeGoalUpwards(tx, goal.parentId);
    return toGoalDto(requireGoal(tx, id));
  });
}

/** Q-024: KR'lar o'chadi, vazifalar va bola maqsadlar bog'lanmagan bo'lib qoladi. */
export function deleteGoal(db: Db, id: string): void {
  db.transaction((tx) => {
    const goal = requireGoal(tx, id);
    tx.delete(goals).where(eq(goals.id, id)).run();
    if (goal.parentId) recomputeGoalUpwards(tx, goal.parentId);
  });
}

// ---------- Key result'lar ----------

export function getKeyResult(db: Db, id: string): KeyResultDto {
  return toKeyResultDto(requireKeyResult(db, id));
}

export function createKeyResult(db: Db, input: CreateKeyResultInput): KeyResultDto {
  return db.transaction((tx) => {
    requireGoal(tx, input.goalId);
    const kr = tx
      .insert(keyResults)
      .values({
        goalId: input.goalId,
        title: input.title,
        startValue: input.startValue,
        targetValue: input.targetValue ?? null,
        currentValue: input.currentValue ?? input.startValue,
        unit: input.unit ?? null,
        sortOrder: input.sortOrder,
      })
      .returning()
      .get();
    recomputeFromKeyResult(tx, kr.id);
    return toKeyResultDto(requireKeyResult(tx, kr.id));
  });
}

export function updateKeyResult(db: Db, id: string, input: UpdateKeyResultInput): KeyResultDto {
  return db.transaction((tx) => {
    requireKeyResult(tx, id);
    tx.update(keyResults)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(keyResults.id, id))
      .run();
    recomputeFromKeyResult(tx, id);
    return toKeyResultDto(requireKeyResult(tx, id));
  });
}

/** Bog'langan vazifalar maqsadning to'g'ridan-to'g'ri vazifalariga aylanadi (goal_id saqlanadi). */
export function deleteKeyResult(db: Db, id: string): void {
  db.transaction((tx) => {
    const kr = requireKeyResult(tx, id);
    tx.delete(keyResults).where(eq(keyResults.id, id)).run();
    recomputeGoalUpwards(tx, kr.goalId);
  });
}

// ---------- Vazifalar ----------

function tagIdsOf(db: Tx, taskIds: string[]): Map<string, string[]> {
  const map = new Map<string, string[]>(taskIds.map((id) => [id, []]));
  if (taskIds.length === 0) return map;
  for (const row of db.select().from(taskTags).where(inArray(taskTags.taskId, taskIds)).all()) {
    map.get(row.taskId)?.push(row.tagId);
  }
  return map;
}

function setTaskTags(db: Tx, taskId: string, tagIds: string[] | undefined): void {
  if (tagIds === undefined) return;
  const unique = [...new Set(tagIds)];
  if (unique.length > 0) {
    const found = db.select({ id: tags.id }).from(tags).where(inArray(tags.id, unique)).all().length;
    if (found !== unique.length) throw notFound("Teg");
  }
  db.delete(taskTags).where(eq(taskTags.taskId, taskId)).run();
  if (unique.length > 0) {
    db.insert(taskTags)
      .values(unique.map((tagId) => ({ taskId, tagId })))
      .run();
  }
}

function taskDto(db: Tx, id: string): TaskDto {
  return toTaskDto(requireTask(db, id), tagIdsOf(db, [id]).get(id) ?? []);
}

/**
 * Vazifa rejasi davr bilan kesishadimi: kunlik — sana ichida; haftalik — dushanbasi `start - 6` dan keyin;
 * oylik — oyi `start` oyidan boshlab. Hammasida `plan_start <= end`. Rejalashtirilmaganlar kirmaydi.
 */
function planOverlaps(range: { start: string; end: string }): SQL {
  const weekFrom = range.start === "0000-01-01" ? range.start : addDays(range.start, -6);
  const monthFrom = range.start === "0000-01-01" ? range.start : periodOf("month", range.start).start;
  return and(
    lte(tasks.planStart, range.end),
    or(
      and(eq(tasks.planLevel, "day"), gte(tasks.planStart, range.start)),
      and(eq(tasks.planLevel, "week"), gte(tasks.planStart, weekFrom)),
      and(eq(tasks.planLevel, "month"), gte(tasks.planStart, monthFrom)),
    ),
  )!;
}

export function listTasks(db: Db, query: ListTasksQuery): TaskDto[] {
  const where: SQL[] = [];
  if (query.goalId) where.push(eq(tasks.goalId, query.goalId));
  if (query.keyResultId) where.push(eq(tasks.keyResultId, query.keyResultId));
  if (query.recurrenceId) where.push(eq(tasks.recurrenceId, query.recurrenceId));
  if (query.status) where.push(inArray(tasks.status, query.status));
  if (query.planLevel) where.push(inArray(tasks.planLevel, query.planLevel));
  if (query.unplanned) where.push(isNull(tasks.planLevel));
  if (query.q) where.push(textSearch(query.q, tasks.title, tasks.notes));
  if (query.tagId) {
    where.push(
      inArray(tasks.id, db.select({ id: taskTags.taskId }).from(taskTags).where(eq(taskTags.tagId, query.tagId))),
    );
  }
  const range = periodRange(query);
  if (range) where.push(planOverlaps(range));
  const rows = db
    .select()
    .from(tasks)
    .where(and(...where))
    .orderBy(asc(tasks.planStart), desc(tasks.priority), asc(tasks.sortOrder), asc(tasks.createdAt))
    .limit(query.limit)
    .all();
  const tagMap = tagIdsOf(
    db,
    rows.map((t) => t.id),
  );
  return rows.map((t) => toTaskDto(t, tagMap.get(t.id) ?? []));
}

export function getTask(db: Db, id: string): TaskDto {
  return taskDto(db, id);
}

export function createTask(db: Db, input: CreateTaskInput): TaskDto {
  return db.transaction((tx) => {
    const link = resolveLink(tx, input.goalId, input.keyResultId);
    const status = input.status ?? "todo";
    const task = tx
      .insert(tasks)
      .values({
        ...link,
        ...planColumns(input.plan),
        title: input.title,
        notes: input.notes ?? null,
        status,
        priority: input.priority,
        dueDate: input.dueDate ?? null,
        estimateMinutes: input.estimateMinutes ?? null,
        focus: input.focus,
        sortOrder: input.sortOrder,
        completedAt: status === "done" ? new Date() : null,
      })
      .returning()
      .get();
    setTaskTags(tx, task.id, input.tagIds);
    recomputeForTask(tx, link);
    return taskDto(tx, task.id);
  });
}

export function updateTask(db: Db, id: string, input: UpdateTaskInput): TaskDto {
  return db.transaction((tx) => {
    const task = requireTask(tx, id);
    const link = mergeLink(tx, task, input);
    tx.update(tasks)
      .set({
        ...(link ?? {}),
        ...planColumns(input.plan),
        title: input.title,
        notes: input.notes,
        status: input.status,
        priority: input.priority,
        dueDate: input.dueDate,
        estimateMinutes: input.estimateMinutes,
        focus: input.focus,
        sortOrder: input.sortOrder,
        completedAt: input.status ? completedAtFor(input.status === "done", task) : undefined,
        // Faqat teglar o'zgarsa ham `set` bo'sh qolmasin.
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .run();
    setTaskTags(tx, id, input.tagIds);
    recomputeForTask(tx, task, ...(link ? [link] : []));
    return taskDto(tx, id);
  });
}

export function deleteTask(db: Db, id: string): void {
  db.transaction((tx) => {
    const task = requireTask(tx, id);
    tx.delete(tasks).where(eq(tasks.id, id)).run();
    recomputeForTask(tx, task);
  });
}

// ---------- Takrorlanuvchi seriyalar ----------
//
// Seriya yaratilganda yoki o'zgarganda vazifalar darhol (gorizont ichida) yaratiladi. O'zgarishda bugundan boshlab
// hali boshlanmagan takrorlanishlar yangi qoida/maydonlar bilan qayta yaratiladi (resetFutureOccurrences).
// `materializeRecurrences` o'z tranzaksiyasini ochadi, shuning uchun yozish tranzaksiyasidan keyin chaqiriladi.

export function listRecurrences(db: Db): RecurrenceDto[] {
  return db
    .select()
    .from(taskRecurrences)
    .orderBy(desc(taskRecurrences.active), asc(taskRecurrences.createdAt))
    .all()
    .map(toRecurrenceDto);
}

export function getRecurrence(db: Db, id: string): RecurrenceDto {
  return toRecurrenceDto(requireRecurrence(db, id));
}

export function createRecurrence(db: Db, input: CreateRecurrenceInput): RecurrenceDto {
  const id = db.transaction((tx) => {
    const link = resolveLink(tx, input.goalId, input.keyResultId);
    return tx
      .insert(taskRecurrences)
      .values({
        ...link,
        title: input.title,
        notes: input.notes ?? null,
        priority: input.priority,
        estimateMinutes: input.estimateMinutes ?? null,
        rule: input.rule,
        startDate: input.startDate,
        endDate: input.endDate ?? null,
        active: input.active,
      })
      .returning({ id: taskRecurrences.id })
      .get().id;
  });
  materializeRecurrences(db);
  return getRecurrence(db, id);
}

export function updateRecurrence(db: Db, id: string, input: UpdateRecurrenceInput): RecurrenceDto {
  db.transaction((tx) => {
    const r = requireRecurrence(tx, id);
    const link = mergeLink(tx, r, input);
    const startDate = input.startDate ?? r.startDate;
    const endDate = input.endDate !== undefined ? input.endDate : r.endDate;
    if (endDate !== null && endDate < startDate) {
      throw new PlanningError("invalid", "Tugash sanasi boshlanishdan oldin");
    }
    tx.update(taskRecurrences)
      .set({
        ...(link ?? {}),
        title: input.title,
        notes: input.notes,
        priority: input.priority,
        estimateMinutes: input.estimateMinutes,
        rule: input.rule,
        startDate,
        endDate,
        active: input.active,
      })
      .where(eq(taskRecurrences.id, id))
      .run();
    resetFutureOccurrences(tx, id, toLocalIsoDate());
  });
  materializeRecurrences(db);
  return getRecurrence(db, id);
}

/** Kelajakdagi boshlanmagan takrorlanishlar o'chadi; o'tganlari va boshlanganlari oddiy vazifa bo'lib qoladi. */
export function deleteRecurrence(db: Db, id: string): void {
  db.transaction((tx) => {
    requireRecurrence(tx, id);
    resetFutureOccurrences(tx, id, toLocalIsoDate());
    tx.delete(taskRecurrences).where(eq(taskRecurrences.id, id)).run();
  });
}

// ---------- Teglar ----------

function isUniqueViolation(err: unknown): boolean {
  const code =
    (err as { code?: string; cause?: { code?: string } }).code ?? (err as { cause?: { code?: string } }).cause?.code;
  return code === "SQLITE_CONSTRAINT_UNIQUE";
}

function uniqueTagName<T>(fn: () => T): T {
  try {
    return fn();
  } catch (err) {
    if (isUniqueViolation(err)) throw new PlanningError("conflict", "Bunday nomli teg allaqachon bor");
    throw err;
  }
}

export function listTags(db: Db): TagDto[] {
  return db.select().from(tags).orderBy(asc(tags.name)).all().map(toTagDto);
}

export function createTag(db: Db, input: CreateTagInput): TagDto {
  return uniqueTagName(() =>
    toTagDto(
      db
        .insert(tags)
        .values({ name: input.name, color: input.color ?? null })
        .returning()
        .get(),
    ),
  );
}

export function updateTag(db: Db, id: string, input: UpdateTagInput): TagDto {
  return uniqueTagName(() => {
    if (input.name === undefined && input.color === undefined) {
      const tag = db.select().from(tags).where(eq(tags.id, id)).get();
      if (!tag) throw notFound("Teg");
      return toTagDto(tag);
    }
    const tag = db.update(tags).set(input).where(eq(tags.id, id)).returning().get();
    if (!tag) throw notFound("Teg");
    return toTagDto(tag);
  });
}

export function deleteTag(db: Db, id: string): void {
  const removed = db.delete(tags).where(eq(tags.id, id)).returning({ id: tags.id }).get();
  if (!removed) throw notFound("Teg");
}

// ---------- Maqsadlar daraxti (S1-06) ----------

/**
 * Maqsadlar daraxti: tugunlarda KR'lar, vazifa hisoblari va (so'ralsa) vazifalar.
 * Filtr (status, davr) barcha tugunlarga qo'llanadi; `rootId` berilsa ildiz har doim kiradi.
 * Ota maqsadi filtrdan o'tmagan maqsadlar ildiz bo'lib chiqadi. Bitta foydalanuvchi hajmi uchun
 * maqsadlar bitta so'rov bilan olinib, daraxt xotirada quriladi.
 */
export function getGoalTree(db: Db, query: GoalTreeQuery = {}): GoalTreeNode[] {
  const rows = db
    .select()
    .from(goals)
    .where(and(...goalFilter(query)))
    .orderBy(asc(goals.periodStart), asc(goals.sortOrder), asc(goals.createdAt))
    .all();
  const root = query.rootId ? requireGoal(db, query.rootId) : null;
  if (root && !rows.some((g) => g.id === root.id)) rows.unshift(root);

  const byId = new Map(rows.map((g) => [g.id, g]));
  const ids = [...byId.keys()];
  const childrenOf = new Map<string, Goal[]>();
  for (const g of rows) {
    if (g.parentId && byId.has(g.parentId)) {
      childrenOf.set(g.parentId, [...(childrenOf.get(g.parentId) ?? []), g]);
    }
  }

  const krsOf = new Map<string, KeyResultDto[]>();
  const counts = new Map<string, { total: number; done: number }>();
  const tasksOf = new Map<string, TaskDto[]>();
  if (ids.length > 0) {
    const krs = db
      .select()
      .from(keyResults)
      .where(inArray(keyResults.goalId, ids))
      .orderBy(asc(keyResults.sortOrder), asc(keyResults.createdAt))
      .all();
    for (const kr of krs) krsOf.set(kr.goalId, [...(krsOf.get(kr.goalId) ?? []), toKeyResultDto(kr)]);

    const countRows = db
      .select({
        goalId: tasks.goalId,
        total: sql<number>`count(*)`,
        done: sql<number>`sum(${tasks.status} = 'done')`,
      })
      .from(tasks)
      .where(and(inArray(tasks.goalId, ids), ne(tasks.status, "cancelled")))
      .groupBy(tasks.goalId)
      .all();
    for (const c of countRows) if (c.goalId) counts.set(c.goalId, { total: c.total, done: c.done ?? 0 });

    if (query.includeTasks) {
      const taskRows = db
        .select()
        .from(tasks)
        .where(inArray(tasks.goalId, ids))
        .orderBy(asc(tasks.planStart), desc(tasks.priority), asc(tasks.sortOrder), asc(tasks.createdAt))
        .all();
      const tagMap = tagIdsOf(
        db,
        taskRows.map((t) => t.id),
      );
      for (const t of taskRows) {
        if (t.goalId) tasksOf.set(t.goalId, [...(tasksOf.get(t.goalId) ?? []), toTaskDto(t, tagMap.get(t.id) ?? [])]);
      }
    }
  }

  const seen = new Set<string>();
  const build = (g: Goal): GoalTreeNode => {
    seen.add(g.id);
    return {
      ...toGoalDto(g),
      keyResults: krsOf.get(g.id) ?? [],
      taskCounts: counts.get(g.id) ?? { total: 0, done: 0 },
      ...(query.includeTasks ? { tasks: tasksOf.get(g.id) ?? [] } : {}),
      // `seen` — buzilgan ma'lumotdagi sikldan himoya (Q-031 dagi recompute bilan bir xil yondashuv).
      children: (childrenOf.get(g.id) ?? []).filter((c) => !seen.has(c.id)).map(build),
    };
  };
  const roots = root ? [root] : rows.filter((g) => !g.parentId || !byId.has(g.parentId));
  return roots.map(build);
}
