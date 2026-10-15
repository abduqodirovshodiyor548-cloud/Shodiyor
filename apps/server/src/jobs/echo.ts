import { setTimeout as sleep } from "node:timers/promises";
import type { JobHandler } from "../queue.ts";

/** Navbatni Claude'siz sinash uchun job: matnni bo'laklab qaytaradi. input: { text, delayMs?, fail? } */
export const echoJob: JobHandler = async ({ job, signal, emit }) => {
  const { text = "", delayMs = 200, fail = false } = job.input as { text?: string; delayMs?: number; fail?: boolean };
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    await sleep(delayMs, undefined, { signal });
    emit({ type: "text_delta", text: word + " " }, { persist: false });
  }
  if (fail) throw new Error("Sinov xatosi (fail: true)");
  emit({ type: "assistant", text, toolUses: [] });
  return text;
};
