import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createDashboardMcpServer } from "./index.ts";

// Claude CLI bu faylni stdio MCP server sifatida ishga tushiradi (apps/server/src/claude/profiles.ts).
const server = createDashboardMcpServer();
await server.connect(new StdioServerTransport());
