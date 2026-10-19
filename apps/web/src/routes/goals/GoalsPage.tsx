import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Columns3, List, Loader2, Plus } from "lucide-react";
import {
  parsePeriodKey,
  periodKey,
  periodOf,
  periodsWithin,
  shiftPeriod,
  toLocalIsoDate,
  type GoalLevel,
  type GoalTreeNode,
  type Period,
} from "@loiha/shared";
import { Button } from "@/components/ui";
import { flattenTree, useGoalTree, useTasks } from "@/lib/planning";
import { cn } from "@/lib/utils";
import { GoalCard } from "./GoalCard";
import { GoalSheet, type SheetTarget } from "./GoalSheet";
import { LEVEL_LABEL, isCurrent, periodTitle, quarterMonths } from "./labels";
import { TaskSheet, type TaskTarget } from "./TaskSheet";
import { MonthList, TaskBoard, WeekList, type TaskMode } from "./TaskViews";

// S1-07: maqsadlar xaritasi — yil va kvartal ko'rinishlari.
// S1-08: oy va hafta — davr maqsadlari + vazifalar (ro'yxat yoki kanban). "Bugun" sahifasi — S1-09.

export const GOAL_VIEWS = ["yil", "kvartal", "oy", "hafta"] as const;
export type GoalView = (typeof GOAL_VIEWS)[number];
export const TASK_MODES = ["royxat", "kanban"] as const satisfies readonly TaskMode[];
const VIEW_LEVEL: Record<GoalView, "year" | "quarter" | "month" | "week"> = {
  yil: "year",
  kvartal: "quarter",
  oy: "month",
  hafta: "week",
};
const taskView = (v: GoalView): v is "oy" | "hafta" => v === "oy" || v === "hafta";

/** URL'dagi davr kalitini ko'rinish darajasiga keltiradi (masalan `kvartal` + `2026` → shu yilning joriy/1-kvartali). */
export function resolvePeriod(view: GoalView, key: string | undefined, today = toLocalIsoDate()): Period {
  const level = VIEW_LEVEL[view];
  const parsed = key ? parsePeriodKey(key) : null;
  if (!parsed) return periodOf(level, today);
  if (parsed.level === level) return parsed;
  // Kattaroq davr berilgan bo'lsa va bugun uning ichida bo'lsa — joriy, aks holda boshidagi davr.
  const inside = parsed.start <= today && today <= parsed.end;
  return periodOf(level, inside ? today : parsed.start);
}

export function GoalsPage({ view, period: key, mode }: { view: GoalView; period?: string; mode: TaskMode }) {
  const navigate = useNavigate({ from: "/maqsadlar" });
  const today = toLocalIsoDate();
  const period = resolvePeriod(view, key, today);
  const tree = useGoalTree(periodKey(period));
  const flat = useMemo(() => flattenTree(tree.data ?? []), [tree.data]);
  const tasks = useTasks(periodKey(period), taskView(view));
  const [sheet, setSheet] = useState<SheetTarget | null>(null);
  const [taskSheet, setTaskSheet] = useState<TaskTarget | null>(null);

  const go = (v: GoalView, p: Period, m: TaskMode = mode) =>
    navigate({ search: { view: v, period: periodKey(p), ...(m !== "royxat" ? { mode: m } : {}) } });
  const create = (level: GoalLevel, date: string, parentId?: string) =>
    setSheet({ kind: "create", level, date, parentId });
  const open = (id: string) => setSheet({ kind: "edit", id });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-semibold tracking-tight">Maqsadlar</h1>
        <div className="flex rounded-md bg-muted p-0.5 text-sm" role="tablist">
          {GOAL_VIEWS.map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={v === view}
              onClick={() => go(v, resolvePeriod(v, periodKey(period), today))}
              className={cn(
                "rounded px-3 py-1 capitalize text-muted-foreground",
                v === view && "bg-card font-medium text-foreground shadow-xs",
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            aria-label="Oldingi davr"
            onClick={() => go(view, shiftPeriod(period, -1))}
          >
            <ChevronLeft />
          </Button>
          <div className="min-w-32 text-center text-sm font-medium">
            {periodTitle(period, view !== "yil" && view !== "hafta")}
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Keyingi davr"
            onClick={() => go(view, shiftPeriod(period, 1))}
          >
            <ChevronRight />
          </Button>
          {!isCurrent(period, today) && (
            <Button variant="ghost" size="sm" onClick={() => go(view, periodOf(period.level, today))}>
              Bugun
            </Button>
          )}
        </div>
      </header>

      {tree.isPending ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Yuklanmoqda…
        </div>
      ) : tree.isError ? (
        <p className="text-sm text-destructive">Maqsadlarni yuklab bo'lmadi: {tree.error.message}</p>
      ) : view === "yil" ? (
        <YearMap
          period={period}
          goals={flat}
          today={today}
          onOpen={open}
          onCreate={create}
          onZoom={(p) => go("kvartal", p)}
        />
      ) : view === "kvartal" ? (
        <QuarterMap period={period} goals={flat} today={today} onOpen={open} onCreate={create} />
      ) : (
        <>
          <TopGoals level={VIEW_LEVEL[view]} period={period} goals={flat} onOpen={open} onCreate={create} />
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium text-muted-foreground">Vazifalar</h2>
              <div className="flex rounded-md bg-muted p-0.5 text-sm" role="tablist" aria-label="Ko'rinish">
                {TASK_MODES.map((m) => {
                  const Icon = m === "kanban" ? Columns3 : List;
                  return (
                    <button
                      key={m}
                      role="tab"
                      aria-selected={m === mode}
                      onClick={() => go(view, period, m)}
                      className={cn(
                        "flex items-center gap-1.5 rounded px-3 py-1 text-muted-foreground",
                        m === mode && "bg-card font-medium text-foreground shadow-xs",
                      )}
                    >
                      <Icon className="size-3.5" /> {m === "kanban" ? "Kanban" : "Ro'yxat"}
                    </button>
                  );
                })}
              </div>
            </div>
            {tasks.isPending ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Yuklanmoqda…
              </div>
            ) : tasks.isError ? (
              <p className="text-sm text-destructive">Vazifalarni yuklab bo'lmadi: {tasks.error.message}</p>
            ) : (
              (() => {
                const props = { period, tasks: tasks.data, goals: flat, today, onOpen: setTaskSheet };
                if (mode === "kanban") return <TaskBoard {...props} />;
                return view === "hafta" ? <WeekList {...props} /> : <MonthList {...props} />;
              })()
            )}
          </section>
        </>
      )}

      <GoalSheet target={sheet} goals={flat} onClose={() => setSheet(null)} onOpen={setSheet} />
      <TaskSheet target={taskSheet} tasks={tasks.data ?? []} goals={flat} onClose={() => setTaskSheet(null)} />
    </div>
  );
}

interface MapProps {
  period: Period;
  goals: GoalTreeNode[];
  today: string;
  onOpen: (id: string) => void;
  onCreate: (level: GoalLevel, date: string, parentId?: string) => void;
}

const inPeriod = (g: GoalTreeNode, p: Period) => g.periodStart >= p.start && g.periodEnd <= p.end;

/** Yuqori qism: ko'rinish davrining o'z maqsadlari (katta kartalar). */
function TopGoals({ level, period, goals, onOpen, onCreate }: Omit<MapProps, "today"> & { level: GoalLevel }) {
  const own = goals.filter((g) => g.level === level && g.periodStart === period.start);
  const titleOf = (id: string | null) => goals.find((g) => g.id === id)?.title;
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          {LEVEL_LABEL[level]} maqsadlar · {periodTitle(period, level !== "year")}
        </h2>
        <Button size="sm" variant="outline" onClick={() => onCreate(level, period.start)}>
          <Plus /> Maqsad
        </Button>
      </div>
      {own.length === 0 ? (
        <button
          type="button"
          onClick={() => onCreate(level, period.start)}
          className="w-full rounded-lg border border-dashed p-6 text-sm text-muted-foreground hover:bg-accent/40"
        >
          {periodTitle(period, level !== "year")} uchun hali maqsad yo'q — birinchisini qo'shing
        </button>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {own.map((g) => (
            <GoalCard key={g.id} goal={g} parentTitle={titleOf(g.parentId)} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}

/** Pastki qism: kichik davrlar ustunlari (yil → 4 kvartal, kvartal → 3 oy). */
function Columns({
  level,
  columns,
  goals,
  today,
  onOpen,
  onCreate,
  header,
  footer,
}: Omit<MapProps, "period"> & {
  level: GoalLevel;
  columns: Period[];
  header: (p: Period) => React.ReactNode;
  footer?: (p: Period) => React.ReactNode;
}) {
  const titleOf = (id: string | null) => goals.find((g) => g.id === id)?.title;
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
      style={{ "--cols": columns.length } as React.CSSProperties}
    >
      {columns.map((col) => {
        const items = goals.filter((g) => g.level === level && inPeriod(g, col));
        const current = isCurrent(col, today);
        return (
          <div
            key={col.start}
            className={cn(
              "flex flex-col gap-2 rounded-xl border bg-muted/30 p-3",
              current && "border-primary/50 bg-primary/5",
            )}
          >
            <div className="flex items-center justify-between gap-2 px-1">
              {header(col)}
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                aria-label={`${periodTitle(col)} uchun maqsad qo'shish`}
                onClick={() => onCreate(level, current ? today : col.start)}
              >
                <Plus />
              </Button>
            </div>
            {items.length === 0 && <p className="px-1 py-2 text-xs text-muted-foreground">Maqsad yo'q</p>}
            {items.map((g) => (
              <GoalCard key={g.id} goal={g} compact parentTitle={titleOf(g.parentId)} onOpen={onOpen} />
            ))}
            {footer?.(col)}
          </div>
        );
      })}
    </section>
  );
}

function avgProgress(goals: GoalTreeNode[]): number | null {
  const active = goals.filter((g) => g.status !== "dropped");
  return active.length ? active.reduce((s, g) => s + g.progress, 0) / active.length : null;
}

function ColumnHeader({
  title,
  sub,
  progress,
  current,
  onClick,
}: {
  title: string;
  sub?: string;
  progress: number | null;
  current: boolean;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn("min-w-0 text-left", onClick && "hover:underline")}
    >
      <div className="flex items-baseline gap-2">
        <span className={cn("font-medium", current && "text-primary")}>{title}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
      {progress !== null && (
        <div className="text-xs tabular-nums text-muted-foreground">o'rtacha {Math.round(progress * 100)}%</div>
      )}
    </Comp>
  );
}

function YearMap({ onZoom, ...props }: MapProps & { onZoom: (p: Period) => void }) {
  const quarters = periodsWithin("quarter", props.period);
  return (
    <>
      <TopGoals level="year" {...props} />
      <Columns
        level="quarter"
        columns={quarters}
        {...props}
        header={(q) => (
          <ColumnHeader
            title={periodTitle(q)}
            sub={quarterMonths(q.start)}
            current={isCurrent(q, props.today)}
            progress={avgProgress(props.goals.filter((g) => g.level === "quarter" && inPeriod(g, q)))}
            onClick={() => onZoom(q)}
          />
        )}
        footer={(q) => {
          const months = props.goals.filter((g) => g.level === "month" && inPeriod(g, q)).length;
          return months > 0 ? <div className="px-1 text-xs text-muted-foreground">{months} ta oylik maqsad</div> : null;
        }}
      />
    </>
  );
}

function QuarterMap(props: MapProps) {
  const months = periodsWithin("month", props.period);
  return (
    <>
      <TopGoals level="quarter" {...props} />
      <Columns
        level="month"
        columns={months}
        {...props}
        header={(m) => (
          <ColumnHeader
            title={periodTitle(m)}
            current={isCurrent(m, props.today)}
            progress={avgProgress(props.goals.filter((g) => g.level === "month" && inPeriod(g, m)))}
          />
        )}
        footer={(m) => {
          const weeks = props.goals.filter(
            (g) => g.level === "week" && g.periodStart >= m.start && g.periodStart <= m.end,
          ).length;
          return weeks > 0 ? (
            <div className="px-1 text-xs text-muted-foreground">{weeks} ta haftalik maqsad</div>
          ) : null;
        }}
      />
    </>
  );
}
