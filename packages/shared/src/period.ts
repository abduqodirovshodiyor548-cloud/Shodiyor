// ---------- Davrlar: yil / kvartal / oy / hafta / kun ----------
//
// Barcha sanalar `YYYY-MM-DD` — vaqt zonasisiz lokal kalendar kuni (Q-022).
// Arifmetika UTC'da bajariladi, shuning uchun DST va soat mintaqasi natijaga ta'sir qilmaydi.
// Hafta — ISO 8601: dushanbadan yakshanbagacha; 1-hafta — yilning birinchi payshanbasini o'z ichiga olgan hafta.

export const PERIOD_LEVELS = ["year", "quarter", "month", "week", "day"] as const;
export type PeriodLevel = (typeof PERIOD_LEVELS)[number];

/** Davr: `start`…`end`, ikkalasi ham kiradi. */
export interface Period {
  level: PeriodLevel;
  start: string;
  end: string;
}

const DAY_MS = 86_400_000;
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Haqiqiy kalendar sanasi ekanini tekshiradi (masalan `2026-02-30` — yo'q). */
export function isIsoDate(value: string): boolean {
  const m = ISO_DATE_RE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

function toUtc(date: string): Date {
  if (!isIsoDate(date)) throw new RangeError(`Noto'g'ri sana: ${date}`);
  return new Date(`${date}T00:00:00Z`);
}

function fromUtc(dt: Date): string {
  return dt.toISOString().slice(0, 10);
}

function ymd(y: number, m: number, d: number): string {
  return fromUtc(new Date(Date.UTC(y, m - 1, d)));
}

/** Berilgan vaqtning lokal kalendar kuni. */
export function toLocalIsoDate(now: Date = new Date()): string {
  return ymd(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function addDays(date: string, days: number): string {
  return fromUtc(new Date(toUtc(date).getTime() + days * DAY_MS));
}

/** Ikki sana orasidagi kunlar soni (`to - from`). */
export function diffDays(from: string, to: string): number {
  return Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / DAY_MS);
}

/** ISO hafta kuni: 1 — dushanba … 7 — yakshanba. */
export function isoWeekday(date: string): number {
  return toUtc(date).getUTCDay() || 7;
}

/** ISO hafta-yil va hafta raqami (1…53). Masalan `2027-01-01` → `{ year: 2026, week: 53 }`. */
export function isoWeek(date: string): { year: number; week: number } {
  const thursday = addDays(date, 4 - isoWeekday(date));
  const year = Number(thursday.slice(0, 4));
  const week = Math.floor(diffDays(`${year}-01-01`, thursday) / 7) + 1;
  return { year, week };
}

/** ISO hafta-yilining 1-haftasi dushanbasi. */
function isoWeekYearStart(year: number): string {
  const jan4 = `${year}-01-04`;
  return addDays(jan4, 1 - isoWeekday(jan4));
}

/** `date` ni o'z ichiga olgan `level` davri. */
export function periodOf(level: PeriodLevel, date: string): Period {
  const dt = toUtc(date);
  const y = dt.getUTCFullYear();
  const m = dt.getUTCMonth() + 1;
  switch (level) {
    case "year":
      return { level, start: ymd(y, 1, 1), end: ymd(y, 12, 31) };
    case "quarter": {
      const qm = m - ((m - 1) % 3);
      return { level, start: ymd(y, qm, 1), end: ymd(y, qm + 3, 0) };
    }
    case "month":
      return { level, start: ymd(y, m, 1), end: ymd(y, m + 1, 0) };
    case "week": {
      const start = addDays(date, 1 - isoWeekday(date));
      return { level, start, end: addDays(start, 6) };
    }
    case "day":
      return { level, start: date, end: date };
  }
}

/** `date` `level` davrining birinchi kunimi (masalan haftalik `plan_start` dushanba bo'lishi shart). */
export function isPeriodStart(level: PeriodLevel, date: string): boolean {
  return isIsoDate(date) && periodOf(level, date).start === date;
}

/** Davrni `n` ta oldinga (manfiy — orqaga) suradi. */
export function shiftPeriod(period: Period, n: number): Period {
  const { level, start } = period;
  const dt = toUtc(start);
  const y = dt.getUTCFullYear();
  const m = dt.getUTCMonth() + 1;
  switch (level) {
    case "year":
      return periodOf(level, ymd(y + n, 1, 1));
    case "quarter":
      return periodOf(level, ymd(y, m + 3 * n, 1));
    case "month":
      return periodOf(level, ymd(y, m + n, 1));
    case "week":
      return periodOf(level, addDays(start, 7 * n));
    case "day":
      return periodOf(level, addDays(start, n));
  }
}

export function periodContains(period: Pick<Period, "start" | "end">, date: string): boolean {
  return period.start <= date && date <= period.end;
}

export function periodsOverlap(a: Pick<Period, "start" | "end">, b: Pick<Period, "start" | "end">): boolean {
  return a.start <= b.end && b.start <= a.end;
}

/**
 * `parent` bilan kesishadigan barcha `level` davrlari, tartib bilan.
 * Masalan oyning haftalari: oy chegarasidan chiqib ketgan birinchi/oxirgi haftalar ham kiradi.
 */
export function periodsWithin(level: PeriodLevel, parent: Pick<Period, "start" | "end">): Period[] {
  const result: Period[] = [];
  for (let p = periodOf(level, parent.start); p.start <= parent.end; p = shiftPeriod(p, 1)) {
    result.push(p);
  }
  return result;
}

/** Qisqa kalit: `2026`, `2026-Q4`, `2026-10`, `2026-W42`, `2026-10-17`. */
export function periodKey(period: Pick<Period, "level" | "start">): string {
  const { level, start } = period;
  switch (level) {
    case "year":
      return start.slice(0, 4);
    case "quarter":
      return `${start.slice(0, 4)}-Q${Math.floor((Number(start.slice(5, 7)) - 1) / 3) + 1}`;
    case "month":
      return start.slice(0, 7);
    case "week": {
      const { year, week } = isoWeek(start);
      return `${year}-W${String(week).padStart(2, "0")}`;
    }
    case "day":
      return start;
  }
}

const PERIOD_KEY_RE = /^(\d{4})(?:-Q([1-4])|-W(\d{2})|-(\d{2})(?:-(\d{2}))?)?$/;

/** `periodKey` ning teskarisi. Noto'g'ri kalit uchun `null`. */
export function parsePeriodKey(key: string): Period | null {
  const m = PERIOD_KEY_RE.exec(key);
  if (!m) return null;
  const year = Number(m[1]);
  const [, , q, w, mo, d] = m;
  if (q) return periodOf("quarter", ymd(year, (Number(q) - 1) * 3 + 1, 1));
  if (w) {
    const week = Number(w);
    if (week < 1) return null;
    const p = periodOf("week", addDays(isoWeekYearStart(year), (week - 1) * 7));
    return isoWeek(p.start).year === year ? p : null;
  }
  if (mo && d) return isIsoDate(key) ? periodOf("day", key) : null;
  if (mo) {
    const month = Number(mo);
    return month >= 1 && month <= 12 ? periodOf("month", ymd(year, month, 1)) : null;
  }
  return periodOf("year", ymd(year, 1, 1));
}
