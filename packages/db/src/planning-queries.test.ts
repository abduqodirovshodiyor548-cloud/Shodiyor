import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { goalTreeQuerySchema, listGoalsQuerySchema, listTasksQuerySchema, type GoalTreeNode } from "@loiha/shared";
import { createDb, runMigrations, type Db } from "./index.ts";
import { createGoal, createKeyResult, createTask, getGoalTree, listGoals, listTasks, updateGoal } from "./planning.ts";

// S1-06: davr filtri va maqsadlar daraxti. So'rovlar HTTP'dagidek sxemadan o'tkaziladi.

let db: Db;
const tasksIn = (query: Record<string, string>) =>
  listTasks(db, listTasksQuerySchema.parse(query))
    .map((t) => t.title)
    .sort();
const goalsIn = (query: Record<string, string>) =>
  listGoals(db, listGoalsQuerySchema.parse(query))
    .map((g) => g.title)
    .sort();
const tree = (query: Record<string, string> = {}) => getGoalTree(db, goalTreeQuerySchema.parse(query));
const shape = (nodes: GoalTreeNode[]): unknown => nodes.map((n) => [n.title, shape(n.children)]);

let ids: Record<"year" | "q3" | "q4" | "oct" | "w43", string>;

beforeEach(() => {
  db = createDb(":memory:");
  runMigrations(db);
  const year = createGoal(db, { level: "year", title: "2026", date: "2026-01-01" });
  const q3 = createGoal(db, { level: "quarter", title: "Q3", date: "2026-07-01", parentId: year.id });
  const q4 = createGoal(db, { level: "quarter", title: "Q4", date: "2026-10-01", parentId: year.id });
  const oct = createGoal(db, { level: "month", title: "Okt", date: "2026-10-01", parentId: q4.id });
  const w43 = createGoal(db, { level: "week", title: "W43", date: "2026-10-19", parentId: oct.id });
  createGoal(db, { level: "year", title: "2027", date: "2027-01-01" });
  ids = { year: year.id, q3: q3.id, q4: q4.id, oct: oct.id, w43: w43.id };

  const plan = (title: string, level: "day" | "week" | "month", date: string) =>
    createTask(db, { title, plan: { level, date } });
  plan("kun 18", "day", "2026-10-18");
  plan("kun 19", "day", "2026-10-19");
  plan("kun 25", "day", "2026-10-25");
  plan("kun 31", "day", "2026-10-31");
  plan("hafta 42", "week", "2026-10-12");
  plan("hafta 43", "week", "2026-10-21");
  plan("hafta 44", "week", "2026-10-26"); // 26-oktabr — 1-noyabr
  plan("oy 10", "month", "2026-10-15");
  plan("oy 11", "month", "2026-11-01");
  createTask(db, { title: "inbox" });
});

describe("vazifalar: davr filtri", () => {
  it("hafta: kunlik, haftalik va oylik rejalar kesishuv bo'yicha", () => {
    assert.deepEqual(tasksIn({ period: "2026-W43" }), ["hafta 43", "kun 19", "kun 25", "oy 10"]);
  });

  it("oy: oy chegarasidan o'tgan hafta ham kiradi", () => {
    assert.deepEqual(tasksIn({ period: "2026-11" }), ["hafta 44", "oy 11"]);
  });

  it("kun va from/to oralig'i; planLevel bilan toraytirish", () => {
    assert.deepEqual(tasksIn({ period: "2026-10-19" }), ["hafta 43", "kun 19", "oy 10"]);
    assert.deepEqual(tasksIn({ from: "2026-10-25", to: "2026-10-31", planLevel: "day" }), ["kun 25", "kun 31"]);
    assert.deepEqual(tasksIn({ from: "2026-11-01" }), ["hafta 44", "oy 11"]);
    assert.deepEqual(tasksIn({ to: "2026-10-12", planLevel: "day,week" }), ["hafta 42"]);
  });

  it("inbox va bir nechta status", () => {
    assert.deepEqual(tasksIn({ unplanned: "true" }), ["inbox"]);
    assert.equal(tasksIn({ status: "todo,in_progress" }).length, 10);
    assert.equal(tasksIn({ status: "done" }).length, 0);
  });
});

describe("maqsadlar: davr filtri", () => {
  it("davr bilan kesishadigan barcha darajalar", () => {
    assert.deepEqual(goalsIn({ period: "2026-W43" }), ["2026", "Okt", "Q4", "W43"]);
    assert.deepEqual(goalsIn({ period: "2026-W43", level: "quarter,month" }), ["Okt", "Q4"]);
    assert.deepEqual(goalsIn({ from: "2026-12-31", to: "2027-01-01", level: "year" }), ["2026", "2027"]);
    assert.deepEqual(goalsIn({ parentId: "root" }), ["2026", "2027"]);
  });
});

describe("maqsadlar daraxti", () => {
  it("davr bo'yicha: faqat kesishadigan tugunlar", () => {
    assert.deepEqual(shape(tree({ period: "2026-W43" })), [["2026", [["Q4", [["Okt", [["W43", []]]]]]]]]);
    assert.deepEqual(shape(tree()), [
      [
        "2026",
        [
          ["Q3", []],
          ["Q4", [["Okt", [["W43", []]]]]],
        ],
      ],
      ["2027", []],
    ]);
  });

  it("rootId: ildiz filtrdan o'tmasa ham kiradi", () => {
    assert.deepEqual(shape(tree({ rootId: ids.q4 })), [["Q4", [["Okt", [["W43", []]]]]]]);
    assert.deepEqual(shape(tree({ rootId: ids.q3, period: "2026-W43" })), [["Q3", []]]);
  });

  it("otasi filtrdan o'tmagan maqsad ildiz bo'ladi", () => {
    updateGoal(db, ids.q4, { status: "done" });
    assert.deepEqual(shape(tree({ status: "active", period: "2026-10" })), [
      ["2026", []],
      ["Okt", [["W43", []]]],
    ]);
  });

  it("KR'lar, vazifa hisoblari va includeTasks", () => {
    const kr = createKeyResult(db, { goalId: ids.oct, title: "kr" });
    createTask(db, { title: "a", keyResultId: kr.id, status: "done" });
    createTask(db, { title: "b", goalId: ids.oct });
    createTask(db, { title: "c", goalId: ids.oct, status: "cancelled" });
    const find = (nodes: GoalTreeNode[], id: string): GoalTreeNode | undefined =>
      nodes.map((n) => (n.id === id ? n : find(n.children, id))).find(Boolean);

    const oct = find(tree(), ids.oct)!;
    assert.deepEqual(oct.taskCounts, { total: 2, done: 1 });
    assert.deepEqual(
      oct.keyResults.map((k) => k.title),
      ["kr"],
    );
    assert.equal(oct.tasks, undefined);
    assert.deepEqual(find(tree(), ids.w43)!.taskCounts, { total: 0, done: 0 });

    const withTasks = find(tree({ includeTasks: "1" }), ids.oct)!;
    assert.deepEqual(withTasks.tasks?.map((t) => t.title).sort(), ["a", "b", "c"]);
  });
});

describe("so'rov sxemalari", () => {
  it("noto'g'ri kombinatsiyalarni rad etadi", () => {
    for (const q of [
      { period: "2026-W54" },
      { period: "2026-W43", from: "2026-10-01" },
      { from: "2026-10-02", to: "2026-10-01" },
      { status: "todo,yo'q" },
      { unplanned: "true", period: "2026-10" },
      { unplanned: "ha" },
    ]) {
      assert.equal(listTasksQuerySchema.safeParse(q).success, false, JSON.stringify(q));
    }
    assert.equal(goalTreeQuerySchema.safeParse({ rootId: "x" }).success, false);
  });
});
