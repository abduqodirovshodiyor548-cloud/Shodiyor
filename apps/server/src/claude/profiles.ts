import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT_DIR } from "@loiha/config";
import type { ClaudeProfile } from "@loiha/shared";

interface McpServerSpec {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

/**
 * Vazifa turiga qarab Claude'ga beriladigan imkoniyatlar (Q-003).
 * Har bir profil minimal: faqat kerakli MCP serverlar va tool'lar.
 */
export interface ProfileSpec {
  mcpServers: Record<string, McpServerSpec>;
  /** Ichki (built-in) tool'lar ro'yxati; bo'sh — hammasi o'chirilgan. */
  builtinTools: string[];
  /** Ruxsat so'ramasdan ishlatiladigan tool'lar (`mcp__server` — serverning barcha tool'lari). */
  allowedTools: string[];
  appendSystemPrompt?: string;
}

const dashboardMcp: McpServerSpec = {
  command: join(ROOT_DIR, "node_modules", ".bin", "tsx"),
  args: [join(ROOT_DIR, "packages", "mcp", "src", "bin.ts")],
};

const BASE_PROMPT =
  "Sen foydalanuvchining shaxsiy lokal dashboard assistentisan. Odatda o'zbek tilida (lotin), qisqa va aniq javob ber. " +
  "Dashboard ma'lumotlari bilan faqat `dashboard` MCP tool'lari orqali ishlaysan. " +
  // S1-12: maqsad va vazifa tool'lari.
  "Maqsad va vazifalar: list_tasks, list_goals, get_goal_tree (o'qish), create_task, update_task, update_progress (yozish). " +
  "Davrlar uchun nisbiy nomlardan foydalan (today, this_week, this_month …) — bugungi sana tool javobidagi `today` maydonida. " +
  "Vazifani o'zgartirishdan oldin uning id'sini ro'yxat tool'lari orqali aniqla; foydalanuvchiga id emas, nomlarni ko'rsat.";

const PROFILES: Record<ClaudeProfile, ProfileSpec> = {
  chat: {
    mcpServers: { dashboard: dashboardMcp },
    builtinTools: [],
    allowedTools: ["mcp__dashboard"],
    appendSystemPrompt: BASE_PROMPT,
  },
};

export function getProfile(name: ClaudeProfile): ProfileSpec {
  return PROFILES[name];
}

/** Job ish papkasiga MCP konfiguratsiyasini yozadi va yo'lini qaytaradi. */
export function writeMcpConfig(dir: string, spec: ProfileSpec): string {
  const file = join(dir, "mcp.json");
  writeFileSync(file, JSON.stringify({ mcpServers: spec.mcpServers }, null, 2));
  return file;
}
