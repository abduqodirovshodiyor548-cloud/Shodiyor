import { addDays, isIsoDate, isoWeekday } from "./period.ts";
import type { TaskPlanInput } from "./planning.ts";

// ---------- Tezkor qo'shish sintaksisi (S1-11, Cmd+K) ----------
//
// "Hisobot yozish #ish !3 @ertaga" →
//   { title: "Hisobot yozish", tags: ["ish"], priority: 3, plan: { level: "day", date: <ertaga> } }
//
// Belgilar:  #teg — teg (bir nechta bo'lishi mumkin);  !1 / !2 / !3 — ustuvorlik;
//   @bugun, @ertaga, @indinga, @hafta, @oy, @inbox (rejasiz), @dushanba…@yakshanba (bugundan boshlab
//   eng yaqin shu kun), @YYYY-MM-DD. Belgi bo'lmasa reja — `defaultPlan`.
// Tanilmagan @so'z yoki noto'g'ri !raqam nomga qoladi.

export interface QuickAddResult {
  title: string;
  tags: string[];
  priority: number | null;
  plan: TaskPlanInput | null;
}

const WEEKDAY_WORDS = ["dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba", "yakshanba"];

/** Teg nomida harf, raqam, `_`, `-` va o'zbekcha apostroflar (' ʻ ʼ ‘ ’). */
const TAG_RE = /^#([\p{L}\p{N}_\-'ʻʼ‘’]+)$/u;

function planWord(word: string, today: string): TaskPlanInput | null | undefined {
  const w = word.toLowerCase();
  if (w === "bugun") return { level: "day", date: today };
  if (w === "ertaga") return { level: "day", date: addDays(today, 1) };
  if (w === "indinga") return { level: "day", date: addDays(today, 2) };
  if (w === "hafta") return { level: "week", date: today };
  if (w === "oy") return { level: "month", date: today };
  if (w === "inbox") return null;
  if (isIsoDate(w)) return { level: "day", date: w };
  const day = WEEKDAY_WORDS.indexOf(w);
  if (day >= 0) return { level: "day", date: addDays(today, (day + 1 - isoWeekday(today) + 7) % 7) };
  return undefined;
}

export function parseQuickAdd(
  text: string,
  today: string,
  defaultPlan: TaskPlanInput | null = { level: "day", date: today },
): QuickAddResult {
  const tags: string[] = [];
  let priority: number | null = null;
  let plan: TaskPlanInput | null | undefined;
  const words: string[] = [];

  for (const token of text.trim().split(/\s+/).filter(Boolean)) {
    const tag = TAG_RE.exec(token);
    if (tag) {
      if (!tags.some((t) => t.toLowerCase() === tag[1]!.toLowerCase())) tags.push(tag[1]!);
      continue;
    }
    if (/^![1-3]$/.test(token)) {
      priority = Number(token.slice(1));
      continue;
    }
    if (token.startsWith("@") && token.length > 1) {
      const p = planWord(token.slice(1), today);
      if (p !== undefined) {
        plan = p;
        continue;
      }
    }
    words.push(token);
  }

  return { title: words.join(" "), tags, priority, plan: plan === undefined ? defaultPlan : plan };
}
