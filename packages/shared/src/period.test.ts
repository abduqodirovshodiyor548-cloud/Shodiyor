import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addDays,
  isIsoDate,
  isoWeek,
  isPeriodStart,
  parsePeriodKey,
  periodKey,
  periodOf,
  periodsOverlap,
  periodsWithin,
  shiftPeriod,
  toLocalIsoDate,
} from "./period.ts";

const range = (p: { start: string; end: string }) => [p.start, p.end];

describe("isIsoDate", () => {
  it("haqiqiy sanalarni qabul qiladi", () => {
    assert.ok(isIsoDate("2026-10-17"));
    assert.ok(isIsoDate("2028-02-29"));
  });
  it("noto'g'ri sanalarni rad etadi", () => {
    for (const v of ["2026-02-29", "2026-13-01", "2026-1-1", "2026-10-17T00:00", ""]) {
      assert.equal(isIsoDate(v), false, v);
    }
  });
});

describe("periodOf", () => {
  it("yil, kvartal, oy, kun", () => {
    assert.deepEqual(range(periodOf("year", "2026-10-17")), ["2026-01-01", "2026-12-31"]);
    assert.deepEqual(range(periodOf("quarter", "2026-10-17")), ["2026-10-01", "2026-12-31"]);
    assert.deepEqual(range(periodOf("quarter", "2026-02-10")), ["2026-01-01", "2026-03-31"]);
    assert.deepEqual(range(periodOf("month", "2028-02-10")), ["2028-02-01", "2028-02-29"]);
    assert.deepEqual(range(periodOf("day", "2026-10-17")), ["2026-10-17", "2026-10-17"]);
  });
  it("hafta dushanbadan yakshanbagacha", () => {
    // 2026-10-17 — shanba
    assert.deepEqual(range(periodOf("week", "2026-10-17")), ["2026-10-12", "2026-10-18"]);
    assert.deepEqual(range(periodOf("week", "2026-10-12")), ["2026-10-12", "2026-10-18"]);
    assert.deepEqual(range(periodOf("week", "2026-10-18")), ["2026-10-12", "2026-10-18"]);
    // yil chegarasidan o'tadigan hafta
    assert.deepEqual(range(periodOf("week", "2027-01-01")), ["2026-12-28", "2027-01-03"]);
  });
  it("noto'g'ri sanada xato beradi", () => {
    assert.throws(() => periodOf("month", "2026-02-30"), RangeError);
  });
});

describe("isoWeek", () => {
  it("ISO 8601 hafta raqamlari", () => {
    assert.deepEqual(isoWeek("2026-10-17"), { year: 2026, week: 42 });
    assert.deepEqual(isoWeek("2026-01-01"), { year: 2026, week: 1 }); // payshanba
    assert.deepEqual(isoWeek("2026-12-31"), { year: 2026, week: 53 });
    assert.deepEqual(isoWeek("2027-01-03"), { year: 2026, week: 53 });
    assert.deepEqual(isoWeek("2027-01-04"), { year: 2027, week: 1 });
    assert.deepEqual(isoWeek("2024-12-30"), { year: 2025, week: 1 });
    assert.deepEqual(isoWeek("2021-01-03"), { year: 2020, week: 53 });
  });
});

describe("shiftPeriod", () => {
  it("oy oxiri va yil chegarasidan to'g'ri o'tadi", () => {
    assert.deepEqual(range(shiftPeriod(periodOf("month", "2026-01-31"), 1)), ["2026-02-01", "2026-02-28"]);
    assert.deepEqual(range(shiftPeriod(periodOf("month", "2026-01-15"), -1)), ["2025-12-01", "2025-12-31"]);
    assert.deepEqual(range(shiftPeriod(periodOf("quarter", "2026-11-01"), 1)), ["2027-01-01", "2027-03-31"]);
    assert.deepEqual(range(shiftPeriod(periodOf("week", "2026-12-30"), 1)), ["2027-01-04", "2027-01-10"]);
    assert.deepEqual(range(shiftPeriod(periodOf("year", "2026-05-05"), -2)), ["2024-01-01", "2024-12-31"]);
    assert.deepEqual(range(shiftPeriod(periodOf("day", "2026-12-31"), 1)), ["2027-01-01", "2027-01-01"]);
  });
});

describe("isPeriodStart", () => {
  it("plan_start moslashuvini tekshiradi", () => {
    assert.ok(isPeriodStart("week", "2026-10-12"));
    assert.equal(isPeriodStart("week", "2026-10-13"), false);
    assert.ok(isPeriodStart("month", "2026-10-01"));
    assert.equal(isPeriodStart("month", "2026-10-02"), false);
    assert.ok(isPeriodStart("day", "2026-10-17"));
    assert.equal(isPeriodStart("day", "2026-02-30"), false);
  });
});

describe("periodsWithin", () => {
  it("oyning haftalari chegaradan chiqqanlarini ham o'z ichiga oladi", () => {
    const weeks = periodsWithin("week", periodOf("month", "2026-10-01"));
    assert.deepEqual(
      weeks.map((w) => w.start),
      ["2026-09-28", "2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26"],
    );
  });
  it("yilning kvartallari va kvartalning oylari", () => {
    assert.equal(periodsWithin("quarter", periodOf("year", "2026-01-01")).length, 4);
    assert.deepEqual(periodsWithin("month", periodOf("quarter", "2026-10-01")).map(periodKey), [
      "2026-10",
      "2026-11",
      "2026-12",
    ]);
    assert.equal(periodsWithin("week", periodOf("year", "2026-01-01")).length, 53);
  });
});

describe("periodsOverlap", () => {
  it("chegaralar kiradi", () => {
    const week = periodOf("week", "2026-09-30"); // 09-28…10-04
    assert.ok(periodsOverlap(week, periodOf("month", "2026-10-01")));
    assert.ok(periodsOverlap(week, periodOf("month", "2026-09-01")));
    assert.equal(periodsOverlap(week, periodOf("month", "2026-11-01")), false);
  });
});

describe("periodKey / parsePeriodKey", () => {
  it("kalitlar", () => {
    assert.equal(periodKey(periodOf("year", "2026-10-17")), "2026");
    assert.equal(periodKey(periodOf("quarter", "2026-10-17")), "2026-Q4");
    assert.equal(periodKey(periodOf("month", "2026-10-17")), "2026-10");
    assert.equal(periodKey(periodOf("week", "2026-10-17")), "2026-W42");
    assert.equal(periodKey(periodOf("week", "2027-01-02")), "2026-W53");
    assert.equal(periodKey(periodOf("day", "2026-10-17")), "2026-10-17");
  });
  it("ikki tomonlama aylanadi", () => {
    for (const level of ["year", "quarter", "month", "week", "day"] as const) {
      for (let d = "2026-12-20"; d <= "2027-01-10"; d = addDays(d, 1)) {
        const p = periodOf(level, d);
        assert.deepEqual(parsePeriodKey(periodKey(p)), p, `${level} ${d}`);
      }
    }
  });
  it("noto'g'ri kalitlar uchun null", () => {
    for (const k of ["2026-Q5", "2026-W00", "2027-W53", "2026-13", "2026-02-30", "26-10", "2026-W1"]) {
      assert.equal(parsePeriodKey(k), null, k);
    }
    assert.equal(parsePeriodKey("2026-W53")?.start, "2026-12-28");
  });
});

describe("toLocalIsoDate", () => {
  it("lokal kalendar kunini oladi", () => {
    assert.equal(toLocalIsoDate(new Date(2026, 9, 17, 23, 59)), "2026-10-17");
    assert.equal(toLocalIsoDate(new Date(2026, 0, 1, 0, 0)), "2026-01-01");
  });
});
