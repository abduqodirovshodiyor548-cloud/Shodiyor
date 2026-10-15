import { serve } from "@hono/node-server";
import { config } from "@loiha/config";
import { getDb } from "@loiha/db";
import { createApp } from "./app.ts";
import { claudeJob } from "./jobs/claude.ts";
import { echoJob } from "./jobs/echo.ts";
import { JobQueue } from "./queue.ts";
import { detectClaude, getClaudeInfo } from "./claude/runner.ts";

const db = getDb();
const queue = new JobQueue(
  db,
  { claude: claudeJob, echo: echoJob },
  { concurrency: config.claude.maxConcurrency, timeoutMs: config.claude.timeoutMs },
);
queue.start();
void detectClaude();

const app = createApp({ db, queue, claude: getClaudeInfo });
const server = serve({ fetch: app.fetch, port: config.serverPort, hostname: "127.0.0.1" }, (info) => {
  console.log(`Server: http://localhost:${info.port}  (DB: ${config.databasePath})`);
});

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal}: to'xtatilmoqda…`);
  await queue.stop();
  server.close();
  db.$client.close();
  process.exit(0);
}
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
