import { and, asc, desc, eq, gt } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { streamSSE } from "hono/streaming";
import { z } from "zod";
import { jobEvents, jobs, type Db, type Job } from "@loiha/db";
import {
  TERMINAL_JOB_STATUSES,
  createClaudeJobSchema,
  type JobDto,
  type JobEventData,
  type JobEventDto,
} from "@loiha/shared";
import type { JobQueue } from "../queue.ts";

export function toJobDto({ runAfter: _r, cancelRequested: _c, ...j }: Job): JobDto {
  return {
    ...j,
    createdAt: j.createdAt.getTime(),
    startedAt: j.startedAt?.getTime() ?? null,
    finishedAt: j.finishedAt?.getTime() ?? null,
  };
}

const echoSchema = z.object({
  text: z.string().max(10_000),
  delayMs: z.number().int().min(0).max(5000).optional(),
  fail: z.boolean().optional(),
});

export function jobRoutes(db: Db, queue: JobQueue) {
  const getJob = (id: string) => {
    const job = db.select().from(jobs).where(eq(jobs.id, id)).get();
    if (!job) throw new HTTPException(404, { message: "Job topilmadi" });
    return job;
  };

  return (
    new Hono()
      .get("/", (c) => {
        const limit = Math.min(Number(c.req.query("limit") ?? 50) || 50, 200);
        const rows = db.select().from(jobs).orderBy(desc(jobs.createdAt)).limit(limit).all();
        return c.json(rows.map(toJobDto));
      })

      .post("/claude", async (c) => {
        const input = createClaudeJobSchema.parse(await c.req.json());
        const job = queue.enqueue("claude", input, { profile: input.profile });
        return c.json(toJobDto(job), 201);
      })

      // Navbatni Claude'siz sinash uchun
      .post("/echo", async (c) => {
        const input = echoSchema.parse(await c.req.json());
        return c.json(toJobDto(queue.enqueue("echo", input, { maxAttempts: input.fail ? 2 : 1 })), 201);
      })

      .get("/:id", (c) => c.json(toJobDto(getJob(c.req.param("id")))))

      .post("/:id/cancel", (c) => {
        const job = getJob(c.req.param("id"));
        if (TERMINAL_JOB_STATUSES.includes(job.status))
          throw new HTTPException(409, { message: "Job allaqachon yakunlangan" });
        return c.json({ ok: queue.cancel(job.id) });
      })

      /**
       * SSE: avval saqlangan hodisalarni (Last-Event-ID / ?after dan keyingi) qayta o'ynatadi,
       * keyin jonli hodisalarni uzatadi. Job yakunlanganda oqim yopiladi.
       */
      .get("/:id/events", (c) => {
        const job = getJob(c.req.param("id"));
        const after = Number(c.req.header("Last-Event-ID") ?? c.req.query("after") ?? 0) || 0;

        return streamSSE(c, async (stream) => {
          let lastSeq = after;
          let chain = Promise.resolve();
          let finished = false;
          let resolveDone!: () => void;
          const done = new Promise<void>((r) => (resolveDone = r));

          const send = async (e: JobEventDto) => {
            if (e.seq !== null) {
              if (e.seq <= lastSeq) return;
              lastSeq = e.seq;
            }
            await stream.writeSSE({ id: e.seq !== null ? String(e.seq) : undefined, data: JSON.stringify(e) });
            if (e.data.type === "status" && TERMINAL_JOB_STATUSES.includes(e.data.status)) {
              finished = true;
              resolveDone();
            }
          };
          const enqueue = (e: JobEventDto) => (chain = chain.then(() => send(e)).catch(() => {}));

          // Avval obuna (bo'shliq qolmasligi uchun), jonli hodisalar replay tugaguncha bufer'da turadi
          const buffer: JobEventDto[] = [];
          let replaying = true;
          const unsubscribe = queue.subscribe(job.id, (e) => (replaying ? buffer.push(e) : enqueue(e)));
          stream.onAbort(() => {
            unsubscribe();
            resolveDone();
          });

          const rows = db
            .select()
            .from(jobEvents)
            .where(and(eq(jobEvents.jobId, job.id), gt(jobEvents.seq, after)))
            .orderBy(asc(jobEvents.seq))
            .all();
          for (const r of rows) enqueue({ seq: r.seq, createdAt: r.createdAt.getTime(), data: r.data as JobEventData });
          replaying = false;
          for (const e of buffer) enqueue(e);
          await chain;

          if (!finished && TERMINAL_JOB_STATUSES.includes(getJob(job.id).status)) finished = true;
          const ping = setInterval(() => void stream.write(": ping\n\n"), 15_000);
          if (!finished) await done;
          clearInterval(ping);
          await chain;
          unsubscribe();
        });
      })
  );
}
