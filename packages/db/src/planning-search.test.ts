import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { listGoalsQuerySchema, listTasksQuerySchema } from "@loiha/shared";
import { createDb, runMigrations, type Db } from "./index.ts";
import { createGoal, createTag, createTask, listGoals, listTasks } from "./planning.ts";

// S1-11: matnli qidiruv (q) va teg bo'yicha filtr.

let db: Db;
const tasksIn = (query: Record<string, string>) =>
  listTasks(db, listTasksQuerySchema.parse(query))
    .map((t) => t.title)
    .sort();

beforeEach(() => {
  db = createDb(":memory:");
  runMigrations(db);
});

describe("qidiruv va teglar", () => {
  it("nom va izohda, katta-kichik harfga qaramay qidiradi", () => {
    createTask(db, { title: "Hisobot yozish" });
    createTask(db, { title: "Yugurish", notes: "5 km, HISOBOT kerak emas" });
    createTask(db, { title: "Pochta" });
    assert.deepEqual(tasksIn({ q: "hisobot" }), ["Hisobot yozish", "Yugurish"]);
    assert.deepEqual(tasksIn({ q: "POCH" }), ["Pochta"]);
  });

  it("% va _ belgilari so'zma-so'z qidiriladi", () => {
    createTask(db, { title: "100% tayyor" });
    createTask(db, { title: "1000 tayyor" });
    createTask(db, { title: "snake_case" });
    createTask(db, { title: "snakeXcase" });
    assert.deepEqual(tasksIn({ q: "100%" }), ["100% tayyor"]);
    assert.deepEqual(tasksIn({ q: "e_c" }), ["snake_case"]);
  });

  it("teg bo'yicha filtr va qidiruv bilan birga", () => {
    const ish = createTag(db, { name: "Ish" });
    const uy = createTag(db, { name: "Uy" });
    createTask(db, { title: "Hisobot", tagIds: [ish.id] });
    createTask(db, { title: "Hisob-kitob uy", tagIds: [uy.id, ish.id] });
    createTask(db, { title: "Tozalash", tagIds: [uy.id] });
    assert.deepEqual(tasksIn({ tagId: uy.id }), ["Hisob-kitob uy", "Tozalash"]);
    assert.deepEqual(tasksIn({ tagId: ish.id, q: "hisob" }), ["Hisob-kitob uy", "Hisobot"]);
  });

  it("maqsadlarda ham qidiradi", () => {
    createGoal(db, { level: "year", title: "Sog'lom turmush", date: "2026-01-01" });
    createGoal(db, { level: "year", title: "Ingliz tili", description: "IELTS uchun", date: "2026-01-01" });
    const titles = (q: string) => listGoals(db, listGoalsQuerySchema.parse({ q })).map((g) => g.title);
    assert.deepEqual(titles("ielts"), ["Ingliz tili"]);
    assert.deepEqual(titles("sog'lom"), ["Sog'lom turmush"]);
  });
});
