import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createDb, getGoal, runMigrations, type Db } from "@loiha/db";
import { createDashboardMcpServer } from "./index.ts";

// S1-12: tool'lar MCP protokoli orqali (Claude chaqirgandek) sinaladi. "Bugun" — 2026-10-19 (dushanba, 2026-W43).

const TODAY = "2026-10-19";
let db: Db;
let client: Client;

async function call(name: string, args: Record<string, unknown> = {}) {
  const res = await client.callTool({ name, arguments: args });
  const text = (res.content as { type: string; text: string }[])[0]!.text;
  return { isError: res.isError === true, text, data: res.isError ? null : JSON.parse(text) };
}

beforeEach(async () => {
  db = createDb(":memory:");
  runMigrations(db);
  const server = createDashboardMcpServer(db, () => TODAY);
  const [a, b] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: "test", version: "0" });
  await Promise.all([server.connect(a), client.connect(b)]);
});

afterEach(() => client.close());

describe("dashboard-mcp: maqsad va vazifa tool'lari", () => {
  it("barcha tool'lar ro'yxatda", async () => {
    const names = (await client.listTools()).tools.map((t) => t.name).sort();
    assert.deepEqual(names, [
      "create_task",
      "get_goal_tree",
      "list_goals",
      "list_tasks",
      "ping",
      "update_progress",
      "update_task",
    ]);
  });

  it("'bu haftaning vazifalari': this_week kunlik va haftalik vazifalarni qaytaradi", async () => {
    await call("create_task", { title: "Dushanba ishi", planLevel: "day", date: "today" });
    await call("create_task", { title: "Hafta ishi", planLevel: "week" });
    await call("create_task", { title: "Kelasi hafta", planLevel: "day", date: "2026-10-27" });
    await call("create_task", { title: "Inbox" });
    const { data } = await call("list_tasks", { period: "this_week" });
    assert.equal(data.today, TODAY);
    assert.deepEqual(data.tasks.map((t: { title: string }) => t.title).sort(), ["Dushanba ishi", "Hafta ishi"]);
    const inbox = await call("list_tasks", { unplanned: true });
    assert.deepEqual(
      inbox.data.tasks.map((t: { title: string }) => t.title),
      ["Inbox"],
    );
  });

  it("create_task teglar bilan, update_task holat va ko'chirish; progress yangilanadi", async () => {
    const goalId = (
      await import("@loiha/db").then((m) => m.createGoal(db, { level: "week", title: "Hafta maqsadi", date: TODAY }))
    ).id;
    const created = await call("create_task", {
      title: "Hisobot",
      planLevel: "day",
      date: "tomorrow",
      goalId,
      priority: 3,
      tags: ["ish", "#Ish", "loyiha"],
    });
    assert.equal(created.isError, false);
    const task = created.data.created;
    assert.deepEqual(task.plan, { level: "day", start: "2026-10-20" });
    assert.deepEqual(task.tags.sort(), ["ish", "loyiha"]);

    const done = await call("update_task", { id: task.id, status: "done" });
    assert.equal(done.data.updated.status, "done");
    assert.equal(getGoal(db, goalId).progress, 1);

    const moved = await call("update_task", { id: task.id, planLevel: "none" });
    assert.equal(moved.data.updated.plan, null);
  });

  it("list_goals va get_goal_tree davr bo'yicha; update_progress value va delta", async () => {
    const { createGoal, createKeyResult } = await import("@loiha/db");
    const year = createGoal(db, { level: "year", title: "2026", date: TODAY });
    const q4 = createGoal(db, { level: "quarter", title: "Q4", date: TODAY, parentId: year.id });
    createGoal(db, { level: "quarter", title: "Q1", date: "2026-01-01", parentId: year.id });
    const kr = createKeyResult(db, { goalId: q4.id, title: "Kitob", targetValue: 10, unit: "ta" });

    const goals = await call("list_goals", { period: "this_quarter" });
    assert.deepEqual(goals.data.goals.map((g: { title: string }) => g.title).sort(), ["2026", "Q4"]);

    const tree = await call("get_goal_tree", { period: "this_week" });
    assert.equal(tree.data.tree[0].title, "2026");
    assert.deepEqual(
      tree.data.tree[0].children.map((c: { title: string }) => c.title),
      ["Q4"],
    );
    assert.equal(tree.data.tree[0].children[0].keyResults[0].id, kr.id);

    const set = await call("update_progress", { keyResultId: kr.id, value: 4 });
    assert.equal(set.data.keyResult.progressPercent, 40);
    assert.equal(set.data.goal.progressPercent, 40);
    const inc = await call("update_progress", { keyResultId: kr.id, delta: 1 });
    assert.equal(inc.data.keyResult.current, 5);
    assert.equal(getGoal(db, year.id).progress, 0.25); // (Q4 0.5 + Q1 0) / 2
  });

  it("xatolar isError bilan, tushunarli matnda", async () => {
    const badPeriod = await call("list_tasks", { period: "kecha-emas" });
    assert.equal(badPeriod.isError, true);
    assert.match(badPeriod.text, /Noto'g'ri davr/);
    const missing = await call("update_task", { id: "00000000-0000-4000-8000-000000000000", status: "done" });
    assert.equal(missing.isError, true);
    assert.match(missing.text, /topilmadi/);
    const badDate = await call("create_task", { title: "x", planLevel: "day", date: "2026-02-30" });
    assert.equal(badDate.isError, true);
    const both = await call("update_progress", { keyResultId: "x", value: 1, delta: 1 });
    assert.match(both.text, /aynan bittasini/);
  });
});
