import { execFile, spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { promisify } from "node:util";
import { config } from "@loiha/config";
import type { ClaudeProfile, JobEventData } from "@loiha/shared";
import { getProfile, writeMcpConfig } from "./profiles.ts";
import { parseStreamMessage } from "./stream.ts";

export interface ClaudeInfo {
  bin: string;
  available: boolean;
  version: string | null;
  error?: string;
}

let info: ClaudeInfo = { bin: config.claude.bin, available: false, version: null, error: "Hali tekshirilmagan" };

export async function detectClaude(): Promise<ClaudeInfo> {
  try {
    const { stdout } = await promisify(execFile)(config.claude.bin, ["--version"], {
      timeout: 15_000,
      env: childEnv(),
    });
    info = { bin: config.claude.bin, available: true, version: stdout.trim() };
  } catch (err) {
    info = { bin: config.claude.bin, available: false, version: null, error: (err as Error).message };
  }
  return info;
}

export const getClaudeInfo = () => info;

export interface RunClaudeOptions {
  prompt: string;
  profile: ClaudeProfile;
  /** Ish papkasi (loyihadan tashqarida, Q-012). */
  cwd: string;
  /** Yangi sessiya uchun ID; `resumeSessionId` berilsa e'tiborsiz. */
  sessionId: string;
  resumeSessionId?: string;
  signal: AbortSignal;
  onEvent: (data: JobEventData, persist: boolean) => void;
}

export interface RunClaudeResult {
  text: string;
  sessionId: string | null;
  costUsd: number | null;
}

export function buildClaudeArgs(opts: Omit<RunClaudeOptions, "signal" | "onEvent" | "prompt">, mcpConfigPath: string) {
  const spec = getProfile(opts.profile);
  const args = [
    "-p",
    "--output-format",
    "stream-json",
    "--verbose",
    "--include-partial-messages",
    "--strict-mcp-config",
    "--mcp-config",
    mcpConfigPath,
    "--tools",
    spec.builtinTools.join(","),
    "--permission-mode",
    "dontAsk",
  ];
  if (spec.allowedTools.length) args.push("--allowedTools", spec.allowedTools.join(","));
  if (spec.appendSystemPrompt) args.push("--append-system-prompt", spec.appendSystemPrompt);
  if (config.claude.model) args.push("--model", config.claude.model);
  if (opts.resumeSessionId) args.push("--resume", opts.resumeSessionId);
  else args.push("--session-id", opts.sessionId);
  return args;
}

/** Claude CLI'ni headless rejimda ishga tushiradi va stream-json chiqishini hodisalarga aylantiradi. */
export function runClaude(opts: RunClaudeOptions): Promise<RunClaudeResult> {
  const mcpConfigPath = writeMcpConfig(opts.cwd, getProfile(opts.profile));
  const args = buildClaudeArgs(opts, mcpConfigPath);

  return new Promise((resolve, reject) => {
    if (opts.signal.aborted) return reject(opts.signal.reason);

    const child = spawn(config.claude.bin, args, { cwd: opts.cwd, env: childEnv(), stdio: ["pipe", "pipe", "pipe"] });
    let result: Extract<JobEventData, { type: "result" }> | undefined;
    let sessionId: string | null = opts.resumeSessionId ?? opts.sessionId;
    let stderrTail = "";
    let killTimer: NodeJS.Timeout | undefined;

    const onAbort = () => {
      child.kill("SIGTERM");
      killTimer = setTimeout(() => child.kill("SIGKILL"), 3000);
    };
    opts.signal.addEventListener("abort", onAbort, { once: true });

    child.stdin.end(opts.prompt);

    createInterface({ input: child.stdout }).on("line", (line) => {
      if (!line.trim()) return;
      let msg: unknown;
      try {
        msg = JSON.parse(line);
      } catch {
        opts.onEvent({ type: "log", level: "warn", message: `JSON bo'lmagan qator: ${line.slice(0, 500)}` }, true);
        return;
      }
      for (const [ev, persist] of parseStreamMessage(msg)) {
        if (ev.type === "init") sessionId = ev.sessionId || sessionId;
        if (ev.type === "result") result = ev;
        opts.onEvent(ev, persist);
      }
    });

    createInterface({ input: child.stderr }).on("line", (line) => {
      stderrTail = (stderrTail + line + "\n").slice(-4000);
      if (line.trim()) opts.onEvent({ type: "log", level: "warn", message: line }, true);
    });

    child.on("error", (err) => {
      opts.signal.removeEventListener("abort", onAbort);
      reject(new Error(`Claude CLI ishga tushmadi (${config.claude.bin}): ${err.message}`));
    });

    child.on("close", (code, sig) => {
      clearTimeout(killTimer);
      opts.signal.removeEventListener("abort", onAbort);
      if (opts.signal.aborted) return reject(opts.signal.reason);
      if (result?.isError) {
        const authHint = /401|authenticate|oauth/i.test(result.text)
          ? " — Claude CLI login muddati tugagan: terminalda `claude` ni ishga tushirib, `/login` qiling."
          : "";
        return reject(new Error((result.text || "Claude xato bilan yakunladi") + authHint));
      }
      if (!result) {
        const why = sig ? `signal ${sig}` : `kod ${code}`;
        return reject(new Error(`Claude natijasiz yakunladi (${why}). ${stderrTail.trim().slice(-500)}`.trim()));
      }
      resolve({ text: result.text, sessionId: result.sessionId ?? sessionId, costUsd: result.costUsd });
    });
  });
}

/** Ichma-ich Claude Code sessiyasi sifatida aniqlanmaslik uchun sessiya o'zgaruvchilarini olib tashlaydi. */
function childEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (k === "CLAUDECODE" || k.startsWith("CLAUDE_CODE_")) delete env[k];
  return env;
}
