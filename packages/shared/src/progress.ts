// ---------- Progress hisoblash (S1-03) ----------
//
// Sof funksiyalar: DB'ga bog'liq emas. Natija har doim 0…1.
// Yig'ilish: vazifalar → key result → maqsad → ota maqsad (Q-025).

/** Progressga ta'sir qiluvchi vazifa holati. `cancelled` hisobga olinmaydi. */
export type ProgressTaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export interface KeyResultProgressInput {
  startValue: number;
  targetValue: number | null;
  currentValue: number;
}

export interface GoalProgressInput {
  status: "active" | "done" | "dropped";
  /** Maqsadning key result'lari progressi. */
  keyResults: number[];
  /** Bekor qilinmagan (`dropped` emas) bola maqsadlar progressi. */
  children: number[];
  /** Maqsadga to'g'ridan-to'g'ri bog'langan (key result'siz) vazifalar holati. */
  directTasks: ProgressTaskStatus[];
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** Bajarilgan vazifalar ulushi; bekor qilinganlar hisobga olinmaydi. Vazifa yo'q — `null`. */
export function taskCompletion(statuses: readonly ProgressTaskStatus[]): number | null {
  const counted = statuses.filter((s) => s !== "cancelled");
  if (counted.length === 0) return null;
  return counted.filter((s) => s === "done").length / counted.length;
}

/**
 * Key result progressi: `target_value` berilgan bo'lsa raqamdan (start → target, kamayuvchi maqsad ham bo'lishi mumkin),
 * aks holda bog'langan vazifalardan.
 */
export function keyResultProgress(kr: KeyResultProgressInput, tasks: readonly ProgressTaskStatus[]): number {
  const { startValue, targetValue, currentValue } = kr;
  if (targetValue !== null) {
    if (targetValue === startValue) return currentValue === targetValue ? 1 : 0;
    return clamp01((currentValue - startValue) / (targetValue - startValue));
  }
  return taskCompletion(tasks) ?? 0;
}

/**
 * Maqsad progressi — har bir key result, har bir bola maqsad va to'g'ridan-to'g'ri vazifalar (bitta qism sifatida)
 * o'rtachasi. `done` maqsad — 1; hech qanday qism yo'q — 0.
 */
export function goalProgress(goal: GoalProgressInput): number {
  if (goal.status === "done") return 1;
  const parts = [...goal.keyResults, ...goal.children];
  const direct = taskCompletion(goal.directTasks);
  if (direct !== null) parts.push(direct);
  if (parts.length === 0) return 0;
  return clamp01(parts.reduce((sum, p) => sum + p, 0) / parts.length);
}
