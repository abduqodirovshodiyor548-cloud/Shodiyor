import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { config } from "@loiha/config";
import { createClaudeJobSchema } from "@loiha/shared";
import { runClaude } from "../claude/runner.ts";
import type { JobHandler } from "../queue.ts";

export const claudeJob: JobHandler = async ({ job, signal, emit, update }) => {
  const input = createClaudeJobSchema.parse(job.input);
  const cwd = join(config.workspacesDir, job.id);
  mkdirSync(cwd, { recursive: true });

  const sessionId = job.claudeSessionId ?? randomUUID();
  if (!input.resumeSessionId) update({ claudeSessionId: sessionId });

  const res = await runClaude({
    prompt: input.prompt,
    profile: input.profile,
    cwd,
    sessionId,
    resumeSessionId: input.resumeSessionId,
    signal,
    onEvent: (data, persist) => {
      if (data.type === "init" && data.sessionId) update({ claudeSessionId: data.sessionId });
      if (data.type === "result" && data.costUsd !== null) update({ costUsd: data.costUsd });
      emit(data, { persist });
    },
  });
  return res.text;
};
