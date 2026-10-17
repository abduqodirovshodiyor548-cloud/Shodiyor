import { and, eq, isNull, ne } from "drizzle-orm";
import { goalProgress, keyResultProgress, type ProgressTaskStatus } from "@loiha/shared";
import type { Db } from "./index.ts";
import { goals, keyResults, tasks } from "./schema.ts";

// Progress keshini (Q-025) yangilash. Har bir funksiya o'zgargan joydan boshlab yuqoriga, ildiz maqsadgacha yuradi.
// Chaqiruvchi yozish bilan birga bitta tranzaksiyada chaqirishi tavsiya etiladi.

/** Ulanish yoki `db.transaction` ichidagi tranzaksiya. */
export type Tx = Db | Parameters<Parameters<Db["transaction"]>[0]>[0];

/** Bitta key result progressini qayta hisoblaydi va saqlaydi. KR topilmasa `null`. */
export function recomputeKeyResult(db: Tx, keyResultId: string): number | null {
  const kr = db.select().from(keyResults).where(eq(keyResults.id, keyResultId)).get();
  if (!kr) return null;
  const statuses = db
    .select({ status: tasks.status })
    .from(tasks)
    .where(eq(tasks.keyResultId, keyResultId))
    .all()
    .map((t) => t.status as ProgressTaskStatus);
  const progress = keyResultProgress(kr, statuses);
  if (progress !== kr.progress) db.update(keyResults).set({ progress }).where(eq(keyResults.id, keyResultId)).run();
  return progress;
}

/** Bitta maqsad progressini uning saqlangan KR va bola maqsad qiymatlaridan qayta hisoblaydi (yuqoriga yurmaydi). */
function recomputeGoalOnly(db: Tx, goalId: string): { progress: number; parentId: string | null } | null {
  const goal = db.select().from(goals).where(eq(goals.id, goalId)).get();
  if (!goal) return null;
  const krs = db.select({ progress: keyResults.progress }).from(keyResults).where(eq(keyResults.goalId, goalId)).all();
  const children = db
    .select({ progress: goals.progress })
    .from(goals)
    .where(and(eq(goals.parentId, goalId), ne(goals.status, "dropped")))
    .all();
  const directTasks = db
    .select({ status: tasks.status })
    .from(tasks)
    .where(and(eq(tasks.goalId, goalId), isNull(tasks.keyResultId)))
    .all();
  const progress = goalProgress({
    status: goal.status,
    keyResults: krs.map((k) => k.progress),
    children: children.map((c) => c.progress),
    directTasks: directTasks.map((t) => t.status as ProgressTaskStatus),
  });
  if (progress !== goal.progress) db.update(goals).set({ progress }).where(eq(goals.id, goalId)).run();
  return { progress, parentId: goal.parentId };
}

/** Maqsadni va uning barcha ota maqsadlarini yangilaydi. */
export function recomputeGoalUpwards(db: Tx, goalId: string): void {
  const seen = new Set<string>();
  let current: string | null = goalId;
  while (current && !seen.has(current)) {
    seen.add(current);
    current = recomputeGoalOnly(db, current)?.parentId ?? null;
  }
}

/** Key result o'zgarganda (qiymati yoki vazifalari): KR → maqsad → ota maqsadlar. */
export function recomputeFromKeyResult(db: Tx, keyResultId: string): void {
  recomputeKeyResult(db, keyResultId);
  const kr = db.select({ goalId: keyResults.goalId }).from(keyResults).where(eq(keyResults.id, keyResultId)).get();
  if (kr) recomputeGoalUpwards(db, kr.goalId);
}

/**
 * Vazifa yaratilganda, o'zgarganda yoki o'chirilganda chaqiriladi.
 * Bog'lanish o'zgargan bo'lsa, eski va yangi qiymatlarni ham bering — ikkala zanjir yangilanadi.
 */
export function recomputeForTask(db: Tx, ...refs: { goalId?: string | null; keyResultId?: string | null }[]): void {
  const krIds = new Set<string>();
  const goalIds = new Set<string>();
  for (const ref of refs) {
    if (ref.keyResultId) krIds.add(ref.keyResultId);
    else if (ref.goalId) goalIds.add(ref.goalId);
  }
  for (const id of krIds) recomputeFromKeyResult(db, id);
  for (const id of goalIds) recomputeGoalUpwards(db, id);
}

/** Barcha keshni noldan qayta hisoblaydi (migratsiyadan keyin yoki tekshiruv uchun). */
export function recomputeAllProgress(db: Db): void {
  db.transaction((tx) => {
    for (const { id } of tx.select({ id: keyResults.id }).from(keyResults).all()) recomputeKeyResult(tx, id);

    const all = tx.select({ id: goals.id, parentId: goals.parentId }).from(goals).all();
    const ids = new Set(all.map((g) => g.id));
    const childrenOf = new Map<string | null, string[]>();
    for (const g of all) {
      // Ota yo'q (yoki sikl tufayli topilmaydigan) maqsadlar ildiz sifatida olinadi.
      const parent = g.parentId && ids.has(g.parentId) ? g.parentId : null;
      childrenOf.set(parent, [...(childrenOf.get(parent) ?? []), g.id]);
    }
    // Post-order: avval bolalar, keyin ota.
    const seen = new Set<string>();
    const visit = (id: string) => {
      if (seen.has(id)) return;
      seen.add(id);
      for (const child of childrenOf.get(id) ?? []) visit(child);
      recomputeGoalOnly(tx, id);
    };
    for (const root of childrenOf.get(null) ?? []) visit(root);
    // Siklda qolib ketgan maqsadlar (ildizdan yetib bo'lmaydigan) ham hisoblanadi.
    for (const { id } of all) visit(id);
  });
}
