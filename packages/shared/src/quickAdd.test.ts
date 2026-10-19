import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseQuickAdd } from "./quickAdd.ts";

const TODAY = "2026-10-19"; // dushanba

describe("parseQuickAdd", () => {
  it("teglar, ustuvorlik va reja", () => {
    assert.deepEqual(parseQuickAdd("Hisobot yozish #ish !3 @ertaga", TODAY), {
      title: "Hisobot yozish",
      tags: ["ish"],
      priority: 3,
      plan: { level: "day", date: "2026-10-20" },
    });
  });

  it("belgi bo'lmasa standart reja — bugun; defaultPlan berilishi mumkin", () => {
    assert.deepEqual(parseQuickAdd("  Pochta  ", TODAY).plan, { level: "day", date: TODAY });
    assert.equal(parseQuickAdd("Pochta", TODAY, null).plan, null);
    assert.equal(parseQuickAdd("Pochta @inbox", TODAY).plan, null);
  });

  it("hafta, oy, sana va hafta kunlari", () => {
    assert.deepEqual(parseQuickAdd("x @hafta", TODAY).plan, { level: "week", date: TODAY });
    assert.deepEqual(parseQuickAdd("x @oy", TODAY).plan, { level: "month", date: TODAY });
    assert.deepEqual(parseQuickAdd("x @2026-11-03", TODAY).plan, { level: "day", date: "2026-11-03" });
    assert.deepEqual(parseQuickAdd("x @juma", TODAY).plan, { level: "day", date: "2026-10-23" });
    assert.deepEqual(parseQuickAdd("x @Dushanba", TODAY).plan, { level: "day", date: TODAY }); // bugun dushanba
    assert.deepEqual(parseQuickAdd("x @yakshanba", "2026-10-20").plan, { level: "day", date: "2026-10-25" });
  });

  it("o'zbekcha apostrofli teglar, takrorlar bir marta", () => {
    const r = parseQuickAdd("Yugurish #sog'lom #Sog'lom #o'qish", TODAY);
    assert.deepEqual(r.tags, ["sog'lom", "o'qish"]);
    assert.equal(r.title, "Yugurish");
  });

  it("tanilmagan belgilar nomda qoladi", () => {
    const r = parseQuickAdd("Email @someone !5 # 2026-13-01 @2026-02-30", TODAY);
    assert.equal(r.title, "Email @someone !5 # 2026-13-01 @2026-02-30");
    assert.equal(r.priority, null);
    assert.deepEqual(r.tags, []);
  });
});
