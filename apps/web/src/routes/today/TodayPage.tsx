import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowDownToLine, CalendarRange, ChevronLeft, ChevronRight, Loader2, Star } from "lucide-react";
import { addDays, periodKey, periodOf, toLocalIsoDate, type TaskDto } from "@loiha/shared";
import { Button, Card, Progress } from "@/components/ui";
import { flattenTree, planningApi, usePlanningMutation, useGoalTree, useTaskQuery, useTasks } from "@/lib/planning";
import { cn } from "@/lib/utils";
import { GoalCard } from "@/routes/goals/GoalCard";
import { GoalSheet, type SheetTarget } from "@/routes/goals/GoalSheet";
import { dayTitle } from "@/routes/goals/labels";
import { TaskSheet, type TaskTarget } from "@/routes/goals/TaskSheet";
import { TaskDnd } from "@/routes/goals/dnd";
import { Section, byStatusPriority, type RowAction } from "@/routes/goals/TaskViews";

// S1-09: "Bugun" — kunning fokus vazifalari (1–3 ta), qolgan kunlik vazifalar, muddati o'tganlar va
// hafta/oy davomidagi vazifalardan bugunga olish. Sana URL'da (`?date=`), standart — bugun.

/** Tavsiya etilgan fokus vazifalari soni; undan ko'pi ogohlantiriladi, taqiqlanmaydi. */
const FOCUS_LIMIT = 3;
const open = (t: TaskDto) => t.status === "todo" || t.status === "in_progress";

function minutesText(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h} soat${m ? ` ${m} daq` : ""}` : `${m} daq`;
}

export function TodayPage({ date: dateParam }: { date?: string }) {
  const navigate = useNavigate({ from: "/bugun" });
  const today = toLocalIsoDate();
  const date = dateParam ?? today;
  const isToday = date === today;
  const week = periodOf("week", date);

  const tasks = useTasks(date);
  const overdue = useTaskQuery(
    { to: addDays(today, -1), planLevel: "day", status: "todo,in_progress", limit: "200" },
    isToday,
  );
  const tree = useGoalTree(periodKey(week));
  const goals = useMemo(() => flattenTree(tree.data ?? []), [tree.data]);
  const [taskSheet, setTaskSheet] = useState<TaskTarget | null>(null);
  const [goalSheet, setGoalSheet] = useState<SheetTarget | null>(null);

  const update = usePlanningMutation(
    ({ id, ...input }: { id: string } & Parameters<typeof planningApi.updateTask>[1]) =>
      planningApi.updateTask(id, input),
  );
  const go = (d: string) => navigate({ search: d === today ? {} : { date: d } });

  const all = tasks.data ?? [];
  const day = all.filter((t) => t.planLevel === "day");
  const focus = day.filter((t) => t.focus).sort(byStatusPriority);
  const rest = day.filter((t) => !t.focus).sort(byStatusPriority);
  const later = all.filter((t) => t.planLevel !== "day" && open(t)).sort(byStatusPriority);
  const counted = day.filter((t) => t.status !== "cancelled");
  const done = counted.filter((t) => t.status === "done").length;
  const leftMinutes = day.filter(open).reduce((s, t) => s + (t.estimateMinutes ?? 0), 0);
  const weekGoals = goals.filter((g) => g.level === "week" && g.periodStart === week.start && g.status !== "dropped");

  const star: RowAction = (t) => (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-7", t.focus ? "text-warning" : "text-muted-foreground/60 hover:text-warning")}
      aria-label={t.focus ? "Fokusdan olish" : "Fokusga qo'shish"}
      aria-pressed={t.focus}
      disabled={update.isPending}
      onClick={() => update.mutate({ id: t.id, focus: !t.focus })}
    >
      <Star className={cn(t.focus && "fill-current")} />
    </Button>
  );
  const toThisDay: RowAction = (t) => (
    <Button
      variant="outline"
      size="sm"
      className="h-7 text-xs"
      disabled={update.isPending}
      onClick={() => update.mutate({ id: t.id, plan: { level: "day", date } })}
    >
      <ArrowDownToLine /> {isToday ? "Bugunga" : "Shu kunga"}
    </Button>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-semibold tracking-tight">{isToday ? "Bugun" : dayTitle(date)}</h1>
          {isToday && <p className="text-sm text-muted-foreground">{dayTitle(date)}</p>}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" aria-label="Oldingi kun" onClick={() => go(addDays(date, -1))}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon" aria-label="Keyingi kun" onClick={() => go(addDays(date, 1))}>
            <ChevronRight />
          </Button>
          {!isToday && (
            <Button variant="ghost" size="sm" onClick={() => go(today)}>
              Bugun
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/maqsadlar" search={{ view: "hafta", period: periodKey(week) }}>
              <CalendarRange /> Hafta
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="space-y-2 p-4">
          <div className="text-xs text-muted-foreground">Bajarildi</div>
          <div className="text-xl font-semibold tabular-nums">
            {done} / {counted.length}
          </div>
          <Progress value={counted.length ? done / counted.length : 0} />
        </Card>
        <Card className="space-y-2 p-4">
          <div className="text-xs text-muted-foreground">Fokus</div>
          <div className="text-xl font-semibold tabular-nums">
            {focus.filter((t) => t.status === "done").length} / {focus.length}
          </div>
          <Progress value={focus.length ? focus.filter((t) => t.status === "done").length / focus.length : 0} />
        </Card>
        <Card className="space-y-2 p-4">
          <div className="text-xs text-muted-foreground">Qolgan reja vaqti</div>
          <div className="text-xl font-semibold tabular-nums">{leftMinutes ? minutesText(leftMinutes) : "—"}</div>
          <div className="text-xs text-muted-foreground">ochiq vazifalarning taxminiy vaqti</div>
        </Card>
      </div>

      {tasks.isPending ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Yuklanmoqda…
        </div>
      ) : tasks.isError ? (
        <p className="text-sm text-destructive">Vazifalarni yuklab bo'lmadi: {tasks.error.message}</p>
      ) : (
        <TaskDnd>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Section
                title={
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="size-4 fill-warning text-warning" /> Fokus
                  </span>
                }
                sub={
                  focus.length > FOCUS_LIMIT
                    ? `${FOCUS_LIMIT} tadan ko'p — eng muhimlarini qoldiring`
                    : `kunning eng muhim ${FOCUS_LIMIT} ta vazifasi`
                }
                className="border-warning/40"
                tasks={focus}
                goals={goals}
                showPlan={false}
                onOpen={setTaskSheet}
                action={star}
                empty="Quyidagi vazifalardan eng muhimlarini yulduzcha bilan belgilang yoki shu yerga yozing."
                add={{ plan: { level: "day", date }, placeholder: "Fokus vazifa…", extra: { focus: true } }}
                drop={{ id: "today-focus", target: { kind: "plan", plan: { level: "day", date }, focus: true } }}
              />
              <Section
                title="Boshqa vazifalar"
                tasks={rest}
                goals={goals}
                showPlan={false}
                onOpen={setTaskSheet}
                action={star}
                empty={day.length === 0 ? "Bu kun uchun vazifa yo'q." : undefined}
                add={{ plan: { level: "day", date }, placeholder: "Vazifa qo'shish…" }}
                drop={{ id: "today-rest", target: { kind: "plan", plan: { level: "day", date }, focus: false } }}
              />
              {isToday && (overdue.data?.length ?? 0) > 0 && (
                <Section
                  title="Muddati o'tgan"
                  sub="oldingi kunlardan qolgan"
                  className="border-destructive/40"
                  tasks={[...overdue.data!].sort((a, b) => (a.planStart ?? "").localeCompare(b.planStart ?? ""))}
                  goals={goals}
                  showPlan
                  onOpen={setTaskSheet}
                  action={toThisDay}
                />
              )}
            </div>

            <aside className="space-y-4">
              <section className="space-y-2">
                <h2 className="text-sm font-medium text-muted-foreground">Shu hafta maqsadlari</h2>
                {weekGoals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Haftalik maqsad yo'q.{" "}
                    <Link
                      to="/maqsadlar"
                      search={{ view: "hafta", period: periodKey(week) }}
                      className="text-primary hover:underline"
                    >
                      Qo'shish
                    </Link>
                  </p>
                ) : (
                  weekGoals.map((g) => (
                    <GoalCard key={g.id} goal={g} compact onOpen={(id) => setGoalSheet({ kind: "edit", id })} />
                  ))
                )}
              </section>
              {later.length > 0 && (
                <Section
                  title="Hafta va oy davomida"
                  sub="kun belgilanmagan"
                  tasks={later}
                  goals={goals}
                  showPlan
                  onOpen={setTaskSheet}
                  action={toThisDay}
                />
              )}
            </aside>
          </div>
        </TaskDnd>
      )}

      <TaskSheet
        target={taskSheet}
        tasks={[...all, ...(overdue.data ?? [])]}
        goals={goals}
        onClose={() => setTaskSheet(null)}
      />
      <GoalSheet target={goalSheet} goals={goals} onClose={() => setGoalSheet(null)} onOpen={setGoalSheet} />
    </div>
  );
}
