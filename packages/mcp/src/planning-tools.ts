import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z, ZodError } from "zod";
import {
  PlanningError,
  createTag,
  createTask,
  getGoal,
  getGoalTree,
  getKeyResult,
  listGoals,
  listTags,
  listTasks,
  updateKeyResult,
  updateTask,
  type Db,
} from "@loiha/db";
import {
  GOAL_LEVELS,
  GOAL_STATUSES,
  PLAN_LEVELS,
  TASK_STATUSES,
  addDays,
  createTaskSchema,
  goalTreeQuerySchema,
  listGoalsQuerySchema,
  listTasksQuerySchema,
  parsePeriodKey,
  periodKey,
  periodOf,
  toLocalIsoDate,
  updateTaskSchema,
  type GoalDto,
  type GoalTreeNode,
  type KeyResultDto,
  type TagDto,
  type TaskDto,
  type UpdateTaskInput,
} from "@loiha/shared";

// S1-12: maqsad va vazifa tool'lari. Mantiq va progress keshini yangilash @loiha/db servislarida (Q-037, Q-031);
// bu yerda faqat kirishni tekshirish va Claude uchun ixcham JSON natija.

/** Nisbiy davr nomlari: Claude bugungi sanani bilmasligi mumkin. */
const PERIOD_ALIASES: Record<string, (today: string) => string> = {
  today: (d) => d,
  bugun: (d) => d,
  tomorrow: (d) => addDays(d, 1),
  ertaga: (d) => addDays(d, 1),
  this_week: (d) => periodKey(periodOf("week", d)),
  shu_hafta: (d) => periodKey(periodOf("week", d)),
  next_week: (d) => periodKey(periodOf("week", addDays(d, 7))),
  keyingi_hafta: (d) => periodKey(periodOf("week", addDays(d, 7))),
  last_week: (d) => periodKey(periodOf("week", addDays(d, -7))),
  this_month: (d) => periodKey(periodOf("month", d)),
  shu_oy: (d) => periodKey(periodOf("month", d)),
  this_quarter: (d) => periodKey(periodOf("quarter", d)),
  shu_kvartal: (d) => periodKey(periodOf("quarter", d)),
  this_year: (d) => periodKey(periodOf("year", d)),
  shu_yil: (d) => periodKey(periodOf("year", d)),
};
const ALIAS_HELP = "today, tomorrow, this_week, next_week, last_week, this_month, this_quarter, this_year";

/** Davr kaliti yoki nisbiy nom → periodKey (masalan "this_week" → "2026-W43"). */
function resolvePeriod(value: string, today: string): string {
  const alias = PERIOD_ALIASES[value.trim().toLowerCase()];
  const key = alias ? alias(today) : value.trim();
  if (!parsePeriodKey(key)) {
    throw new PlanningError(
      "invalid",
      `Noto'g'ri davr: "${value}". Kalit (2026, 2026-Q4, 2026-10, 2026-W43, 2026-10-19) yoki: ${ALIAS_HELP}`,
    );
  }
  return key;
}

/** Sana yoki "today"/"tomorrow" → YYYY-MM-DD. */
function resolveDate(value: string, today: string): string {
  const v = value.trim().toLowerCase();
  if (v === "today" || v === "bugun") return today;
  if (v === "tomorrow" || v === "ertaga") return addDays(today, 1);
  return value.trim();
}

const pct = (p: number) => Math.round(p * 100);

function krOut(kr: KeyResultDto) {
  return {
    id: kr.id,
    title: kr.title,
    ...(kr.targetValue !== null ? { current: kr.currentValue, target: kr.targetValue, unit: kr.unit } : {}),
    progressPercent: pct(kr.progress),
  };
}

function goalOut(g: GoalDto) {
  return {
    id: g.id,
    level: g.level,
    title: g.title,
    status: g.status,
    period: g.periodKey,
    progressPercent: pct(g.progress),
    parentId: g.parentId,
  };
}

function taskOut(t: TaskDto, tags: TagDto[]) {
  return {
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    plan: t.planLevel ? { level: t.planLevel, start: t.planStart } : null,
    goalId: t.goalId,
    keyResultId: t.keyResultId,
    ...(t.focus ? { focus: true } : {}),
    ...(t.tagIds.length ? { tags: t.tagIds.map((id) => tags.find((x) => x.id === id)?.name ?? id) } : {}),
    ...(t.dueDate ? { dueDate: t.dueDate } : {}),
    ...(t.estimateMinutes ? { estimateMinutes: t.estimateMinutes } : {}),
    ...(t.notes ? { notes: t.notes } : {}),
    ...(t.recurrenceId ? { recurring: true } : {}),
  };
}

function treeOut(n: GoalTreeNode, tags: TagDto[]): unknown {
  return {
    ...goalOut(n),
    keyResults: n.keyResults.map(krOut),
    tasks: n.tasks ? n.tasks.map((t) => taskOut(t, tags)) : { total: n.taskCounts.total, done: n.taskCounts.done },
    children: n.children.map((c) => treeOut(c, tags)),
  };
}

/** Teg nomlari → id'lar (katta-kichikka qaramay); yo'qlari yaratiladi (Q-065 bilan bir xil). */
function tagIdsFor(db: Db, names: string[]): string[] {
  const known = listTags(db);
  const ids = new Set<string>();
  for (const name of names) {
    const clean = name.trim().replace(/^#/, "");
    if (!clean) continue;
    let tag = known.find((t) => t.name.toLowerCase() === clean.toLowerCase());
    if (!tag) {
      // Yangi teg ro'yxatga qo'shiladi — "ish" va "#Ish" kabi takror ikkinchi marta yaratilmaydi.
      tag = createTag(db, { name: clean });
      known.push(tag);
    }
    ids.add(tag.id);
  }
  return [...ids];
}

function json(data: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data) }] };
}

/** Xatolar Claude'ga tushunarli matn bilan `isError` natija sifatida qaytadi (tool chaqiruvi yiqilmaydi). */
function safe<A>(fn: (args: A) => unknown) {
  return async (args: A): Promise<CallToolResult> => {
    try {
      return json(fn(args));
    } catch (err) {
      const message =
        err instanceof PlanningError
          ? err.message
          : err instanceof ZodError
            ? err.issues.map((i) => `${i.path.join(".") || "kirish"}: ${i.message}`).join("; ")
            : err instanceof Error
              ? err.message
              : String(err);
      return { content: [{ type: "text", text: `Xato: ${message}` }], isError: true };
    }
  };
}

const periodArg = z
  .string()
  .optional()
  .describe(`Davr: kalit (2026, 2026-Q4, 2026-10, 2026-W43, 2026-10-19) yoki nisbiy nom: ${ALIAS_HELP}`);

const taskFields = {
  notes: z.string().max(20_000).optional().describe("Izoh"),
  goalId: z.string().optional().describe("Bog'lanadigan maqsad id (list_goals / get_goal_tree dan)"),
  keyResultId: z.string().optional().describe("Bog'lanadigan key result id; berilsa maqsad undan olinadi"),
  priority: z.number().int().min(0).max(3).optional().describe("0 — yo'q, 1 — past, 2 — o'rta, 3 — yuqori"),
  estimateMinutes: z.number().int().min(1).max(1440).optional().describe("Taxminiy vaqt, daqiqa"),
  dueDate: z.string().optional().describe("Muddat, YYYY-MM-DD"),
  focus: z.boolean().optional().describe("Kunning fokus vazifasi"),
  tags: z.array(z.string()).max(20).optional().describe("Teg nomlari; yo'qlari yaratiladi"),
};

export function registerPlanningTools(server: McpServer, db: Db, today: () => string = toLocalIsoDate): void {
  server.registerTool(
    "list_goals",
    {
      title: "Maqsadlar ro'yxati",
      description:
        "Maqsadlarni (yil/kvartal/oy/hafta) tekis ro'yxat sifatida qaytaradi: id, daraja, nom, holat, davr, progress %. " +
        "Davr berilsa — shu davr bilan kesishadiganlar.",
      inputSchema: {
        level: z.enum(GOAL_LEVELS).optional().describe("Faqat shu daraja"),
        period: periodArg,
        status: z.enum(GOAL_STATUSES).optional(),
        query: z.string().optional().describe("Nom/izoh bo'yicha qidiruv"),
      },
      annotations: { readOnlyHint: true },
    },
    safe(({ level, period, status, query }) => {
      const d = today();
      const goals = listGoals(
        db,
        listGoalsQuerySchema.parse({
          ...(level ? { level } : {}),
          ...(status ? { status } : {}),
          ...(query ? { q: query } : {}),
          ...(period ? { period: resolvePeriod(period, d) } : {}),
        }),
      );
      return { today: d, goals: goals.map(goalOut) };
    }),
  );

  server.registerTool(
    "get_goal_tree",
    {
      title: "Maqsadlar daraxti",
      description:
        "Maqsadlar ierarxiyasi (yil → kvartal → oy → hafta) KR'lar va vazifalar soni bilan. " +
        "includeTasks=true — har maqsadga bog'langan vazifalar ham. rootId — faqat shu maqsad va uning bolalari.",
      inputSchema: {
        period: periodArg,
        rootId: z.string().optional(),
        includeTasks: z.boolean().optional(),
      },
      annotations: { readOnlyHint: true },
    },
    safe(({ period, rootId, includeTasks }) => {
      const d = today();
      const tree = getGoalTree(
        db,
        goalTreeQuerySchema.parse({
          ...(rootId ? { rootId } : {}),
          ...(includeTasks ? { includeTasks: "true" } : {}),
          ...(period ? { period: resolvePeriod(period, d) } : {}),
        }),
      );
      const tags = includeTasks ? listTags(db) : [];
      return { today: d, tree: tree.map((n) => treeOut(n, tags)) };
    }),
  );

  server.registerTool(
    "list_tasks",
    {
      title: "Vazifalar ro'yxati",
      description:
        "Vazifalarni qaytaradi. period — reja davri shu davr bilan kesishadiganlar (masalan this_week: shu haftaning " +
        "kunlik vazifalari, haftalik va shu oy uchun rejalashtirilganlar). unplanned=true — rejasiz (inbox) vazifalar.",
      inputSchema: {
        period: periodArg,
        status: z.array(z.enum(TASK_STATUSES)).optional().describe('Masalan ["todo", "in_progress"]'),
        query: z.string().optional().describe("Nom/izoh bo'yicha qidiruv"),
        tag: z.string().optional().describe("Teg nomi"),
        goalId: z.string().optional(),
        unplanned: z.boolean().optional(),
        limit: z.number().int().min(1).max(500).optional().describe("Standart 100"),
      },
      annotations: { readOnlyHint: true },
    },
    safe(({ period, status, query, tag, goalId, unplanned, limit }) => {
      const d = today();
      const tags = listTags(db);
      let tagId: string | undefined;
      if (tag) {
        tagId = tags.find((t) => t.name.toLowerCase() === tag.trim().replace(/^#/, "").toLowerCase())?.id;
        if (!tagId) return { today: d, tasks: [], note: `"${tag}" tegi topilmadi` };
      }
      const tasks = listTasks(
        db,
        listTasksQuerySchema.parse({
          ...(period ? { period: resolvePeriod(period, d) } : {}),
          ...(status?.length ? { status: status.join(",") } : {}),
          ...(query ? { q: query } : {}),
          ...(tagId ? { tagId } : {}),
          ...(goalId ? { goalId } : {}),
          ...(unplanned ? { unplanned: "true" } : {}),
          limit: String(limit ?? 100),
        }),
      );
      return { today: d, count: tasks.length, tasks: tasks.map((t) => taskOut(t, tags)) };
    }),
  );

  server.registerTool(
    "create_task",
    {
      title: "Vazifa yaratish",
      description:
        "Yangi vazifa yaratadi. planLevel (day/week/month) va date (YYYY-MM-DD, today yoki tomorrow) — qachonga " +
        "rejalashtirilgani; date berilmasa bugun. planLevel berilmasa — rejasiz (inbox). Maqsad progressi avtomatik yangilanadi.",
      inputSchema: {
        title: z.string().min(1).max(500),
        planLevel: z.enum(PLAN_LEVELS).optional(),
        date: z.string().optional(),
        status: z.enum(TASK_STATUSES).optional(),
        ...taskFields,
      },
    },
    safe(({ title, planLevel, date, tags, ...rest }) => {
      const d = today();
      // REST bilan bir xil tekshiruv (sana, id formati, chegaralar).
      const input = createTaskSchema.parse({
        ...rest,
        title,
        plan: planLevel ? { level: planLevel, date: resolveDate(date ?? "today", d) } : null,
      });
      const task = createTask(db, { ...input, ...(tags ? { tagIds: tagIdsFor(db, tags) } : {}) });
      return { created: taskOut(task, listTags(db)) };
    }),
  );

  server.registerTool(
    "update_task",
    {
      title: "Vazifani yangilash",
      description:
        "Vazifa maydonlarini o'zgartiradi (faqat berilganlari). status: todo/in_progress/done/cancelled. " +
        "Ko'chirish: planLevel + date; planLevel=\"none\" — rejadan chiqarish. tags — to'liq ro'yxat (almashtiriladi). " +
        "goalId/keyResultId uchun null — bog'lanishni olib tashlash. Maqsad progressi avtomatik yangilanadi.",
      inputSchema: {
        id: z.string(),
        title: z.string().min(1).max(500).optional(),
        status: z.enum(TASK_STATUSES).optional(),
        planLevel: z.enum([...PLAN_LEVELS, "none"]).optional(),
        date: z.string().optional(),
        ...taskFields,
        goalId: taskFields.goalId.nullable(),
        keyResultId: taskFields.keyResultId.nullable(),
      },
    },
    safe(({ id, planLevel, date, tags, ...rest }) => {
      const d = today();
      const input: UpdateTaskInput = { ...rest };
      if (planLevel === "none") input.plan = null;
      else if (planLevel) input.plan = { level: planLevel, date: resolveDate(date ?? "today", d) };
      else if (date) throw new PlanningError("invalid", "date bilan birga planLevel ham bering");
      const parsed = updateTaskSchema.parse(input);
      if (tags) parsed.tagIds = tagIdsFor(db, tags);
      return { updated: taskOut(updateTask(db, id, parsed), listTags(db)) };
    }),
  );

  server.registerTool(
    "update_progress",
    {
      title: "Key result qiymatini yangilash",
      description:
        "Raqamli key result'ning joriy qiymatini o'rnatadi (value) yoki oshiradi/kamaytiradi (delta). " +
        "Maqsad va ota maqsadlar progressi avtomatik qayta hisoblanadi. KR id'si get_goal_tree dan.",
      inputSchema: {
        keyResultId: z.string(),
        value: z.number().finite().optional().describe("Yangi joriy qiymat"),
        delta: z.number().finite().optional().describe("Joriy qiymatga qo'shiladigan son (manfiy ham)"),
      },
    },
    safe(({ keyResultId, value, delta }) => {
      if ((value === undefined) === (delta === undefined)) {
        throw new PlanningError("invalid", "value yoki delta dan aynan bittasini bering");
      }
      const next = value ?? getKeyResult(db, keyResultId).currentValue + delta!;
      const kr = updateKeyResult(db, keyResultId, { currentValue: next });
      return { keyResult: krOut(kr), goal: goalOut(getGoal(db, kr.goalId)) };
    }),
  );
}
