import { periodOf, type GoalLevel, type GoalStatus, type Period } from "@loiha/shared";

export const MONTHS = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentyabr",
  "Oktyabr",
  "Noyabr",
  "Dekabr",
];

export const LEVEL_LABEL: Record<GoalLevel, string> = {
  year: "Yillik",
  quarter: "Kvartal",
  month: "Oylik",
  week: "Haftalik",
};

export const STATUS_LABEL: Record<GoalStatus, { label: string; tone: "info" | "success" | "neutral" }> = {
  active: { label: "faol", tone: "info" },
  done: { label: "bajarildi", tone: "success" },
  dropped: { label: "voz kechildi", tone: "neutral" },
};

const month = (date: string) => MONTHS[Number(date.slice(5, 7)) - 1]!;
const quarterNo = (date: string) => Math.floor((Number(date.slice(5, 7)) - 1) / 3) + 1;

/** Davrning o'qiladigan nomi: "2026-yil", "4-chorak", "Oktyabr", "19–25 okt". */
export function periodTitle(p: Pick<Period, "level" | "start" | "end">, withYear = false): string {
  const y = withYear ? ` ${p.start.slice(0, 4)}` : "";
  switch (p.level) {
    case "year":
      return `${p.start.slice(0, 4)}-yil`;
    case "quarter":
      return `${quarterNo(p.start)}-chorak${y}`;
    case "month":
      return `${month(p.start)}${y}`;
    case "week":
      return `${Number(p.start.slice(8))} ${month(p.start).slice(0, 3).toLowerCase()} – ${Number(p.end.slice(8))} ${month(p.end).slice(0, 3).toLowerCase()}`;
    case "day":
      return `${Number(p.start.slice(8))} ${month(p.start).toLowerCase()}`;
  }
}

/** Kvartal oylarining qisqa oralig'i: "Okt–Dek". */
export function quarterMonths(start: string): string {
  const m = Number(start.slice(5, 7));
  return `${MONTHS[m - 1]!.slice(0, 3)}–${MONTHS[m + 1]!.slice(0, 3)}`;
}

export const goalPeriod = (g: { level: GoalLevel; periodStart: string; periodEnd: string }): Period => ({
  level: g.level,
  start: g.periodStart,
  end: g.periodEnd,
});

export const isCurrent = (p: Period, today: string) => periodOf(p.level, today).start === p.start;
