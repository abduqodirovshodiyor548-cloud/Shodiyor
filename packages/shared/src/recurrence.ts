import { z } from "zod";
import { addDays, diffDays, isIsoDate, isoWeekday } from "./period.ts";

// ---------- Takrorlanuvchi vazifalar: qoida va sanalar ----------
//
// Qoida sanalari `YYYY-MM-DD` (Q-022). Takrorlanish `start` sanasidan boshlab sanaladi:
// - daily   — har `interval` kunda;
// - weekly  — har `interval` haftada, `weekdays` kunlarida (1 — dushanba … 7 — yakshanba, ISO hafta);
// - monthly — har `interval` oyda, `monthDays` kunlarida (1…31; -1 — oyning oxirgi kuni).
//   Oyda bo'lmagan kun (masalan 31) o'sha oyda o'tkazib yuboriladi — boshqa kunga surilmaydi.

const isoDate = z.string().refine(isIsoDate, "Noto'g'ri sana (YYYY-MM-DD)");
const interval = z.number().int().min(1).max(365).default(1);

export const recurrenceRuleSchema = z.discriminatedUnion("freq", [
  z.object({ freq: z.literal("daily"), interval }),
  z.object({
    freq: z.literal("weekly"),
    interval,
    weekdays: z.array(z.number().int().min(1).max(7)).min(1).max(7),
  }),
  z.object({
    freq: z.literal("monthly"),
    interval,
    monthDays: z
      .array(
        z
          .number()
          .int()
          .min(-1)
          .max(31)
          .refine((d) => d !== 0, "Oy kuni 0 bo'lishi mumkin emas"),
      )
      .min(1)
      .max(31),
  }),
]);
export type RecurrenceRule = z.infer<typeof recurrenceRuleSchema>;

/** Takrorlanish seriyasi: qoida va amal qilish oralig'i (`end` — ixtiyoriy, kiradi). */
export const recurrenceSchema = z
  .object({ rule: recurrenceRuleSchema, start: isoDate, end: isoDate.nullable().default(null) })
  .refine((r) => r.end === null || r.start <= r.end, { message: "Tugash sanasi boshlanishdan oldin", path: ["end"] });
export type Recurrence = z.infer<typeof recurrenceSchema>;

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** `date` qoida bo'yicha takrorlanish kuni ekanini tekshiradi (`start` dan oldingi sanalar — yo'q). */
export function occursOn(rule: RecurrenceRule, start: string, date: string): boolean {
  const days = diffDays(start, date);
  if (days < 0) return false;
  switch (rule.freq) {
    case "daily":
      return days % rule.interval === 0;
    case "weekly": {
      if (!rule.weekdays.includes(isoWeekday(date))) return false;
      // Haftalar `start` haftasining dushanbasidan sanaladi.
      const weekStart = addDays(start, 1 - isoWeekday(start));
      return Math.floor(diffDays(weekStart, date) / 7) % rule.interval === 0;
    }
    case "monthly": {
      const [sy, sm] = [Number(start.slice(0, 4)), Number(start.slice(5, 7))];
      const [y, m, d] = [Number(date.slice(0, 4)), Number(date.slice(5, 7)), Number(date.slice(8, 10))];
      if (((y - sy) * 12 + (m - sm)) % rule.interval !== 0) return false;
      const last = daysInMonth(y, m);
      return rule.monthDays.some((md) => (md === -1 ? d === last : d === md));
    }
  }
}

/** `from`…`to` (ikkalasi ham kiradi) oralig'idagi takrorlanish sanalari, `recurrence` oralig'i bilan kesishgan holda. */
export function occurrencesBetween(recurrence: Recurrence, from: string, to: string): string[] {
  const first = from > recurrence.start ? from : recurrence.start;
  const last = recurrence.end !== null && recurrence.end < to ? recurrence.end : to;
  const result: string[] = [];
  for (let date = first; date <= last; date = addDays(date, 1)) {
    if (occursOn(recurrence.rule, recurrence.start, date)) result.push(date);
  }
  return result;
}

const WEEKDAY_NAMES = ["dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba", "yakshanba"];

/** Qoidaning qisqa o'zbekcha tavsifi (UI va MCP uchun). */
export function describeRecurrence(rule: RecurrenceRule): string {
  const every = (n: number, unit: string) => (n === 1 ? `Har ${unit}` : `Har ${n} ${unit}da`);
  switch (rule.freq) {
    case "daily":
      return rule.interval === 1 ? "Har kuni" : `Har ${rule.interval} kunda`;
    case "weekly": {
      const days = [...new Set(rule.weekdays)].sort((a, b) => a - b);
      const names =
        days.length === 5 && days.every((d, i) => d === i + 1)
          ? "ish kunlari"
          : days.map((d) => WEEKDAY_NAMES[d - 1]).join(", ");
      return `${every(rule.interval, "hafta")}: ${names}`;
    }
    case "monthly": {
      const days = [...new Set(rule.monthDays)]
        .sort((a, b) => (a === -1 ? 32 : a) - (b === -1 ? 32 : b))
        .map((d) => (d === -1 ? "oxirgi kuni" : `${d}-kuni`));
      return `${every(rule.interval, "oy")}: ${days.join(", ")}`;
    }
  }
}
