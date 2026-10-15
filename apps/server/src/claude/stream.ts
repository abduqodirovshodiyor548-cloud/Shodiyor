import type { JobEventData, ToolUse } from "@loiha/shared";

/**
 * Claude CLI `--output-format stream-json` xabarlarini ichki hodisalarga aylantiradi.
 * Format CLI versiyalari orasida o'zgarishi mumkin — barcha bog'liqlik shu faylda (Q-003).
 *
 * Qaytadi: [hodisa, persist] juftliklari. Tanilmagan xabarlar e'tiborsiz qoldiriladi.
 */
export function parseStreamMessage(msg: unknown): Array<[JobEventData, boolean]> {
  if (!isObj(msg)) return [];

  switch (msg.type) {
    case "system": {
      if (msg.subtype !== "init") return [];
      const servers = Array.isArray(msg.mcp_servers) ? msg.mcp_servers : [];
      return [
        [
          {
            type: "init",
            sessionId: str(msg.session_id),
            model: typeof msg.model === "string" ? msg.model : null,
            tools: Array.isArray(msg.tools) ? msg.tools.filter((t): t is string => typeof t === "string") : [],
            mcpServers: servers.filter(isObj).map((s) => ({ name: str(s.name), status: str(s.status) })),
          },
          true,
        ],
      ];
    }

    case "stream_event": {
      const ev = msg.event;
      if (isObj(ev) && ev.type === "content_block_delta" && isObj(ev.delta) && ev.delta.type === "text_delta") {
        return [[{ type: "text_delta", text: str(ev.delta.text) }, false]];
      }
      return [];
    }

    case "assistant": {
      const content = contentOf(msg);
      const text = content
        .filter((b) => b.type === "text")
        .map((b) => str(b.text))
        .join("");
      const toolUses: ToolUse[] = content
        .filter((b) => b.type === "tool_use")
        .map((b) => ({ id: str(b.id), name: str(b.name), input: b.input ?? null }));
      if (!text && !toolUses.length) return [];
      return [[{ type: "assistant", text, toolUses }, true]];
    }

    case "user": {
      return contentOf(msg)
        .filter((b) => b.type === "tool_result")
        .map((b): [JobEventData, boolean] => [
          {
            type: "tool_result",
            toolUseId: str(b.tool_use_id),
            content: stringifyContent(b.content),
            isError: b.is_error === true,
          },
          true,
        ]);
    }

    case "result": {
      return [
        [
          {
            type: "result",
            text: typeof msg.result === "string" ? msg.result : "",
            isError: msg.is_error === true || (typeof msg.subtype === "string" && msg.subtype !== "success"),
            costUsd: num(msg.total_cost_usd),
            durationMs: num(msg.duration_ms),
            numTurns: num(msg.num_turns),
            sessionId: typeof msg.session_id === "string" ? msg.session_id : null,
          },
          true,
        ],
      ];
    }

    default:
      return [];
  }
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

function contentOf(msg: Obj): Obj[] {
  const m = msg.message;
  return isObj(m) && Array.isArray(m.content) ? m.content.filter(isObj) : [];
}

function stringifyContent(c: unknown): string {
  const s =
    typeof c === "string"
      ? c
      : Array.isArray(c)
        ? c.map((p) => (isObj(p) && typeof p.text === "string" ? p.text : JSON.stringify(p))).join("\n")
        : JSON.stringify(c ?? "");
  return s.length > 20_000 ? s.slice(0, 20_000) + "\n…(qisqartirildi)" : s;
}
