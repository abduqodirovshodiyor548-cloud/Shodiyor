import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  describeRecurrence,
  occurrencesBetween,
  occursOn,
  recurrenceRuleSchema,
  recurrenceSchema,
  type Recurrence,
} from "./recurrence.ts";

const series = (rule: unknown, start: string, end: string | null = null): Recurrence =>
  recurrenceSchema.parse({ rule, start, end });

describe("recurrenceRuleSchema", () => {
  it("interval standart 1", () => {
    assert.deepEqual(recurrenceRuleSchema.parse({ freq: "daily" }), { freq: "daily", interval: 1 });
  });
  it("noto'g'ri qoidalarni rad etadi", () => {
    for (const rule of [
      { freq: "daily", interval: 0 },
      { freq: "weekly", weekdays: [] },
      { freq: "weekly", weekdays: [0] },
      { freq: "monthly", monthDays: [0] },
      { freq: "monthly", monthDays: [32] },
      { freq: "yearly" },
    ]) {
      assert.equal(recurrenceRuleSchema.safeParse(rule).success, false, JSON.stringify(rule));
    }
  });
  it("tugash sanasi boshlanishdan oldin bo'lmasligi kerak", () => {
    assert.equal(
      recurrenceSchema.safeParse({ rule: { freq: "daily" }, start: "2026-10-19", end: "2026-10-18" }).success,
      false,
    );
    assert.equal(recurrenceSchema.safeParse({ rule: { freq: "daily" }, start: "2026-02-30" }).success, false);
  });
});

describe("occurrencesBetween", () => {
  it("kunlik va har 3 kunda", () => {
    const s = series({ freq: "daily" }, "2026-10-19");
    assert.deepEqual(occurrencesBetween(s, "2026-10-18", "2026-10-21"), ["2026-10-19", "2026-10-20", "2026-10-21"]);
    const s3 = series({ freq: "daily", interval: 3 }, "2026-10-19");
    assert.deepEqual(occurrencesBetween(s3, "2026-10-20", "2026-10-28"), ["2026-10-22", "2026-10-25", "2026-10-28"]);
  });

  it("haftalik: ish kunlari", () => {
    const s = series({ freq: "weekly", weekdays: [1, 2, 3, 4, 5] }, "2026-10-19");
    assert.deepEqual(occurrencesBetween(s, "2026-10-23", "2026-10-27"), ["2026-10-23", "2026-10-26", "2026-10-27"]);
  });

  it("har 2 haftada, start hafta o'rtasida bo'lsa ham hafta dushanbadan sanaladi", () => {
    // 2026-10-21 — chorshanba; dushanbasi 2026-10-19 hisoblanadi, shu hafta dushanbasi o'tkazib yuboriladi.
    const s = series({ freq: "weekly", interval: 2, weekdays: [1, 3] }, "2026-10-21");
    assert.deepEqual(occurrencesBetween(s, "2026-10-19", "2026-11-08"), ["2026-10-21", "2026-11-02", "2026-11-04"]);
  });

  it("oylik: 31-kun qisqa oylarda o'tkazib yuboriladi, -1 — oxirgi kun", () => {
    const s31 = series({ freq: "monthly", monthDays: [31] }, "2026-01-01");
    assert.deepEqual(occurrencesBetween(s31, "2026-01-01", "2026-05-31"), ["2026-01-31", "2026-03-31", "2026-05-31"]);
    const last = series({ freq: "monthly", monthDays: [-1] }, "2028-01-15");
    assert.deepEqual(occurrencesBetween(last, "2028-01-01", "2028-03-31"), ["2028-01-31", "2028-02-29", "2028-03-31"]);
  });

  it("har 3 oyda, yil chegarasidan o'tadi", () => {
    const s = series({ freq: "monthly", interval: 3, monthDays: [1, 15] }, "2026-11-10");
    assert.deepEqual(occurrencesBetween(s, "2026-11-01", "2027-05-31"), [
      "2026-11-15",
      "2027-02-01",
      "2027-02-15",
      "2027-05-01",
      "2027-05-15",
    ]);
  });

  it("end va so'ralgan oraliq kesishmasi", () => {
    const s = series({ freq: "daily" }, "2026-10-19", "2026-10-21");
    assert.deepEqual(occurrencesBetween(s, "2026-10-20", "2026-10-30"), ["2026-10-20", "2026-10-21"]);
    assert.deepEqual(occurrencesBetween(s, "2026-10-22", "2026-10-30"), []);
    assert.deepEqual(occurrencesBetween(s, "2026-10-01", "2026-10-18"), []);
  });

  it("start dan oldingi sana — takrorlanish emas", () => {
    assert.equal(occursOn({ freq: "daily", interval: 1 }, "2026-10-19", "2026-10-18"), false);
  });
});

describe("describeRecurrence", () => {
  it("o'zbekcha tavsif", () => {
    assert.equal(describeRecurrence({ freq: "daily", interval: 1 }), "Har kuni");
    assert.equal(describeRecurrence({ freq: "daily", interval: 2 }), "Har 2 kunda");
    assert.equal(
      describeRecurrence({ freq: "weekly", interval: 1, weekdays: [5, 1, 2, 3, 4] }),
      "Har hafta: ish kunlari",
    );
    assert.equal(
      describeRecurrence({ freq: "weekly", interval: 2, weekdays: [3, 1] }),
      "Har 2 haftada: dushanba, chorshanba",
    );
    assert.equal(
      describeRecurrence({ freq: "monthly", interval: 1, monthDays: [-1, 15] }),
      "Har oy: 15-kuni, oxirgi kuni",
    );
  });
});
