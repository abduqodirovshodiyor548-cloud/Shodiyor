import { CheckCircle2, CircleSlash, ListTodo, Target } from "lucide-react";
import type { GoalTreeNode } from "@loiha/shared";
import { Progress } from "@/components/ui";
import { cn } from "@/lib/utils";

/** Xaritadagi maqsad kartasi. `compact` — ustunlar ichidagi kichik ko'rinish. */
export function GoalCard({
  goal,
  parentTitle,
  compact,
  onOpen,
}: {
  goal: GoalTreeNode;
  parentTitle?: string;
  compact?: boolean;
  onOpen: (id: string) => void;
}) {
  const pct = Math.round(goal.progress * 100);
  const inactive = goal.status !== "active";

  return (
    <button
      type="button"
      onClick={() => onOpen(goal.id)}
      className={cn(
        "group w-full rounded-lg border bg-card text-left shadow-xs transition-colors hover:border-ring/60 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        compact ? "space-y-2 p-3" : "space-y-3 p-4",
        goal.status === "dropped" && "opacity-60",
      )}
    >
      <div className="flex items-start gap-2">
        {goal.status === "done" ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
        ) : goal.status === "dropped" ? (
          <CircleSlash className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        ) : null}
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "font-medium leading-snug",
              compact && "text-sm",
              goal.status === "dropped" && "line-through",
            )}
          >
            {goal.title}
          </div>
          {parentTitle && <div className="mt-0.5 truncate text-xs text-muted-foreground">↳ {parentTitle}</div>}
        </div>
        <span className={cn("shrink-0 text-xs tabular-nums", inactive ? "text-muted-foreground" : "font-medium")}>
          {pct}%
        </span>
      </div>

      <Progress value={goal.progress} />

      {!compact && goal.keyResults.length > 0 && (
        <ul className="space-y-1">
          {goal.keyResults.slice(0, 4).map((kr) => (
            <li key={kr.id} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="min-w-0 flex-1 truncate">{kr.title}</span>
              <span className="tabular-nums">
                {kr.targetValue !== null
                  ? `${kr.currentValue}/${kr.targetValue}${kr.unit ? ` ${kr.unit}` : ""}`
                  : `${Math.round(kr.progress * 100)}%`}
              </span>
            </li>
          ))}
          {goal.keyResults.length > 4 && (
            <li className="text-xs text-muted-foreground">yana {goal.keyResults.length - 4} ta…</li>
          )}
        </ul>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {compact && goal.keyResults.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <Target className="size-3" /> {goal.keyResults.length} KR
          </span>
        )}
        {goal.children.length > 0 && <span>{goal.children.length} ta kichik maqsad</span>}
        {goal.taskCounts.total > 0 && (
          <span className="inline-flex items-center gap-1">
            <ListTodo className="size-3" /> {goal.taskCounts.done}/{goal.taskCounts.total}
          </span>
        )}
      </div>
    </button>
  );
}
