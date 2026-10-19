import { sql } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { ZodError } from "zod";
import { PlanningError, type Db } from "@loiha/db";
import type { JobQueue } from "./queue.ts";
import type { ClaudeInfo } from "./claude/runner.ts";
import { jobRoutes } from "./routes/jobs.ts";
import { goalRoutes, keyResultRoutes, recurrenceRoutes, tagRoutes, taskRoutes } from "./routes/planning.ts";

export function createApp(deps: { db: Db; queue: JobQueue; claude: () => ClaudeInfo }) {
  const startedAt = Date.now();

  const app = new Hono()
    .use("*", logger())
    .get("/api/health", (c) => {
      let dbOk = true;
      try {
        deps.db.run(sql`select 1`);
      } catch {
        dbOk = false;
      }
      const claude = deps.claude();
      return c.json(
        {
          ok: dbOk,
          uptimeSec: Math.round((Date.now() - startedAt) / 1000),
          db: { ok: dbOk },
          queue: deps.queue.stats,
          claude,
        },
        dbOk ? 200 : 503,
      );
    })
    .route("/api/jobs", jobRoutes(deps.db, deps.queue))
    .route("/api/goals", goalRoutes(deps.db))
    .route("/api/key-results", keyResultRoutes(deps.db))
    .route("/api/tasks", taskRoutes(deps.db))
    .route("/api/recurrences", recurrenceRoutes(deps.db))
    .route("/api/tags", tagRoutes(deps.db));

  app.notFound((c) => c.json({ error: "Topilmadi" }, 404));

  app.onError((err, c) => {
    if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
    if (err instanceof PlanningError) {
      const status = { not_found: 404, invalid: 400, conflict: 409 } as const;
      return c.json({ error: err.message }, status[err.code]);
    }
    if (err instanceof ZodError) {
      return c.json(
        { error: "Noto'g'ri so'rov", issues: err.issues.map((i) => ({ path: i.path, message: i.message })) },
        400,
      );
    }
    if (err instanceof SyntaxError) return c.json({ error: "JSON noto'g'ri" }, 400);
    console.error(err);
    return c.json({ error: "Ichki server xatosi" }, 500);
  });

  return app;
}

export type AppType = ReturnType<typeof createApp>;
