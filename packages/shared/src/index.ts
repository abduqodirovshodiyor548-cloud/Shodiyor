import { z } from "zod";

// ---------- Job'lar ----------

export const JOB_STATUSES = ["queued", "running", "succeeded", "failed", "cancelled"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];
export const TERMINAL_JOB_STATUSES: readonly JobStatus[] = ["succeeded", "failed", "cancelled"];

/** Claude CLI profillari: har biri o'z MCP serverlari va ruxsat etilgan tool'lariga ega. */
export const CLAUDE_PROFILES = ["chat"] as const;
export type ClaudeProfile = (typeof CLAUDE_PROFILES)[number];

export const createClaudeJobSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt bo'sh").max(100_000),
  profile: z.enum(CLAUDE_PROFILES).default("chat"),
  /** Avvalgi job'ning Claude sessiyasini davom ettirish. */
  resumeSessionId: z.uuid().optional(),
});
export type CreateClaudeJobInput = z.infer<typeof createClaudeJobSchema>;

export interface JobDto {
  id: string;
  kind: string;
  profile: string;
  status: JobStatus;
  input: Record<string, unknown>;
  result: string | null;
  error: string | null;
  attempts: number;
  maxAttempts: number;
  claudeSessionId: string | null;
  costUsd: number | null;
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;
}

// ---------- Job hodisalari (SSE orqali uzatiladi) ----------

export interface ToolUse {
  id: string;
  name: string;
  input: unknown;
}

export type JobEventData =
  | { type: "status"; status: JobStatus; error?: string }
  | { type: "log"; level: "info" | "warn" | "error"; message: string }
  | {
      type: "init";
      sessionId: string;
      model: string | null;
      tools: string[];
      mcpServers: { name: string; status: string }[];
    }
  | { type: "text_delta"; text: string }
  | { type: "assistant"; text: string; toolUses: ToolUse[] }
  | { type: "tool_result"; toolUseId: string; content: string; isError: boolean }
  | {
      type: "result";
      text: string;
      isError: boolean;
      costUsd: number | null;
      durationMs: number | null;
      numTurns: number | null;
      sessionId: string | null;
    };

export type JobEventType = JobEventData["type"];

/** SSE xabari. `seq` — DB'da saqlangan hodisa tartib raqami; `null` — faqat jonli (masalan text_delta). */
export interface JobEventDto {
  seq: number | null;
  createdAt: number;
  data: JobEventData;
}

export * from "./period.ts";
export * from "./progress.ts";
