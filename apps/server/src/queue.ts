import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { and, asc, eq, lte, max, sql } from "drizzle-orm";
import { jobEvents, jobs, type Db, type Job } from "@loiha/db";
import type { JobEventData, JobEventDto, JobStatus } from "@loiha/shared";

export interface JobContext {
  job: Job;
  signal: AbortSignal;
  /** Hodisa chiqarish. `persist: false` — faqat jonli obunachilarga (masalan text_delta). */
  emit(data: JobEventData, opts?: { persist?: boolean }): void;
  /** Job qatorini yangilash (masalan Claude sessiya ID, narx). */
  update(fields: Partial<Pick<Job, "claudeSessionId" | "costUsd">>): void;
}

/** Handler qaytargan qiymat jobs.result ga yoziladi. */
export type JobHandler = (ctx: JobContext) => Promise<string | null | void>;

export class CancelledError extends Error {
  constructor() {
    super("Bekor qilindi");
    this.name = "CancelledError";
  }
}

export interface EnqueueOptions {
  profile?: string;
  maxAttempts?: number;
}

interface QueueOptions {
  concurrency: number;
  timeoutMs: number;
  pollMs?: number;
  /** Qayta urinish oldidan kutish: 5s, 10s, 20s ... */
  backoffMs?: (attempt: number) => number;
}

/**
 * SQLite asosidagi job navbati. Bitta jarayon ichida ishlaydi:
 * navbatdagi job'larni concurrency limiti bilan oladi, retry va bekor qilishni boshqaradi.
 */
export class JobQueue {
  private readonly running = new Map<string, AbortController>();
  private readonly seqs = new Map<string, number>();
  private readonly bus = new EventEmitter().setMaxListeners(0);
  private timer: NodeJS.Timeout | undefined;
  private stopping = false;

  constructor(
    private readonly db: Db,
    private readonly handlers: Record<string, JobHandler>,
    private readonly opts: QueueOptions,
  ) {}

  start(): void {
    // Server o'chib qolganda "running" bo'lib qolgan job'lar
    const orphaned = this.db
      .update(jobs)
      .set({ status: "failed", error: "Server qayta ishga tushdi — job yakunlanmagan", finishedAt: new Date() })
      .where(eq(jobs.status, "running"))
      .returning({ id: jobs.id })
      .all();
    for (const { id } of orphaned)
      this.emit(id, { type: "status", status: "failed", error: "Server qayta ishga tushdi" });

    this.timer = setInterval(() => this.tick(), this.opts.pollMs ?? 1000);
    this.tick();
  }

  async stop(): Promise<void> {
    this.stopping = true;
    clearInterval(this.timer);
    const done = [...this.running.keys()].map((id) => new Promise<void>((r) => this.subscribeOnce(id, r)));
    for (const ac of this.running.values()) ac.abort(new Error("Server to'xtatilmoqda"));
    await Promise.race([Promise.all(done), new Promise((r) => setTimeout(r, 5000))]);
  }

  enqueue(kind: string, input: Record<string, unknown>, opts: EnqueueOptions = {}): Job {
    if (!this.handlers[kind]) throw new Error(`Noma'lum job turi: ${kind}`);
    const job = this.db
      .insert(jobs)
      .values({ id: randomUUID(), kind, input, profile: opts.profile ?? "default", maxAttempts: opts.maxAttempts ?? 1 })
      .returning()
      .get();
    this.emit(job.id, { type: "status", status: "queued" });
    queueMicrotask(() => this.tick());
    return job;
  }

  /** true — bekor qilish qabul qilindi. */
  cancel(id: string): boolean {
    const queued = this.db
      .update(jobs)
      .set({ status: "cancelled", finishedAt: new Date(), cancelRequested: true })
      .where(and(eq(jobs.id, id), eq(jobs.status, "queued")))
      .returning({ id: jobs.id })
      .get();
    if (queued) {
      this.emit(id, { type: "status", status: "cancelled" });
      return true;
    }
    const ac = this.running.get(id);
    if (!ac) return false;
    this.db.update(jobs).set({ cancelRequested: true }).where(eq(jobs.id, id)).run();
    ac.abort(new CancelledError());
    return true;
  }

  get stats() {
    return { running: this.running.size, concurrency: this.opts.concurrency };
  }

  /** Job hodisalariga obuna. Qaytgan funksiya obunani bekor qiladi. */
  subscribe(id: string, listener: (e: JobEventDto) => void): () => void {
    this.bus.on(id, listener);
    return () => this.bus.off(id, listener);
  }

  private subscribeOnce(id: string, onFinish: () => void): void {
    const off = this.subscribe(id, (e) => {
      if (e.data.type === "status" && e.data.status !== "running" && e.data.status !== "queued") {
        off();
        onFinish();
      }
    });
  }

  private emit(jobId: string, data: JobEventData, persist = true): void {
    let seq: number | null = null;
    const createdAt = Date.now();
    if (persist) {
      seq = this.nextSeq(jobId);
      this.db
        .insert(jobEvents)
        .values({ jobId, seq, type: data.type, data, createdAt: new Date(createdAt) })
        .run();
    }
    this.bus.emit(jobId, { seq, createdAt, data } satisfies JobEventDto);
  }

  private nextSeq(jobId: string): number {
    let seq = this.seqs.get(jobId);
    if (seq === undefined) {
      const row = this.db
        .select({ v: max(jobEvents.seq) })
        .from(jobEvents)
        .where(eq(jobEvents.jobId, jobId))
        .get();
      seq = row?.v ?? 0;
    }
    seq += 1;
    this.seqs.set(jobId, seq);
    return seq;
  }

  private tick(): void {
    if (this.stopping) return;
    while (this.running.size < this.opts.concurrency) {
      const job = this.claimNext();
      if (!job) break;
      void this.run(job);
    }
  }

  private claimNext(): Job | undefined {
    return this.db.transaction((tx) => {
      const next = tx
        .select({ id: jobs.id })
        .from(jobs)
        .where(and(eq(jobs.status, "queued"), lte(jobs.runAfter, new Date())))
        .orderBy(asc(jobs.runAfter), asc(jobs.createdAt))
        .limit(1)
        .get();
      if (!next) return undefined;
      return tx
        .update(jobs)
        .set({ status: "running", attempts: sql`${jobs.attempts} + 1`, startedAt: new Date(), error: null })
        .where(and(eq(jobs.id, next.id), eq(jobs.status, "queued")))
        .returning()
        .get();
    });
  }

  private async run(job: Job): Promise<void> {
    const ac = new AbortController();
    this.running.set(job.id, ac);
    const timeout = setTimeout(
      () => ac.abort(new Error(`Vaqt tugadi (${Math.round(this.opts.timeoutMs / 1000)}s)`)),
      this.opts.timeoutMs,
    );
    this.emit(job.id, { type: "status", status: "running" });

    const ctx: JobContext = {
      job,
      signal: ac.signal,
      emit: (data, o) => this.emit(job.id, data, o?.persist ?? true),
      update: (fields) => this.db.update(jobs).set(fields).where(eq(jobs.id, job.id)).run(),
    };

    let status: JobStatus;
    let error: string | undefined;
    let result: string | null = null;
    try {
      const handler = this.handlers[job.kind];
      if (!handler) throw new Error(`Handler topilmadi: ${job.kind}`);
      result = (await handler(ctx)) ?? null;
      if (ac.signal.aborted) throw ac.signal.reason;
      status = "succeeded";
    } catch (err) {
      const reason = ac.signal.aborted ? ac.signal.reason : err;
      error = reason instanceof Error ? reason.message : String(reason);
      if (reason instanceof CancelledError) status = "cancelled";
      else if (job.attempts < job.maxAttempts && !this.stopping) status = "queued";
      else status = "failed";
    } finally {
      clearTimeout(timeout);
      this.running.delete(job.id);
    }

    if (status === "queued") {
      const delay = (this.opts.backoffMs ?? ((n) => 5000 * 2 ** (n - 1)))(job.attempts);
      this.db
        .update(jobs)
        .set({ status, error, runAfter: new Date(Date.now() + delay) })
        .where(eq(jobs.id, job.id))
        .run();
      this.emit(job.id, {
        type: "log",
        level: "warn",
        message: `Xato: ${error}. ${delay / 1000}s dan keyin qayta urinish`,
      });
    } else {
      this.db
        .update(jobs)
        .set({ status, error: error ?? null, result, finishedAt: new Date() })
        .where(eq(jobs.id, job.id))
        .run();
      this.seqs.delete(job.id);
    }
    this.emit(job.id, { type: "status", status, ...(error ? { error } : {}) });
    this.tick();
  }
}
