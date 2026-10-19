import { useState, type FormEvent } from "react";
import { Loader2, Repeat, Trash2 } from "lucide-react";
import {
  PLAN_LEVELS,
  TASK_STATUSES,
  type GoalTreeNode,
  type PlanLevel,
  type TaskDto,
  type TaskPlanInput,
  type TaskStatus,
} from "@loiha/shared";
import { Badge, Button, Field, Input, Select, Sheet, Textarea } from "@/components/ui";
import { planningApi, usePlanningMutation } from "@/lib/planning";
import { LEVEL_LABEL, PLAN_LEVEL_LABEL, PRIORITIES, TASK_STATUS_LABEL } from "./labels";

export type TaskTarget = { kind: "edit"; id: string } | { kind: "create"; plan: TaskPlanInput | null; goalId?: string };

export function TaskSheet({
  target,
  tasks,
  goals,
  onClose,
}: {
  target: TaskTarget | null;
  tasks: TaskDto[];
  goals: GoalTreeNode[];
  onClose: () => void;
}) {
  const task = target?.kind === "edit" ? tasks.find((t) => t.id === target.id) : undefined;
  return (
    <Sheet open={target !== null} onClose={onClose} title={target?.kind === "create" ? "Yangi vazifa" : "Vazifa"}>
      {target?.kind === "create" && (
        <TaskForm key={JSON.stringify(target)} goals={goals} initial={target} onDone={onClose} />
      )}
      {target?.kind === "edit" &&
        (task ? (
          <TaskForm key={task.id} goals={goals} task={task} onDone={onClose} />
        ) : (
          <p className="text-sm text-muted-foreground">Vazifa bu davr ko'rinishida topilmadi.</p>
        ))}
    </Sheet>
  );
}

interface FormState {
  title: string;
  notes: string;
  status: TaskStatus;
  priority: number;
  planLevel: PlanLevel | "";
  planDate: string;
  goalId: string;
  keyResultId: string;
  estimate: string;
  dueDate: string;
  focus: boolean;
}

function initialState(task?: TaskDto, initial?: Extract<TaskTarget, { kind: "create" }>): FormState {
  return {
    title: task?.title ?? "",
    notes: task?.notes ?? "",
    status: task?.status ?? "todo",
    priority: task?.priority ?? 0,
    planLevel: task?.planLevel ?? initial?.plan?.level ?? "",
    planDate: task?.planStart ?? initial?.plan?.date ?? "",
    goalId: task?.goalId ?? initial?.goalId ?? "",
    keyResultId: task?.keyResultId ?? "",
    estimate: task?.estimateMinutes ? String(task.estimateMinutes) : "",
    dueDate: task?.dueDate ?? "",
    focus: task?.focus ?? false,
  };
}

function TaskForm({
  task,
  initial,
  goals,
  onDone,
}: {
  task?: TaskDto;
  initial?: Extract<TaskTarget, { kind: "create" }>;
  goals: GoalTreeNode[];
  onDone: () => void;
}) {
  const [form, setForm] = useState(() => initialState(task, initial));
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const save = usePlanningMutation((input: Parameters<typeof planningApi.createTask>[0]) =>
    task ? planningApi.updateTask(task.id, input) : planningApi.createTask(input),
  );
  const remove = usePlanningMutation(planningApi.deleteTask);

  const goal = goals.find((g) => g.id === form.goalId);
  // Bog'langan maqsad joriy daraxtda bo'lmasa ham tanlov yo'qolmasligi uchun.
  const missingGoal = form.goalId && !goal;
  const estimate = form.estimate.trim() === "" ? null : Number(form.estimate);
  const invalid =
    !form.title.trim() ||
    (form.planLevel !== "" && !form.planDate) ||
    (estimate !== null && (!Number.isInteger(estimate) || estimate < 1));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate(
      {
        title: form.title,
        notes: form.notes.trim() || null,
        status: form.status,
        priority: form.priority,
        plan: form.planLevel ? { level: form.planLevel, date: form.planDate } : null,
        goalId: form.goalId || null,
        keyResultId: form.keyResultId || null,
        estimateMinutes: estimate,
        dueDate: form.dueDate || null,
        focus: form.focus,
      },
      { onSuccess: onDone },
    );
  };

  const del = () => {
    if (task && window.confirm(`"${task.title}" vazifasi o'chirilsinmi?`))
      remove.mutate(task.id, { onSuccess: onDone });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {task?.recurrenceId && (
        <Badge tone="info">
          <Repeat className="size-3" /> Takrorlanuvchi seriyadan — o'zgarish faqat shu kunga tegishli
        </Badge>
      )}
      <Field label="Nomi">
        <Input autoFocus={!task} required value={form.title} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <Field label="Izoh">
        <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Holat">
          <Select value={form.status} onChange={(e) => set("status", e.target.value as TaskStatus)}>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ustuvorlik">
          <Select value={form.priority} onChange={(e) => set("priority", Number(e.target.value))}>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Reja">
          <Select value={form.planLevel} onChange={(e) => set("planLevel", e.target.value as PlanLevel | "")}>
            <option value="">Rejalashtirilmagan</option>
            {PLAN_LEVELS.map((l) => (
              <option key={l} value={l}>
                {PLAN_LEVEL_LABEL[l]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={form.planLevel === "day" || !form.planLevel ? "Sana" : "Davr ichidagi sana"}>
          <Input
            type="date"
            disabled={!form.planLevel}
            value={form.planDate}
            onChange={(e) => set("planDate", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Maqsad">
        <Select
          value={form.goalId}
          onChange={(e) => setForm((f) => ({ ...f, goalId: e.target.value, keyResultId: "" }))}
        >
          <option value="">— bog'lanmagan —</option>
          {missingGoal && <option value={form.goalId}>(boshqa davrdagi maqsad)</option>}
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {LEVEL_LABEL[g.level]} · {g.title}
            </option>
          ))}
        </Select>
      </Field>
      {goal && goal.keyResults.length > 0 && (
        <Field label="Key result">
          <Select value={form.keyResultId} onChange={(e) => set("keyResultId", e.target.value)}>
            <option value="">— maqsadning o'zi —</option>
            {goal.keyResults.map((kr) => (
              <option key={kr.id} value={kr.id}>
                {kr.title}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Taxminiy vaqt (daqiqa)">
          <Input inputMode="numeric" value={form.estimate} onChange={(e) => set("estimate", e.target.value)} />
        </Field>
        <Field label="Muddat">
          <Input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-[var(--primary)]"
          checked={form.focus}
          onChange={(e) => set("focus", e.target.checked)}
        />
        Kunning fokus vazifasi ("Bugun" sahifasida yuqorida)
      </label>

      {save.error && <p className="text-sm text-destructive">{save.error.message}</p>}
      {remove.error && <p className="text-sm text-destructive">{remove.error.message}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={invalid || save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" />} {task ? "Saqlash" : "Yaratish"}
        </Button>
        {task && (
          <Button
            type="button"
            variant="outline"
            className="ml-auto text-destructive"
            onClick={del}
            disabled={remove.isPending}
          >
            <Trash2 /> O'chirish
          </Button>
        )}
      </div>
    </form>
  );
}
