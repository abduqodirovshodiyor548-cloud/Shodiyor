import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

/** Loyiha ildizi: pnpm-workspace.yaml joylashgan papka. */
export const ROOT_DIR = findRoot(dirname(fileURLToPath(import.meta.url)));

function findRoot(start: string): string {
  let dir = start;
  while (!existsSync(join(dir, "pnpm-workspace.yaml"))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error("pnpm-workspace.yaml topilmadi — loyiha ildizini aniqlab bo'lmadi");
    dir = parent;
  }
  return dir;
}

/** Ildizga nisbatan yo'lni absolyut qiladi. */
export function fromRoot(p: string): string {
  if (p === "~" || p.startsWith("~/")) return join(homedir(), p.slice(1));
  return isAbsolute(p) ? p : resolve(ROOT_DIR, p);
}

const envFile = join(ROOT_DIR, ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SERVER_PORT: z.coerce.number().int().positive().default(4310),
  WEB_PORT: z.coerce.number().int().positive().default(5173),
  DATABASE_PATH: z.string().min(1).default("data/dashboard.db"),
  /** Claude job ish papkalari. Loyiha ichida bo'lmasligi kerak — aks holda CLAUDE.md va hook'lar job'ga yuklanadi. */
  WORKSPACES_DIR: z
    .string()
    .min(1)
    .default(join(homedir(), ".local", "share", "loiha-dashboard", "workspaces")),
  CLAUDE_BIN: z.string().min(1).default("claude"),
  CLAUDE_MAX_CONCURRENCY: z.coerce.number().int().min(1).max(8).default(2),
  CLAUDE_TIMEOUT_MS: z.coerce.number().int().positive().default(600_000),
  CLAUDE_MODEL: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`.env konfiguratsiyasida xato:\n${issues}`);
}

export const config = {
  env: parsed.data.NODE_ENV,
  serverPort: parsed.data.SERVER_PORT,
  webPort: parsed.data.WEB_PORT,
  databasePath: fromRoot(parsed.data.DATABASE_PATH),
  workspacesDir: fromRoot(parsed.data.WORKSPACES_DIR),
  claude: {
    bin: parsed.data.CLAUDE_BIN,
    maxConcurrency: parsed.data.CLAUDE_MAX_CONCURRENCY,
    timeoutMs: parsed.data.CLAUDE_TIMEOUT_MS,
    model: parsed.data.CLAUDE_MODEL,
  },
} as const;

export type Config = typeof config;
