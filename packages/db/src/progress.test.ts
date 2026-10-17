import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { eq } from "drizzle-orm";
import { createDb, runMigrations, type Db } from "./index.ts";
import { recomputeAllProgress, recomputeForTask, recomputeFromKeyResult, recomputeGoalUpwards } from "./progress.ts";
import { goals, keyResults, tasks, type NewGoal } from "./schema.ts";

let db: Db;

const goal = (id: string, level: NewGoal["level"], parentId: string | null = null) =>
  db.insert(goals).values({ id, level, parentId, title: id, periodStart: "2026-01-01", periodEnd: "2026-12-31" }).run();
const kr = (id: string, goalId: string, targetValue: number | null = null) =>
  db.insert(keyResults).values({ id, goalId, title: id, targetValue }).run();
const task = (id: string, link: { goalId?: string; keyResultId?: string }, status: "todo" | "done" = "todo") =>
  db
    .insert(tasks)
    .values({ id, title: id, status, ...link })
    .run();
const goalP = (id: string) => db.select().from(goals).where(eq(goals.id, id)).get()?.progress;
const krP = (id: string) => db.select().from(keyResults).where(eq(keyResults.id, id)).get()?.progress;

// year → quarter → month; quarter'da KR (vazifalardan), month'da to'g'ridan-to'g'ri vazifalar.
beforeEach(() => {
  db = createDb(":memory:");
  runMigrations(db);
  goal("year", "year");
  goal("q4", "quarter", "year");
  goal("oct", "month", "q4");
  kr("kr1", "q4");
  task("t1", { keyResultId: "kr1" });
  task("t2", { keyResultId: "kr1" });
  task("t3", { goalId: "oct" });
});

describe("progress keshi", () => {
  it("vazifa bajarilganda KR va barcha ota maqsadlar yangilanadi", () => {
    db.update(tasks).set({ status: "done" }).where(eq(tasks.id, "t1")).run();
    recomputeForTask(db, { keyResultId: "kr1" });
    assert.equal(krP("kr1"), 0.5);
    assert.equal(goalP("q4"), 0.25); // (kr1 0.5 + oct 0) / 2
    assert.equal(goalP("year"), 0.25);

    db.update(tasks).set({ status: "done" }).where(eq(tasks.id, "t3")).run();
    recomputeForTask(db, { goalId: "oct" });
    assert.equal(goalP("oct"), 1);
    assert.equal(goalP("q4"), 0.75);
    assert.equal(goalP("year"), 0.75);
  });

  it("vazifa boshqa maqsadga ko'chirilsa eski va yangi zanjir yangilanadi", () => {
    task("t4", { goalId: "oct" }, "done");
    recomputeAllProgress(db);
    assert.equal(goalP("oct"), 0.5);

    db.update(tasks).set({ goalId: "q4" }).where(eq(tasks.id, "t4")).run();
    recomputeForTask(db, { goalId: "oct" }, { goalId: "q4" });
    assert.equal(goalP("oct"), 0);
    assert.equal(goalP("q4"), 1 / 3); // kr1 0, oct 0, to'g'ridan-to'g'ri vazifalar 1
  });

  it("raqamli KR qiymati o'zgarganda", () => {
    kr("kr2", "year", 100);
    db.update(keyResults).set({ currentValue: 40 }).where(eq(keyResults.id, "kr2")).run();
    recomputeFromKeyResult(db, "kr2");
    assert.equal(krP("kr2"), 0.4);
    assert.equal(goalP("year"), 0.2); // (kr2 0.4 + q4 0) / 2
  });

  it("dropped bola maqsad hisobga olinmaydi, done maqsad — 1", () => {
    goal("nov", "month", "q4");
    db.update(goals).set({ status: "done" }).where(eq(goals.id, "oct")).run();
    recomputeGoalUpwards(db, "oct");
    assert.equal(goalP("q4"), 1 / 3); // kr1 0, oct 1, nov 0

    db.update(goals).set({ status: "dropped" }).where(eq(goals.id, "nov")).run();
    recomputeGoalUpwards(db, "q4");
    assert.equal(goalP("q4"), 0.5);
  });

  it("recomputeAllProgress noldan to'g'ri natija beradi va sikldan qotib qolmaydi", () => {
    db.update(tasks).set({ status: "done" }).run();
    recomputeAllProgress(db);
    assert.equal(krP("kr1"), 1);
    assert.equal(goalP("year"), 1);

    goal("a", "week");
    goal("b", "week", "a");
    db.update(goals).set({ parentId: "b" }).where(eq(goals.id, "a")).run();
    task("t5", { goalId: "a" }, "done");
    recomputeAllProgress(db);
    recomputeGoalUpwards(db, "a");
    assert.equal(goalP("a"), 0.5); // b 0, to'g'ridan-to'g'ri vazifalar 1
  });
});
