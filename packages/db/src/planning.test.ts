import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { addDays, toLocalIsoDate } from "@loiha/shared";
import { createDb, runMigrations, type Db } from "./index.ts";
import {
  PlanningError,
  createGoal,
  createKeyResult,
  createRecurrence,
  createTag,
  createTask,
  deleteGoal,
  deleteKeyResult,
  deleteRecurrence,
  deleteTag,
  getGoal,
  getTask,
  listTasks,
  updateGoal,
  updateKeyResult,
  updateRecurrence,
  updateTask,
} from "./planning.ts";

let db: Db;

const rejects = (fn: () => unknown, code: PlanningError["code"]) =>
  assert.throws(fn, (err: unknown) => err instanceof PlanningError && err.code === code);
const progress = (id: string) => getGoal(db, id).progress;

beforeEach(() => {
  db = createDb(":memory:");
  runMigrations(db);
});

describe("maqsadlar", () => {
  it("davr darajaga qarab normallashadi va periodKey qaytadi", () => {
    const q = createGoal(db, { level: "quarter", title: "Q4", date: "2026-11-20" });
    assert.equal(q.periodStart, "2026-10-01");
    assert.equal(q.periodEnd, "2026-12-31");
    assert.equal(q.periodKey, "2026-Q4");
    const w = createGoal(db, { level: "week", title: "W", date: "2026-10-21" });
    assert.deepEqual([w.periodStart, w.periodEnd, w.periodKey], ["2026-10-19", "2026-10-25", "2026-W43"]);
  });

  it("ota maqsad darajasi va davri tekshiriladi", () => {
    const year = createGoal(db, { level: "year", title: "2026", date: "2026-01-01" });
    const q4 = createGoal(db, { level: "quarter", title: "Q4", date: "2026-10-01", parentId: year.id });
    rejects(() => createGoal(db, { level: "year", title: "x", date: "2026-01-01", parentId: q4.id }), "invalid");
    rejects(() => createGoal(db, { level: "month", title: "x", date: "2027-01-01", parentId: year.id }), "invalid");
    rejects(() => createGoal(db, { level: "month", title: "x", date: "2026-01-01", parentId: q4.id }), "invalid");
    rejects(
      () => createGoal(db, { level: "month", title: "x", date: "2026-01-01", parentId: crypto.randomUUID() }),
      "not_found",
    );
    // Bola davridan tashqariga ko'chirish — ziddiyat.
    createGoal(db, { level: "month", title: "Okt", date: "2026-10-01", parentId: q4.id });
    rejects(() => updateGoal(db, q4.id, { date: "2026-07-01" }), "conflict");
  });

  it("status done → completedAt, qayta ochilganda tozalanadi; dropped bola ota progressiga kirmaydi", () => {
    const year = createGoal(db, { level: "year", title: "2026", date: "2026-01-01" });
    const a = createGoal(db, { level: "quarter", title: "A", date: "2026-01-01", parentId: year.id });
    const b = createGoal(db, { level: "quarter", title: "B", date: "2026-04-01", parentId: year.id });
    const done = updateGoal(db, a.id, { status: "done" });
    assert.ok(done.completedAt);
    assert.equal(progress(year.id), 0.5);
    updateGoal(db, b.id, { status: "dropped" });
    assert.equal(progress(year.id), 1);
    assert.equal(updateGoal(db, a.id, { status: "active" }).completedAt, null);
    assert.equal(progress(year.id), 0);
  });

  it("maqsad o'chirilsa ota progressi yangilanadi, vazifalar bog'lanmagan bo'lib qoladi", () => {
    const year = createGoal(db, { level: "year", title: "2026", date: "2026-01-01" });
    const a = createGoal(db, { level: "quarter", title: "A", date: "2026-01-01", parentId: year.id });
    const b = createGoal(db, { level: "quarter", title: "B", date: "2026-04-01", parentId: year.id });
    updateGoal(db, a.id, { status: "done" });
    const t = createTask(db, { title: "t", goalId: b.id });
    deleteGoal(db, b.id);
    assert.equal(progress(year.id), 1);
    assert.equal(getTask(db, t.id).goalId, null);
  });
});

describe("key result'lar", () => {
  it("raqamli KR qiymati o'zgarganda maqsad progressi yangilanadi", () => {
    const g = createGoal(db, { level: "month", title: "g", date: "2026-10-01" });
    const kr = createKeyResult(db, { goalId: g.id, title: "Kitob", startValue: 0, targetValue: 10 });
    assert.equal(kr.currentValue, 0);
    assert.equal(updateKeyResult(db, kr.id, { currentValue: 4 }).progress, 0.4);
    assert.equal(progress(g.id), 0.4);
    rejects(() => createKeyResult(db, { goalId: crypto.randomUUID(), title: "x" }), "not_found");
  });

  it("KR o'chirilsa vazifalari maqsadning to'g'ridan-to'g'ri vazifalariga aylanadi", () => {
    const g = createGoal(db, { level: "month", title: "g", date: "2026-10-01" });
    const kr = createKeyResult(db, { goalId: g.id, title: "kr" });
    createTask(db, { title: "t", keyResultId: kr.id, status: "done" });
    createKeyResult(db, { goalId: g.id, title: "bo'sh" });
    assert.equal(progress(g.id), 0.5);
    deleteKeyResult(db, kr.id);
    assert.equal(progress(g.id), 0.5); // bo'sh KR 0 + to'g'ridan-to'g'ri vazifalar 1
  });
});

describe("vazifalar", () => {
  it("KR berilsa maqsad KR'dan olinadi, mos kelmasa — xato", () => {
    const g = createGoal(db, { level: "month", title: "g", date: "2026-10-01" });
    const other = createGoal(db, { level: "month", title: "o", date: "2026-10-01" });
    const kr = createKeyResult(db, { goalId: g.id, title: "kr" });
    const t = createTask(db, { title: "t", keyResultId: kr.id });
    assert.equal(t.goalId, g.id);
    rejects(() => createTask(db, { title: "x", goalId: other.id, keyResultId: kr.id }), "invalid");

    // Faqat maqsad o'zgarsa, boshqa maqsadning KR'i olib tashlanadi.
    const moved = updateTask(db, t.id, { goalId: other.id });
    assert.deepEqual([moved.goalId, moved.keyResultId], [other.id, null]);
    // Faqat KR olib tashlansa, maqsad qoladi.
    updateTask(db, t.id, { keyResultId: kr.id });
    const unlinked = updateTask(db, t.id, { keyResultId: null });
    assert.deepEqual([unlinked.goalId, unlinked.keyResultId], [g.id, null]);
  });

  it("reja davr boshiga keltiriladi; null — rejadan chiqariladi", () => {
    const t = createTask(db, { title: "t", plan: { level: "week", date: "2026-10-22" } });
    assert.deepEqual([t.planLevel, t.planStart], ["week", "2026-10-19"]);
    const m = updateTask(db, t.id, { plan: { level: "month", date: "2026-10-22" } });
    assert.equal(m.planStart, "2026-10-01");
    const none = updateTask(db, t.id, { plan: null });
    assert.deepEqual([none.planLevel, none.planStart], [null, null]);
  });

  it("bajarilganda progress va completedAt yangilanadi, eski va yangi maqsad zanjiri qayta hisoblanadi", () => {
    const a = createGoal(db, { level: "month", title: "a", date: "2026-10-01" });
    const b = createGoal(db, { level: "month", title: "b", date: "2026-10-01" });
    const t = createTask(db, { title: "t", goalId: a.id });
    const done = updateTask(db, t.id, { status: "done" });
    assert.ok(done.completedAt);
    assert.equal(progress(a.id), 1);
    updateTask(db, t.id, { goalId: b.id });
    assert.equal(progress(a.id), 0);
    assert.equal(progress(b.id), 1);
    assert.equal(updateTask(db, t.id, { status: "todo" }).completedAt, null);
    assert.equal(progress(b.id), 0);
  });

  it("teglar almashtiriladi, mavjud bo'lmagan teg — xato; teg nomi yagona", () => {
    const x = createTag(db, { name: "Ish" });
    const y = createTag(db, { name: "Sport", color: "#22aa66" });
    rejects(() => createTag(db, { name: "ish" }), "conflict");
    const t = createTask(db, { title: "t", tagIds: [x.id, y.id, x.id] });
    assert.deepEqual(t.tagIds.sort(), [x.id, y.id].sort());
    assert.deepEqual(updateTask(db, t.id, { tagIds: [y.id] }).tagIds, [y.id]);
    rejects(() => updateTask(db, t.id, { tagIds: [crypto.randomUUID()] }), "not_found");
    deleteTag(db, y.id);
    assert.deepEqual(getTask(db, t.id).tagIds, []);
  });
});

describe("takrorlanuvchi seriyalar", () => {
  const today = toLocalIsoDate();

  it("yaratilganda vazifalar darhol paydo bo'ladi; o'zgarganda kelajakdagilari qayta yaratiladi", () => {
    const r = createRecurrence(db, { title: "Yugurish", rule: { freq: "daily", interval: 1 }, startDate: today });
    assert.equal(r.ruleText, "Har kuni");
    assert.equal(r.generatedUntil, addDays(today, 13));
    assert.equal(listTasks(db, { recurrenceId: r.id, limit: 200 }).length, 14);

    const first = listTasks(db, { recurrenceId: r.id, limit: 1 })[0]!;
    updateTask(db, first.id, { status: "done" });
    updateRecurrence(db, r.id, { title: "Yugurish 5 km", rule: { freq: "daily", interval: 2 } });
    const after = listTasks(db, { recurrenceId: r.id, limit: 200 });
    assert.equal(after.length, 7); // bajarilgan bugungi + qolgan 13 kundan har ikkinchisi (6 ta)
    assert.ok(after.filter((t) => t.id !== first.id).every((t) => t.title === "Yugurish 5 km"));
    assert.equal(getTask(db, first.id).title, "Yugurish");
  });

  it("to'xtatish kelajakdagilarni o'chiradi; o'chirish o'tganlarini saqlab qoladi", () => {
    const r = createRecurrence(db, { title: "r", rule: { freq: "daily", interval: 1 }, startDate: today });
    const first = listTasks(db, { recurrenceId: r.id, limit: 1 })[0]!;
    updateTask(db, first.id, { status: "in_progress" });
    updateRecurrence(db, r.id, { active: false });
    assert.equal(listTasks(db, { recurrenceId: r.id, limit: 200 }).length, 1);
    deleteRecurrence(db, r.id);
    assert.equal(getTask(db, first.id).recurrenceId, null);
    rejects(() => updateRecurrence(db, r.id, { title: "x" }), "not_found");
  });

  it("sanalar tartibi birlashtirilgan qiymatlar bo'yicha tekshiriladi", () => {
    const r = createRecurrence(db, { title: "r", rule: { freq: "daily", interval: 1 }, startDate: today });
    rejects(() => updateRecurrence(db, r.id, { endDate: addDays(today, -1) }), "invalid");
  });
});

describe("fokus (S1-09)", () => {
  it("standart false, yaratish va yangilashda o'rnatiladi", () => {
    const t = createTask(db, { title: "t", plan: { level: "day", date: "2026-10-20" } });
    assert.equal(t.focus, false);
    assert.equal(updateTask(db, t.id, { focus: true }).focus, true);
    assert.equal(createTask(db, { title: "f", focus: true }).focus, true);
  });
});
