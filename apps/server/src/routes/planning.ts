import { Hono } from "hono";
import { z } from "zod";
import {
  createGoal,
  createKeyResult,
  createRecurrence,
  createTag,
  createTask,
  deleteGoal,
  deleteKeyResult,
  deleteRecurrence,
  deleteTag,
  deleteTask,
  getGoal,
  getRecurrence,
  getTask,
  listGoals,
  listRecurrences,
  listTags,
  listTasks,
  updateGoal,
  updateKeyResult,
  updateRecurrence,
  updateTag,
  updateTask,
  type Db,
} from "@loiha/db";
import {
  GOAL_LEVELS,
  createGoalSchema,
  createKeyResultSchema,
  createRecurrenceSchema,
  createTagSchema,
  createTaskSchema,
  listTasksQuerySchema,
  updateGoalSchema,
  updateKeyResultSchema,
  updateRecurrenceSchema,
  updateTagSchema,
  updateTaskSchema,
} from "@loiha/shared";

// S1-05: maqsadlar, key result'lar, vazifalar, takrorlanuvchi seriyalar va teglar CRUD.
// Mantiq va progress keshini yangilash @loiha/db dagi servislarda; bu yerda faqat HTTP qatlami.
// Davr bo'yicha filtr va daraxt so'rovlari — S1-06.

const listGoalsQuerySchema = z.object({
  level: z.enum(GOAL_LEVELS).optional(),
  /** `root` — ota maqsadi yo'qlar. */
  parentId: z.union([z.literal("root"), z.uuid()]).optional(),
});

export function goalRoutes(db: Db) {
  return new Hono()
    .get("/", (c) => {
      const q = listGoalsQuerySchema.parse(c.req.query());
      return c.json(listGoals(db, { level: q.level, parentId: q.parentId === "root" ? null : q.parentId }));
    })
    .post("/", async (c) => c.json(createGoal(db, createGoalSchema.parse(await c.req.json())), 201))
    .get("/:id", (c) => c.json(getGoal(db, c.req.param("id"))))
    .patch("/:id", async (c) => c.json(updateGoal(db, c.req.param("id"), updateGoalSchema.parse(await c.req.json()))))
    .delete("/:id", (c) => {
      deleteGoal(db, c.req.param("id"));
      return c.body(null, 204);
    });
}

export function keyResultRoutes(db: Db) {
  return new Hono()
    .post("/", async (c) => c.json(createKeyResult(db, createKeyResultSchema.parse(await c.req.json())), 201))
    .patch("/:id", async (c) =>
      c.json(updateKeyResult(db, c.req.param("id"), updateKeyResultSchema.parse(await c.req.json()))),
    )
    .delete("/:id", (c) => {
      deleteKeyResult(db, c.req.param("id"));
      return c.body(null, 204);
    });
}

export function taskRoutes(db: Db) {
  return new Hono()
    .get("/", (c) => c.json(listTasks(db, listTasksQuerySchema.parse(c.req.query()))))
    .post("/", async (c) => c.json(createTask(db, createTaskSchema.parse(await c.req.json())), 201))
    .get("/:id", (c) => c.json(getTask(db, c.req.param("id"))))
    .patch("/:id", async (c) => c.json(updateTask(db, c.req.param("id"), updateTaskSchema.parse(await c.req.json()))))
    .delete("/:id", (c) => {
      deleteTask(db, c.req.param("id"));
      return c.body(null, 204);
    });
}

export function recurrenceRoutes(db: Db) {
  return new Hono()
    .get("/", (c) => c.json(listRecurrences(db)))
    .post("/", async (c) => c.json(createRecurrence(db, createRecurrenceSchema.parse(await c.req.json())), 201))
    .get("/:id", (c) => c.json(getRecurrence(db, c.req.param("id"))))
    .patch("/:id", async (c) =>
      c.json(updateRecurrence(db, c.req.param("id"), updateRecurrenceSchema.parse(await c.req.json()))),
    )
    .delete("/:id", (c) => {
      deleteRecurrence(db, c.req.param("id"));
      return c.body(null, 204);
    });
}

export function tagRoutes(db: Db) {
  return new Hono()
    .get("/", (c) => c.json(listTags(db)))
    .post("/", async (c) => c.json(createTag(db, createTagSchema.parse(await c.req.json())), 201))
    .patch("/:id", async (c) => c.json(updateTag(db, c.req.param("id"), updateTagSchema.parse(await c.req.json()))))
    .delete("/:id", (c) => {
      deleteTag(db, c.req.param("id"));
      return c.body(null, 204);
    });
}
