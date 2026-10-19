import { useState, type FormEvent } from "react";
import { ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import {
  GOAL_LEVELS,
  GOAL_STATUSES,
  periodOf,
  periodsWithin,
  toLocalIsoDate,
  type GoalLevel,
  type GoalStatus,
  type GoalTreeNode,
  type KeyResultDto,
  type Period,
} from "@loiha/shared";
import { Badge, Button, Field, Input, Progress, Select, Sheet, Textarea } from "@/components/ui";
import { planningApi, usePlanningMutation } from "@/lib/planning";
import { cn } from "@/lib/utils";
import { LEVEL_LABEL, STATUS_LABEL, goalPeriod, periodTitle } from "./labels";

export type SheetTarget =
  { kind: "edit"; id: string } | { kind: "create"; level: GoalLevel; date: string; parentId?: string };

const rank = (level: GoalLevel) => GOAL_LEVELS.indexOf(level);

/** Ota bo'la oladigan maqsadlar: darajasi yuqori va davri to'liq qamragan (server ham shuni tekshiradi). */
function parentOptions(goals: GoalTreeNode[], level: GoalLevel, period: Period, selfId?: string) {
  return goals.filter(
    (g) => g.id !== selfId && rank(g.level) < rank(level) && g.periodStart <= period.start && g.periodEnd >= period.end,
  );
}

function ErrorText({ error }: { error: unknown }) {
  if (!error) return null;
  return <p className="text-sm text-destructive">{error instanceof Error ? error.message : String(error)}</p>;
}

export function GoalSheet({
  target,
  goals,
  onClose,
  onOpen,
}: {
  target: SheetTarget | null;
  goals: GoalTreeNode[];
  onClose: () => void;
  onOpen: (target: SheetTarget) => void;
}) {
  const goal = target?.kind === "edit" ? goals.find((g) => g.id === target.id) : undefined;
  const title =
    target?.kind === "create"
      ? `Yangi ${LEVEL_LABEL[target.level].toLowerCase()} maqsad`
      : goal
        ? `${LEVEL_LABEL[goal.level]} maqsad · ${periodTitle(goalPeriod(goal), goal.level !== "year")}`
        : "Maqsad";

  return (
    <Sheet open={target !== null} onClose={onClose} title={title}>
      {target?.kind === "create" && (
        <CreateGoalForm
          key={`${target.level}-${target.date}-${target.parentId}`}
          target={target}
          goals={goals}
          onCreated={(id) => onOpen({ kind: "edit", id })}
        />
      )}
      {target?.kind === "edit" &&
        (goal ? (
          <EditGoal key={goal.id} goal={goal} goals={goals} onOpen={onOpen} onDeleted={onClose} />
        ) : (
          <p className="text-sm text-muted-foreground">Maqsad bu davr ko'rinishida topilmadi.</p>
        ))}
    </Sheet>
  );
}

function CreateGoalForm({
  target,
  goals,
  onCreated,
}: {
  target: Extract<SheetTarget, { kind: "create" }>;
  goals: GoalTreeNode[];
  onCreated: (id: string) => void;
}) {
  const [date, setDate] = useState(target.date);
  const period = periodOf(target.level, date);
  // Davr tanlovi: shu yil ichidagi `level` davrlari (yillik maqsad uchun tanlov yo'q).
  const choices = target.level === "year" ? [] : periodsWithin(target.level, periodOf("year", target.date));
  const parents = parentOptions(goals, target.level, period);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState(target.parentId ?? "");
  const changePeriod = (start: string) => {
    setDate(start);
    const next = parentOptions(goals, target.level, periodOf(target.level, start));
    if (!next.some((p) => p.id === parentId)) setParentId("");
  };
  const create = usePlanningMutation(planningApi.createGoal);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate(
      {
        level: target.level,
        date,
        title,
        description: description.trim() || null,
        parentId: parentId || null,
      },
      { onSuccess: (g) => onCreated(g.id) },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Nomi">
        <Input
          autoFocus
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masalan: 12 ta kitob o'qish"
        />
      </Field>
      <Field label="Izoh">
        <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      {target.level === "year" ? (
        <p className="text-sm text-muted-foreground">
          Davr: <span className="font-medium text-foreground">{periodTitle(period)}</span>
        </p>
      ) : (
        <Field label="Davr">
          <Select value={period.start} onChange={(e) => changePeriod(e.target.value)}>
            {choices.map((c) => (
              <option key={c.start} value={c.start}>
                {periodTitle(c, true)}
              </option>
            ))}
          </Select>
        </Field>
      )}
      {target.level !== "year" && (
        <Field label="Ota maqsad">
          <Select value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">— bog'lanmagan —</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {LEVEL_LABEL[p.level]} · {p.title}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <ErrorText error={create.error} />
      <Button type="submit" disabled={!title.trim() || create.isPending}>
        {create.isPending && <Loader2 className="animate-spin" />} Yaratish
      </Button>
    </form>
  );
}

function EditGoal({
  goal,
  goals,
  onOpen,
  onDeleted,
}: {
  goal: GoalTreeNode;
  goals: GoalTreeNode[];
  onOpen: (target: SheetTarget) => void;
  onDeleted: () => void;
}) {
  const parents = parentOptions(goals, goal.level, goalPeriod(goal), goal.id);
  const [form, setForm] = useState({
    title: goal.title,
    description: goal.description ?? "",
    status: goal.status,
    parentId: goal.parentId ?? "",
  });
  const update = usePlanningMutation((input: Parameters<typeof planningApi.updateGoal>[1]) =>
    planningApi.updateGoal(goal.id, input),
  );
  const remove = usePlanningMutation(planningApi.deleteGoal);
  const dirty =
    form.title !== goal.title ||
    form.description !== (goal.description ?? "") ||
    form.status !== goal.status ||
    form.parentId !== (goal.parentId ?? "");
  const childLevel = GOAL_LEVELS[rank(goal.level) + 1];

  const save = (e: FormEvent) => {
    e.preventDefault();
    update.mutate({
      title: form.title,
      description: form.description.trim() || null,
      status: form.status,
      parentId: form.parentId || null,
    });
  };

  const del = () => {
    const note =
      goal.children.length > 0 || goal.taskCounts.total > 0
        ? " Kichik maqsadlar va vazifalar saqlanadi, lekin bog'lanmagan bo'lib qoladi."
        : "";
    if (window.confirm(`"${goal.title}" maqsadi va uning key result'lari o'chirilsinmi?${note}`)) {
      remove.mutate(goal.id, { onSuccess: onDeleted });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium tabular-nums">{Math.round(goal.progress * 100)}%</span>
        </div>
        <Progress value={goal.progress} className="h-2" />
      </div>

      <form onSubmit={save} className="space-y-4">
        <Field label="Nomi">
          <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Izoh">
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Holat">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as GoalStatus })}>
              {GOAL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s].label}
                </option>
              ))}
            </Select>
          </Field>
          {goal.level !== "year" && (
            <Field label="Ota maqsad">
              <Select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                <option value="">— bog'lanmagan —</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {LEVEL_LABEL[p.level]} · {p.title}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>
        <ErrorText error={update.error} />
        {dirty && (
          <Button type="submit" disabled={!form.title.trim() || update.isPending}>
            {update.isPending && <Loader2 className="animate-spin" />} Saqlash
          </Button>
        )}
      </form>

      <KeyResults goal={goal} />

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Kichik maqsadlar</h3>
          {childLevel && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                // Bugun maqsad davri ichida bo'lsa — joriy kichik davr, aks holda birinchisi.
                const today = toLocalIsoDate();
                const date = goal.periodStart <= today && today <= goal.periodEnd ? today : goal.periodStart;
                onOpen({ kind: "create", level: childLevel, date, parentId: goal.id });
              }}
            >
              <Plus /> {LEVEL_LABEL[childLevel]}
            </Button>
          )}
        </div>
        {goal.children.length === 0 ? (
          <p className="text-sm text-muted-foreground">Hali yo'q.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {goal.children.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onOpen({ kind: "edit", id: c.id })}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <span className="min-w-0 flex-1 truncate">{c.title}</span>
                  <span className="text-xs text-muted-foreground">{periodTitle(goalPeriod(c))}</span>
                  <span className="w-9 text-right text-xs tabular-nums">{Math.round(c.progress * 100)}%</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="border-t pt-4">
        <ErrorText error={remove.error} />
        <Button variant="outline" size="sm" className="text-destructive" onClick={del} disabled={remove.isPending}>
          <Trash2 /> Maqsadni o'chirish
        </Button>
      </div>
    </div>
  );
}

function KeyResults({ goal }: { goal: GoalTreeNode }) {
  const [adding, setAdding] = useState(false);
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Key result'lar</h3>
        {!adding && (
          <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>
            <Plus /> Qo'shish
          </Button>
        )}
      </div>
      {goal.keyResults.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">O'lchanadigan natija qo'shing — progress shundan hisoblanadi.</p>
      )}
      {goal.keyResults.length > 0 && (
        <ul className="divide-y rounded-lg border">
          {goal.keyResults.map((kr) => (
            <KeyResultRow key={kr.id} kr={kr} />
          ))}
        </ul>
      )}
      {adding && <AddKeyResult goalId={goal.id} onDone={() => setAdding(false)} />}
    </section>
  );
}

function KeyResultRow({ kr }: { kr: KeyResultDto }) {
  const [value, setValue] = useState(String(kr.currentValue));
  const update = usePlanningMutation((currentValue: number) => planningApi.updateKeyResult(kr.id, { currentValue }));
  const remove = usePlanningMutation(planningApi.deleteKeyResult);
  const numeric = kr.targetValue !== null;

  const commit = () => {
    const n = Number(value.replace(",", "."));
    if (value.trim() === "" || !Number.isFinite(n)) return setValue(String(kr.currentValue));
    if (n !== kr.currentValue) update.mutate(n);
  };

  return (
    <li className="space-y-2 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 text-sm">{kr.title}</span>
        {numeric ? (
          <span className="flex items-center gap-1 text-sm">
            <Input
              aria-label="Joriy qiymat"
              inputMode="decimal"
              className={cn("h-7 w-16 px-2 text-right tabular-nums", update.isError && "border-destructive")}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
            />
            <span className="text-muted-foreground tabular-nums">
              / {kr.targetValue}
              {kr.unit ? ` ${kr.unit}` : ""}
            </span>
          </span>
        ) : (
          <Badge>vazifalardan</Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          aria-label="Key result'ni o'chirish"
          onClick={() => window.confirm(`"${kr.title}" o'chirilsinmi?`) && remove.mutate(kr.id)}
        >
          <Trash2 />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={kr.progress} className="flex-1" />
        <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
          {Math.round(kr.progress * 100)}%
        </span>
      </div>
    </li>
  );
}

function AddKeyResult({ goalId, onDone }: { goalId: string; onDone: () => void }) {
  const [form, setForm] = useState({ title: "", start: "0", target: "", unit: "" });
  const create = usePlanningMutation(planningApi.createKeyResult);
  const num = (s: string) => (s.trim() === "" ? null : Number(s.replace(",", ".")));
  const target = num(form.target);
  const start = num(form.start) ?? 0;
  const invalid = !form.title.trim() || (target !== null && !Number.isFinite(target)) || !Number.isFinite(start);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate(
      { goalId, title: form.title, startValue: start, targetValue: target, unit: form.unit.trim() || null },
      { onSuccess: onDone },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border bg-muted/40 p-3">
      <Field label="Natija">
        <Input
          autoFocus
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Masalan: Kitoblar soni"
        />
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Boshlang'ich">
          <Input inputMode="decimal" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
        </Field>
        <Field label="Maqsad">
          <Input
            inputMode="decimal"
            value={form.target}
            onChange={(e) => setForm({ ...form, target: e.target.value })}
            placeholder="ixtiyoriy"
          />
        </Field>
        <Field label="Birlik">
          <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="ta" />
        </Field>
      </div>
      <p className="text-xs text-muted-foreground">
        Maqsad qiymati bo'lmasa, progress bog'langan vazifalardan hisoblanadi.
      </p>
      <ErrorText error={create.error} />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={invalid || create.isPending}>
          {create.isPending && <Loader2 className="animate-spin" />} Qo'shish
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          Bekor qilish
        </Button>
      </div>
    </form>
  );
}
