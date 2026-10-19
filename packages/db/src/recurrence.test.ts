import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { asc, eq } from "drizzle-orm";
import { createDb, runMigrations, type Db } from "./index.ts";
import { materializeRecurrences, resetFutureOccurrences } from "./recurrence.ts";
import { goals, taskRecurrences, tasks, type NewTaskRecurrence } from "./schema.ts";

let db: Db;

const series = (values: Partial<NewTaskRecurrence> = {}) =>
  db
    .insert(taskRecurrences)
    .values({ id: "r1", title: "Yugurish", rule: { freq: "daily", interval: 1 }, startDate: "2026-10-19", ...values })
    .run();
const dates = (recurrenceId = "r1") =>
  db
    .select({ d: tasks.occurrenceDate })
    .from(tasks)
    .where(eq(tasks.recurrenceId, recurrenceId))
    .orderBy(asc(tasks.occurrenceDate))
    .all()
    .map((t) => t.d);
const goalP = (id: string) => db.select().from(goals).where(eq(goals.id, id)).get()?.progress;

beforeEach(() => {
  db = createDb(":memory:");
  runMigrations(db);
});

describe("materializeRecurrences", () => {
  it("kunlik vazifalarni yaratadi va qayta chaqiruvda takrorlamaydi", () => {
    series({ priority: 2, estimateMinutes: 30 });
    assert.equal(materializeRecurrences(db, { from: "2026-01-01", until: "2026-10-21" }), 3);
    assert.deepEqual(dates(), ["2026-10-19", "2026-10-20", "2026-10-21"]);
    const t = db.select().from(tasks).where(eq(tasks.occurrenceDate, "2026-10-20")).get()!;
    assert.equal(t.title, "Yugurish");
    assert.equal(t.planLevel, "day");
    assert.equal(t.planStart, "2026-10-20");
    assert.equal(t.priority, 2);
    assert.equal(t.estimateMinutes, 30);
    assert.equal(t.status, "todo");

    assert.equal(materializeRecurrences(db, { from: "2026-01-01", until: "2026-10-21" }), 0);
    assert.equal(materializeRecurrences(db, { from: "2026-01-01", until: "2026-10-22" }), 1);
    assert.equal(db.select().from(taskRecurrences).get()?.generatedUntil, "2026-10-22");
  });

  it("o'chirilgan takrorlanish qayta yaratilmaydi", () => {
    series();
    materializeRecurrences(db, { from: "2026-01-01", until: "2026-10-21" });
    db.delete(tasks).where(eq(tasks.occurrenceDate, "2026-10-20")).run();
    materializeRecurrences(db, { from: "2026-01-01", until: "2026-10-22" });
    assert.deepEqual(dates(), ["2026-10-19", "2026-10-21", "2026-10-22"]);
  });

  it("haftalik qoida, end_date va to'xtatilgan seriya", () => {
    series({ rule: { freq: "weekly", interval: 1, weekdays: [1, 4] }, endDate: "2026-10-29" });
    series({ id: "r2", active: false });
    materializeRecurrences(db, { from: "2026-01-01", until: "2026-11-30" });
    assert.deepEqual(dates(), ["2026-10-19", "2026-10-22", "2026-10-26", "2026-10-29"]);
    assert.deepEqual(dates("r2"), []);
  });

  it("yangi vazifalar maqsad progressiga ta'sir qiladi", () => {
    db.insert(goals)
      .values({ id: "g", level: "week", title: "g", periodStart: "2026-10-19", periodEnd: "2026-10-25" })
      .run();
    db.insert(tasks).values({ title: "bajarilgan", goalId: "g", status: "done" }).run();
    series({ goalId: "g" });
    materializeRecurrences(db, { from: "2026-01-01", until: "2026-10-19" });
    assert.equal(goalP("g"), 0.5);
  });
});

describe("resetFutureOccurrences", () => {
  it("kelajakdagi todo vazifalarni o'chirib, yangi qoida bo'yicha qayta yaratishga imkon beradi", () => {
    series();
    materializeRecurrences(db, { from: "2026-01-01", until: "2026-10-24" });
    db.update(tasks).set({ status: "done" }).where(eq(tasks.occurrenceDate, "2026-10-22")).run();

    db.update(taskRecurrences)
      .set({ rule: { freq: "daily", interval: 2 } })
      .run();
    assert.equal(resetFutureOccurrences(db, "r1", "2026-10-21"), 3); // 21, 23, 24; 22 — bajarilgan, qoladi
    assert.equal(db.select().from(taskRecurrences).get()?.generatedUntil, "2026-10-20");

    materializeRecurrences(db, { from: "2026-01-01", until: "2026-10-24" });
    assert.deepEqual(dates(), ["2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23"]);
  });

  it("seriya o'chirilsa vazifalar oddiy vazifa bo'lib qoladi", () => {
    series();
    materializeRecurrences(db, { from: "2026-01-01", until: "2026-10-20" });
    db.delete(taskRecurrences).run();
    const all = db.select().from(tasks).all();
    assert.equal(all.length, 2);
    assert.ok(all.every((t) => t.recurrenceId === null && t.occurrenceDate !== null));
  });
});

describe("materializeRecurrences: from chegarasi", () => {
  it("from dan oldingi takrorlanishlar yaratilmaydi (qayta yoqilgan seriya qarz to'plamaydi)", () => {
    series({ startDate: "2026-10-01" });
    materializeRecurrences(db, { from: "2026-10-19", until: "2026-10-20" });
    assert.deepEqual(dates(), ["2026-10-19", "2026-10-20"]);
  });
});
