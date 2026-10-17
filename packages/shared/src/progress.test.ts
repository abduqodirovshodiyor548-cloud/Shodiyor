import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { goalProgress, keyResultProgress, taskCompletion } from "./progress.ts";

describe("taskCompletion", () => {
  it("bekor qilinganlarni hisobga olmaydi", () => {
    assert.equal(taskCompletion(["done", "todo", "cancelled"]), 0.5);
    assert.equal(taskCompletion(["done", "in_progress", "todo", "done"]), 0.5);
  });
  it("vazifa yo'q yoki hammasi bekor — null", () => {
    assert.equal(taskCompletion([]), null);
    assert.equal(taskCompletion(["cancelled"]), null);
  });
});

describe("keyResultProgress", () => {
  it("raqamli KR: start → target", () => {
    assert.equal(keyResultProgress({ startValue: 0, targetValue: 10, currentValue: 4 }, []), 0.4);
    assert.equal(keyResultProgress({ startValue: 20, targetValue: 30, currentValue: 25 }, ["todo"]), 0.5);
  });
  it("kamayuvchi maqsad (masalan vazn 80 → 70)", () => {
    assert.equal(keyResultProgress({ startValue: 80, targetValue: 70, currentValue: 75 }, []), 0.5);
  });
  it("0…1 oralig'iga qisiladi", () => {
    assert.equal(keyResultProgress({ startValue: 0, targetValue: 10, currentValue: 15 }, []), 1);
    assert.equal(keyResultProgress({ startValue: 0, targetValue: 10, currentValue: -3 }, []), 0);
  });
  it("start = target", () => {
    assert.equal(keyResultProgress({ startValue: 5, targetValue: 5, currentValue: 5 }, []), 1);
    assert.equal(keyResultProgress({ startValue: 5, targetValue: 5, currentValue: 4 }, []), 0);
  });
  it("target yo'q — vazifalardan", () => {
    assert.equal(keyResultProgress({ startValue: 0, targetValue: null, currentValue: 0 }, ["done", "todo"]), 0.5);
    assert.equal(keyResultProgress({ startValue: 0, targetValue: null, currentValue: 0 }, []), 0);
  });
});

describe("goalProgress", () => {
  const base = { status: "active" as const, keyResults: [], children: [], directTasks: [] };
  it("KR, bola maqsadlar va to'g'ridan-to'g'ri vazifalar o'rtachasi", () => {
    assert.equal(goalProgress({ ...base, keyResults: [1, 0.5], children: [0], directTasks: ["done", "todo"] }), 0.5);
  });
  it("to'g'ridan-to'g'ri vazifalar bitta qism hisoblanadi", () => {
    assert.equal(goalProgress({ ...base, keyResults: [0], directTasks: ["done", "done", "done"] }), 0.5);
  });
  it("bo'sh maqsad — 0, bajarilgan maqsad — 1", () => {
    assert.equal(goalProgress(base), 0);
    assert.equal(goalProgress({ ...base, status: "done", keyResults: [0] }), 1);
  });
  it("faqat bekor qilingan vazifalar qism qo'shmaydi", () => {
    assert.equal(goalProgress({ ...base, keyResults: [0.8], directTasks: ["cancelled"] }), 0.8);
  });
});
