import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getDb, type Db } from "@loiha/db";
import { registerPlanningTools } from "./planning-tools.ts";

export const SERVER_NAME = "dashboard";

/**
 * dashboard-mcp: Claude'ga dashboard ma'lumotlarini tool sifatida ochadi.
 * S0: `ping`. S1-12: maqsad va vazifa tool'lari (planning-tools.ts).
 * `db` berilmasa — umumiy SQLite ulanishi (server bilan bir xil fayl, WAL rejimida parallel ishlaydi).
 */
export function createDashboardMcpServer(db: Db = getDb(), today?: () => string): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: "0.2.0" });

  server.registerTool(
    "ping",
    {
      title: "Ping",
      description: "Dashboard MCP server ishlayotganini tekshiradi. Server vaqti va ixtiyoriy xabarni qaytaradi.",
      inputSchema: { message: z.string().optional().describe("Qaytariladigan ixtiyoriy matn") },
    },
    async ({ message }) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify({ pong: true, serverTime: new Date().toISOString(), echo: message ?? null }),
        },
      ],
    }),
  );

  registerPlanningTools(server, db, today);
  return server;
}
