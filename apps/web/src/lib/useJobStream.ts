import { useEffect, useReducer } from "react";
import { TERMINAL_JOB_STATUSES, type JobEventDto, type JobStatus, type ToolUse } from "@loiha/shared";

export type StreamBlock =
  | { kind: "text"; text: string; final: boolean }
  | { kind: "tool_use"; tool: ToolUse }
  | { kind: "tool_result"; toolUseId: string; content: string; isError: boolean }
  | { kind: "log"; level: string; message: string };

export interface JobStreamState {
  status: JobStatus | null;
  error: string | null;
  blocks: StreamBlock[];
  meta: { model: string | null; tools: string[]; mcpServers: { name: string; status: string }[] } | null;
  result: { costUsd: number | null; durationMs: number | null; numTurns: number | null } | null;
  connected: boolean;
}

const initial: JobStreamState = { status: null, error: null, blocks: [], meta: null, result: null, connected: false };

type Action = { type: "reset" } | { type: "connected"; value: boolean } | { type: "event"; e: JobEventDto };

function reducer(s: JobStreamState, a: Action): JobStreamState {
  if (a.type === "reset") return initial;
  if (a.type === "connected") return { ...s, connected: a.value };
  const d = a.e.data;
  const last = s.blocks.at(-1);
  switch (d.type) {
    case "status":
      return { ...s, status: d.status, error: d.error ?? (d.status === "running" ? null : s.error) };
    case "init":
      return { ...s, meta: { model: d.model, tools: d.tools, mcpServers: d.mcpServers } };
    case "text_delta":
      // Jonli tokenlar oxirgi tugallanmagan matn blokiga qo'shiladi
      if (last?.kind === "text" && !last.final) {
        return { ...s, blocks: [...s.blocks.slice(0, -1), { ...last, text: last.text + d.text }] };
      }
      return { ...s, blocks: [...s.blocks, { kind: "text", text: d.text, final: false }] };
    case "assistant": {
      // To'liq xabar jonli qoralamani almashtiradi
      const base = last?.kind === "text" && !last.final ? s.blocks.slice(0, -1) : s.blocks;
      const add: StreamBlock[] = [];
      if (d.text) add.push({ kind: "text", text: d.text, final: true });
      for (const tool of d.toolUses) add.push({ kind: "tool_use", tool });
      return { ...s, blocks: [...base, ...add] };
    }
    case "tool_result":
      return {
        ...s,
        blocks: [...s.blocks, { kind: "tool_result", toolUseId: d.toolUseId, content: d.content, isError: d.isError }],
      };
    case "log":
      return { ...s, blocks: [...s.blocks, { kind: "log", level: d.level, message: d.message }] };
    case "result":
      return { ...s, result: { costUsd: d.costUsd, durationMs: d.durationMs, numTurns: d.numTurns } };
  }
}

/** Job hodisalarini SSE orqali tinglaydi. EventSource uzilsa Last-Event-ID bilan o'zi qayta ulanadi. */
export function useJobStream(jobId: string | null, onFinish?: () => void): JobStreamState {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    dispatch({ type: "reset" });
    if (!jobId) return;
    const es = new EventSource(`/api/jobs/${jobId}/events`);
    es.onopen = () => dispatch({ type: "connected", value: true });
    es.onmessage = (m) => {
      const e = JSON.parse(m.data) as JobEventDto;
      dispatch({ type: "event", e });
      if (e.data.type === "status" && TERMINAL_JOB_STATUSES.includes(e.data.status)) {
        es.close();
        dispatch({ type: "connected", value: false });
        onFinish?.();
      }
    };
    es.onerror = () => dispatch({ type: "connected", value: false });
    return () => es.close();
    // onFinish ataylab bog'liqlikda emas — har renderda yangi funksiya bo'lishi mumkin
  }, [jobId]);

  return state;
}
