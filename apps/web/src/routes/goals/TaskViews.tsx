import { useState, type FormEvent, type ReactNode } from "react";
import { Check, Clock, Loader2, Play, Plus, Repeat, RotateCcw } from "lucide-react";
import {
  TASK_STATUSES,
  addDays,
  periodOf,
  periodsWithin,
  type CreateTaskInput,
  type GoalTreeNode,
  type Period,
  type TaskDto,
  type TaskPlanInput,
  type TaskStatus,
} from "@loiha/shared";
import { Button, Input } from "@/components/ui";
import { planningApi, usePlanningMutation, useTags } from "@/lib/planning";
import { cn } from "@/lib/utils";
import { useDraggableTask, useDropTarget, type DropTarget } from "./dnd";
import { PRIORITIES, TASK_STATUS_LABEL, dayTitle, periodTitle, planShort } from "./labels";
import { TagChip } from "./tags";
import type { TaskTarget } from "./TaskSheet";

// S1-08: oy va hafta ko'rinishlaridagi vazifalar — kanban (holat bo'yicha) va ro'yxat (reja davri bo'yicha).
// S1-10: qatorlar va kartalar sudraladi; bo'limlar (reja) va kanban ustunlari (holat) — tashlash nishonlari.
// Sudrash konteksti (`TaskDnd`) sahifa darajasida o'raladi.

export type TaskMode = "royxat" | "kanban";

interface ViewProps {
  period: Period;
  tasks: TaskDto[];
  goals: GoalTreeNode[];
  today: string;
  onOpen: (target: TaskTarget) => void;
}

const STATUS_ORDER: Record<TaskStatus, number> = { in_progress: 0, todo: 1, done: 2, cancelled: 3 };
export const byStatusPriority = (a: TaskDto, b: TaskDto) =>
  STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
  b.priority - a.priority ||
  a.sortOrder - b.sortOrder ||
  a.createdAt - b.createdAt;
const byDateThenStatus = (a: TaskDto, b: TaskDto) =>
  (a.planStart ?? "").localeCompare(b.planStart ?? "") || byStatusPriority(a, b);

const closed = (t: TaskDto) => t.status === "done" || t.status === "cancelled";

/** Holatni almashtirish: checkbox (bajarildi ↔ qilinadi) va kanbandagi tugmalar uchun. */
function useSetStatus() {
  return usePlanningMutation(({ id, status }: { id: string; status: TaskStatus }) =>
    planningApi.updateTask(id, { status }),
  );
}

function TaskMeta({ task, goals, showPlan }: { task: TaskDto; goals: GoalTreeNode[]; showPlan: boolean }) {
  const goal = task.goalId ? goals.find((g) => g.id === task.goalId) : undefined;
  const kr = task.keyResultId ? goal?.keyResults.find((k) => k.id === task.keyResultId) : undefined;
  const plan = showPlan ? planShort(task) : null;
  const tags = useTags();
  const items: ReactNode[] = [];
  if (plan) items.push(<span key="plan">{plan}</span>);
  for (const id of task.tagIds) {
    const tag = tags.data?.find((t) => t.id === id);
    if (tag) items.push(<TagChip key={id} tag={tag} />);
  }
  if (goal)
    items.push(
      <span key="goal" className="truncate">
        ◎ {kr ? `${goal.title} · ${kr.title}` : goal.title}
      </span>,
    );
  if (task.estimateMinutes) {
    items.push(
      <span key="est" className="inline-flex items-center gap-0.5">
        <Clock className="size-3" /> {task.estimateMinutes} daq
      </span>,
    );
  }
  if (task.recurrenceId) items.push(<Repeat key="rec" className="size-3" aria-label="Takrorlanuvchi" />);
  if (items.length === 0) return null;
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">{items}</div>
  );
}

function PriorityDot({ priority }: { priority: number }) {
  const p = PRIORITIES.find((x) => x.value === priority);
  if (!p?.dot) return null;
  return <span className={cn("size-2 shrink-0 rounded-full", p.dot)} title={`Ustuvorlik: ${p.label}`} />;
}

function DoneCheckbox({ task }: { task: TaskDto }) {
  const setStatus = useSetStatus();
  const done = task.status === "done";
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={done ? "Bajarilmagan deb belgilash" : "Bajarildi deb belgilash"}
      disabled={setStatus.isPending || task.status === "cancelled"}
      onClick={(e) => {
        e.stopPropagation();
        setStatus.mutate({ id: task.id, status: done ? "todo" : "done" });
      }}
      className={cn(
        "flex size-4.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-50",
        done ? "border-success bg-success text-white" : "border-muted-foreground/40 hover:border-success",
      )}
    >
      {setStatus.isPending ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        done && <Check className="size-3" strokeWidth={3} />
      )}
    </button>
  );
}

/** Qator oxiridagi qo'shimcha amal (masalan "Bugun" sahifasidagi fokus yulduzchasi yoki "Bugunga olish"). */
export type RowAction = (task: TaskDto) => ReactNode;

function TaskRow({
  task,
  goals,
  showPlan,
  onOpen,
  action,
}: {
  task: TaskDto;
  goals: GoalTreeNode[];
  showPlan: boolean;
  onOpen: ViewProps["onOpen"];
  action?: RowAction;
}) {
  const drag = useDraggableTask(task);
  return (
    <li
      ref={drag.ref}
      {...drag.props}
      className={cn("flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-accent/50", drag.className)}
      onClick={() => onOpen({ kind: "edit", id: task.id })}
    >
      <div className="pt-0.5">
        <DoneCheckbox task={task} />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm", closed(task) && "text-muted-foreground line-through")}>{task.title}</span>
          {task.status === "in_progress" && <span className="text-xs text-primary">jarayonda</span>}
        </div>
        <TaskMeta task={task} goals={goals} showPlan={showPlan} />
      </div>
      <PriorityDot priority={task.priority} />
      {action && (
        <div className="-my-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {action(task)}
        </div>
      )}
    </li>
  );
}

/** Tezkor qo'shish: Enter bilan berilgan rejada vazifa yaratadi. */
function QuickAdd({
  plan,
  placeholder,
  extra,
}: {
  plan: TaskPlanInput;
  placeholder: string;
  /** Yaratiladigan vazifaning qo'shimcha maydonlari (masalan `focus: true`). */
  extra?: Omit<CreateTaskInput, "title" | "plan">;
}) {
  const [title, setTitle] = useState("");
  const create = usePlanningMutation(planningApi.createTask);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate({ ...extra, title, plan }, { onSuccess: () => setTitle("") });
  };
  return (
    <form onSubmit={submit} className="flex items-center gap-2 px-3 py-1.5">
      <Plus className="size-4 shrink-0 text-muted-foreground" />
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        disabled={create.isPending}
        className="h-8 border-transparent bg-transparent px-1 shadow-none focus-visible:border-input focus-visible:bg-card"
      />
      {create.isError && <span className="shrink-0 text-xs text-destructive">{create.error.message}</span>}
    </form>
  );
}

export function Section({
  title,
  sub,
  highlight,
  tasks,
  goals,
  showPlan,
  onOpen,
  add,
  action,
  empty,
  className,
  drop,
}: {
  title: ReactNode;
  sub?: string;
  highlight?: boolean;
  tasks: TaskDto[];
  goals: GoalTreeNode[];
  showPlan: boolean;
  onOpen: ViewProps["onOpen"];
  add?: { plan: TaskPlanInput; placeholder: string; extra?: Omit<CreateTaskInput, "title" | "plan"> };
  action?: RowAction;
  /** Vazifa bo'lmasa ko'rsatiladigan matn. */
  empty?: string;
  className?: string;
  /** Shu bo'limga tashlangan vazifa oladigan reja (S1-10). */
  drop?: { id: string; target: DropTarget };
}) {
  const done = tasks.filter((t) => t.status === "done").length;
  const open = tasks.filter((t) => t.status !== "cancelled").length;
  const dropZone = useDropTarget(drop?.id ?? "", drop?.target);
  return (
    <section
      ref={drop ? dropZone.ref : undefined}
      className={cn(
        "overflow-hidden rounded-xl border bg-card transition-shadow",
        highlight && "border-primary/50",
        className,
        dropZone.isOver && "ring-2 ring-ring",
      )}
    >
      <header className={cn("flex items-baseline gap-2 border-b px-3 py-2", highlight && "bg-primary/5")}>
        <h3 className={cn("text-sm font-medium", highlight && "text-primary")}>{title}</h3>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        {open > 0 && (
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">
            {done}/{open}
          </span>
        )}
      </header>
      {tasks.length > 0 && (
        <ul className="divide-y">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} goals={goals} showPlan={showPlan} onOpen={onOpen} action={action} />
          ))}
        </ul>
      )}
      {tasks.length === 0 && empty && <p className="px-3 py-3 text-sm text-muted-foreground">{empty}</p>}
      {add && <QuickAdd {...add} />}
    </section>
  );
}

/** Hafta ro'yxati: hafta/oy uchun rejalashtirilganlar va har bir kun alohida. */
export function WeekList({ period, tasks, goals, today, onOpen }: ViewProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(period.start, i));
  const weekTasks = tasks.filter((t) => t.planLevel === "week").sort(byStatusPriority);
  const monthTasks = tasks.filter((t) => t.planLevel === "month").sort(byStatusPriority);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Section
        title="Hafta davomida"
        sub="kun belgilanmagan"
        tasks={weekTasks}
        goals={goals}
        showPlan={false}
        onOpen={onOpen}
        add={{ plan: { level: "week", date: period.start }, placeholder: "Hafta uchun vazifa…" }}
        drop={{ id: `week-${period.start}`, target: { kind: "plan", plan: { level: "week", date: period.start } } }}
      />
      {monthTasks.length > 0 && (
        <Section
          title="Oy davomida"
          tasks={monthTasks}
          goals={goals}
          showPlan
          onOpen={onOpen}
          drop={{ id: `month-${period.start}`, target: { kind: "plan", plan: { level: "month", date: period.start } } }}
        />
      )}
      {days.map((d) => (
        <Section
          key={d}
          title={dayTitle(d)}
          highlight={d === today}
          tasks={tasks.filter((t) => t.planLevel === "day" && t.planStart === d).sort(byStatusPriority)}
          goals={goals}
          showPlan={false}
          onOpen={onOpen}
          add={{ plan: { level: "day", date: d }, placeholder: "Vazifa qo'shish…" }}
          drop={{ id: `day-${d}`, target: { kind: "plan", plan: { level: "day", date: d } } }}
        />
      ))}
    </div>
  );
}

/** Oy ro'yxati: oy uchun rejalashtirilganlar va oyning haftalari (haftalik + kunlik vazifalar). */
export function MonthList({ period, tasks, goals, today, onOpen }: ViewProps) {
  const monthTasks = tasks.filter((t) => t.planLevel === "month").sort(byStatusPriority);
  const weeks = periodsWithin("week", period);
  return (
    <div className="space-y-4">
      <Section
        title="Oy davomida"
        sub="hafta/kun belgilanmagan"
        tasks={monthTasks}
        goals={goals}
        showPlan={false}
        onOpen={onOpen}
        add={{ plan: { level: "month", date: period.start }, placeholder: "Oy uchun vazifa…" }}
        drop={{ id: `month-${period.start}`, target: { kind: "plan", plan: { level: "month", date: period.start } } }}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {weeks.map((w) => {
          const items = tasks
            .filter(
              (t) =>
                (t.planLevel === "week" && t.planStart === w.start) ||
                (t.planLevel === "day" && t.planStart !== null && t.planStart >= w.start && t.planStart <= w.end),
            )
            .sort(byDateThenStatus);
          const current = periodOf("week", today).start === w.start;
          return (
            <Section
              key={w.start}
              title={periodTitle(w)}
              highlight={current}
              tasks={items}
              goals={goals}
              showPlan
              onOpen={onOpen}
              add={{ plan: { level: "week", date: w.start }, placeholder: "Hafta uchun vazifa…" }}
              drop={{ id: `week-${w.start}`, target: { kind: "plan", plan: { level: "week", date: w.start } } }}
            />
          );
        })}
      </div>
    </div>
  );
}

const NEXT: Partial<Record<TaskStatus, { status: TaskStatus; label: string; icon: typeof Play }>> = {
  todo: { status: "in_progress", label: "Boshlash", icon: Play },
  in_progress: { status: "done", label: "Bajarildi", icon: Check },
  done: { status: "todo", label: "Qaytarish", icon: RotateCcw },
  cancelled: { status: "todo", label: "Tiklash", icon: RotateCcw },
};

function KanbanCard({ task, goals, onOpen }: { task: TaskDto; goals: GoalTreeNode[]; onOpen: ViewProps["onOpen"] }) {
  const setStatus = useSetStatus();
  const next = NEXT[task.status];
  const drag = useDraggableTask(task);
  return (
    <div
      ref={drag.ref}
      {...drag.props}
      role="button"
      tabIndex={0}
      onClick={() => onOpen({ kind: "edit", id: task.id })}
      onKeyDown={(e) => {
        drag.props.onKeyDown?.(e);
        if (e.key === "Enter") onOpen({ kind: "edit", id: task.id });
      }}
      className={cn(
        "space-y-2 rounded-lg border bg-card p-3 shadow-xs hover:border-ring/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        drag.className,
      )}
    >
      <div className="flex items-start gap-2">
        <span className={cn("min-w-0 flex-1 text-sm", closed(task) && "text-muted-foreground line-through")}>
          {task.title}
        </span>
        <PriorityDot priority={task.priority} />
      </div>
      <TaskMeta task={task} goals={goals} showPlan />
      {next && (
        <Button
          size="sm"
          variant="ghost"
          className="-ml-2 h-7 text-xs text-muted-foreground"
          disabled={setStatus.isPending}
          onClick={(e) => {
            e.stopPropagation();
            setStatus.mutate({ id: task.id, status: next.status });
          }}
        >
          {setStatus.isPending ? <Loader2 className="animate-spin" /> : <next.icon />} {next.label}
        </Button>
      )}
    </div>
  );
}

function KanbanColumn({
  status,
  tasks,
  goals,
  onOpen,
  onCreate,
}: {
  status: TaskStatus;
  tasks: TaskDto[];
  goals: GoalTreeNode[];
  onOpen: ViewProps["onOpen"];
  onCreate?: () => void;
}) {
  const drop = useDropTarget(`status-${status}`, { kind: "status", status });
  return (
    <div
      ref={drop.ref}
      className={cn(
        "flex flex-col gap-2 rounded-xl border bg-muted/30 p-3 transition-shadow",
        drop.isOver && "ring-2 ring-ring",
      )}
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium">{TASK_STATUS_LABEL[status]}</h3>
        <span className="text-xs tabular-nums text-muted-foreground">{tasks.length}</span>
      </div>
      {tasks.map((t) => (
        <KanbanCard key={t.id} task={t} goals={goals} onOpen={onOpen} />
      ))}
      {onCreate && (
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground hover:bg-accent/40"
        >
          <Plus className="size-4" /> Vazifa
        </button>
      )}
    </div>
  );
}

/** Kanban: holat bo'yicha ustunlar. "Bekor qilindi" ustuni faqat shunday vazifa bo'lsa ko'rinadi. */
export function TaskBoard({ period, tasks, goals, onOpen }: ViewProps) {
  const statuses = TASK_STATUSES.filter((s) => s !== "cancelled" || tasks.some((t) => t.status === s));
  const plan: TaskPlanInput = { level: period.level === "week" ? "week" : "month", date: period.start };
  return (
    <div
      className="grid gap-4 md:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
      style={{ "--cols": statuses.length } as React.CSSProperties}
    >
      {statuses.map((s) => (
        <KanbanColumn
          key={s}
          status={s}
          tasks={tasks.filter((t) => t.status === s).sort(byDateThenStatus)}
          goals={goals}
          onOpen={onOpen}
          onCreate={s === "todo" ? () => onOpen({ kind: "create", plan }) : undefined}
        />
      ))}
    </div>
  );
}
