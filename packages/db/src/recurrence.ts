import { and, eq, gte } from "drizzle-orm";
import { addDays, occurrencesBetween, toLocalIsoDate } from "@loiha/shared";
import type { Db } from "./index.ts";
import { recomputeForTask, type Tx } from "./progress.ts";
import { taskRecurrences, tasks } from "./schema.ts";

// Takrorlanuvchi vazifalarni (S1-04) `tasks` jadvaliga yaratish.
// Vazifalar oldindan, bugundan `RECURRENCE_HORIZON_DAYS` kun oldinga yaratiladi — kunlik/haftalik ko'rinishlar,
// progress va MCP oddiy vazifalar bilan ishlaydi. Chaqiruv idempotent: (recurrence_id, occurrence_date) yagona.

/** Necha kun oldinga vazifa yaratiladi (bugun ham kiradi). */
export const RECURRENCE_HORIZON_DAYS = 14;

/**
 * Faol seriyalar uchun `until` sanasigacha (kiradi) yetishmagan vazifalarni yaratadi.
 * Har seriya `generated_until` dan keyingi kundan davom etadi, shuning uchun foydalanuvchi o'chirgan
 * takrorlanish qayta paydo bo'lmaydi. `from` (standart: bugun) dan oldingi sanalar yaratilmaydi — o'tmishdagi
 * `start_date` yoki to'xtatilib qayta yoqilgan seriya "qarz" vazifalar to'plamaydi. Yaratilgan vazifalar soni qaytariladi.
 */
export function materializeRecurrences(
  db: Db,
  {
    from = toLocalIsoDate(),
    until = addDays(from, RECURRENCE_HORIZON_DAYS - 1),
  }: { from?: string; until?: string } = {},
): number {
  return db.transaction((tx) => {
    let created = 0;
    for (const r of tx.select().from(taskRecurrences).where(eq(taskRecurrences.active, true)).all()) {
      if (r.generatedUntil !== null && r.generatedUntil >= until) continue;
      const next = r.generatedUntil === null ? r.startDate : addDays(r.generatedUntil, 1);
      const dates = occurrencesBetween(
        { rule: r.rule, start: r.startDate, end: r.endDate },
        next > from ? next : from,
        until,
      );
      let inserted = 0;
      for (const date of dates) {
        inserted += tx
          .insert(tasks)
          .values({
            title: r.title,
            notes: r.notes,
            goalId: r.goalId,
            keyResultId: r.keyResultId,
            priority: r.priority,
            estimateMinutes: r.estimateMinutes,
            planLevel: "day",
            planStart: date,
            recurrenceId: r.id,
            occurrenceDate: date,
          })
          .onConflictDoNothing()
          .run().changes;
      }
      tx.update(taskRecurrences).set({ generatedUntil: until }).where(eq(taskRecurrences.id, r.id)).run();
      if (inserted > 0) recomputeForTask(tx, r);
      created += inserted;
    }
    return created;
  });
}

/**
 * Seriya qoidasi, sanalari yoki maydonlari o'zgarganda (yoki seriya to'xtatilganda) chaqiriladi:
 * `from` sanasidan boshlab hali boshlanmagan (`todo`) takrorlanishlarni o'chiradi va keyingi
 * `materializeRecurrences` ularni yangi qoida bo'yicha qayta yaratishi uchun `generated_until` ni orqaga suradi.
 * Bajarilgan yoki boshlangan vazifalar tarix sifatida qoladi. O'chirilgan vazifalar soni qaytariladi.
 */
export function resetFutureOccurrences(db: Tx, recurrenceId: string, from: string = toLocalIsoDate()): number {
  const r = db.select().from(taskRecurrences).where(eq(taskRecurrences.id, recurrenceId)).get();
  if (!r) return 0;
  const removed = db
    .delete(tasks)
    .where(and(eq(tasks.recurrenceId, recurrenceId), gte(tasks.occurrenceDate, from), eq(tasks.status, "todo")))
    .returning({ goalId: tasks.goalId, keyResultId: tasks.keyResultId })
    .all();
  const before = addDays(from, -1);
  if (r.generatedUntil !== null && r.generatedUntil > before) {
    db.update(taskRecurrences).set({ generatedUntil: before }).where(eq(taskRecurrences.id, recurrenceId)).run();
  }
  if (removed.length > 0) recomputeForTask(db, ...removed);
  return removed.length;
}
