import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export const SERVER_NAME = "dashboard";

/**
 * dashboard-mcp: Claude'ga dashboard ma'lumotlarini tool sifatida ochadi.
 * S0 da faqat `ping`; maqsad/vazifa tool'lari S1 da qo'shiladi.
 */
export function createDashboardMcpServer(): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: "0.1.0" });

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

  return server;
}
