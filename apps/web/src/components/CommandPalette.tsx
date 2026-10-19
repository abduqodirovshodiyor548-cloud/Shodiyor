import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, Check, CircleDot, Loader2, Plus, Search, Target } from "lucide-react";
import {
  parseQuickAdd,
  periodKey,
  periodOf,
  toLocalIsoDate,
  type GoalDto,
  type QuickAddResult,
  type TaskDto,
  type TaskPlanInput,
} from "@loiha/shared";
import { flattenTree, planningApi, usePlanningMutation, useGoalTree, useTags } from "@/lib/planning";
import { cn } from "@/lib/utils";
import { LEVEL_LABEL, PRIORITIES, dayTitle, periodTitle, planShort } from "@/routes/goals/labels";
import { TaskSheet, type TaskTarget } from "@/routes/goals/TaskSheet";

// S1-11: Ctrl/Cmd+K — tezkor qo'shish (#teg, !1–3, @bugun/@ertaga/@hafta/@oy/@kun/@sana),
// vazifa va maqsadlarni qidirish hamda sahifalarga o'tish.

const GOAL_VIEW = { year: "yil", quarter: "kvartal", month: "oy", week: "hafta" } as const;

interface Item {
  id: string;
  icon: ReactNode;
  label: ReactNode;
  hint?: ReactNode;
  run: () => void;
}

function planLabel(plan: TaskPlanInput | null, today: string): string {
  if (!plan) return "rejasiz";
  if (plan.level === "day") return plan.date === today ? "bugun" : dayTitle(plan.date);
  return periodTitle(periodOf(plan.level, plan.date));
}

/** Kiritilgan matn kechikish bilan (har harfda so'rov yubormaslik uchun). */
function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [active, setActive] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [taskSheet, setTaskSheet] = useState<{ target: TaskTarget; task: TaskDto } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const today = toLocalIsoDate();

  const parsed = useMemo(() => parseQuickAdd(text, today), [text, today]);
  const q = useDebounced(parsed.title.trim(), 150);
  const tags = useTags();
  const tree = useGoalTree(undefined, taskSheet !== null);
  const searchEnabled = open && q.length >= 2;
  const taskResults = useQuery({
    queryKey: ["tasks", "search", q],
    queryFn: () => planningApi.taskQuery({ q, limit: "8" }),
    enabled: searchEnabled,
  });
  const goalResults = useQuery({
    queryKey: ["goals", "search", q],
    queryFn: () => planningApi.goals({ q }),
    enabled: searchEnabled,
  });

  const create = usePlanningMutation(async (input: QuickAddResult) => {
    // Teglar nomi bo'yicha (katta-kichikka qaramay) topiladi, yo'qlari yaratiladi.
    const tagIds: string[] = [];
    for (const name of input.tags) {
      const existing = tags.data?.find((t) => t.name.toLowerCase() === name.toLowerCase());
      tagIds.push(existing ? existing.id : (await planningApi.createTag({ name })).id);
    }
    return planningApi.createTask({
      title: input.title,
      plan: input.plan,
      ...(input.priority !== null ? { priority: input.priority } : {}),
      tagIds,
    });
  });

  const close = () => {
    onOpenChange(false);
    setText("");
    setNotice(null);
    create.reset();
  };
  const go = (to: string, search?: Record<string, string>) => {
    close();
    void navigate({ to, search } as Parameters<typeof navigate>[0]);
  };

  const items: Item[] = [];
  if (parsed.title.trim()) {
    items.push({
      id: "create",
      icon: create.isPending ? <Loader2 className="animate-spin" /> : <Plus />,
      label: (
        <span>
          Vazifa qo'shish: <span className="font-medium">{parsed.title}</span>
        </span>
      ),
      hint: [
        planLabel(parsed.plan, today),
        ...parsed.tags.map((t) => `#${t}`),
        parsed.priority ? PRIORITIES[parsed.priority]!.label.toLowerCase() : null,
      ]
        .filter(Boolean)
        .join(" · "),
      run: () => {
        // Matn darhol tozalanadi — keyingi vazifani kutmasdan yozish mumkin; xato bo'lsa qaytariladi.
        const input = parsed;
        const original = text;
        setText("");
        setNotice(null);
        create.mutate(input, {
          onSuccess: (task) => setNotice(`Qo'shildi: ${task.title} (${planLabel(input.plan, today)})`),
          onError: () => setText((t) => t || original),
        });
      },
    });
  }
  for (const t of (searchEnabled ? taskResults.data : undefined) ?? []) {
    items.push({
      id: `task-${t.id}`,
      icon: t.status === "done" ? <Check className="text-success" /> : <CircleDot />,
      label: <span className={cn(t.status === "done" && "text-muted-foreground line-through")}>{t.title}</span>,
      hint: planShort(t) ?? "rejasiz",
      run: () => setTaskSheet({ target: { kind: "edit", id: t.id }, task: t }),
    });
  }
  for (const g of ((searchEnabled ? goalResults.data : undefined) ?? []).slice(0, 6) as GoalDto[]) {
    items.push({
      id: `goal-${g.id}`,
      icon: <Target />,
      label: g.title,
      hint: `${LEVEL_LABEL[g.level]} · ${periodTitle({ level: g.level, start: g.periodStart, end: g.periodEnd }, g.level !== "year")}`,
      run: () => go("/maqsadlar", { view: GOAL_VIEW[g.level], period: g.periodKey }),
    });
  }
  const nav: Item[] = [
    { id: "nav-today", icon: <CalendarCheck />, label: "Bugun", run: () => go("/bugun") },
    {
      id: "nav-week",
      icon: <ArrowRight />,
      label: "Shu hafta",
      run: () => go("/maqsadlar", { view: "hafta", period: periodKey(periodOf("week", today)) }),
    },
    { id: "nav-year", icon: <ArrowRight />, label: "Yillik maqsadlar", run: () => go("/maqsadlar") },
    { id: "nav-ai", icon: <ArrowRight />, label: "AI konsol", run: () => go("/ai") },
  ];
  const lowered = parsed.title.trim().toLowerCase();
  items.push(...nav.filter((n) => !lowered || String(n.label).toLowerCase().includes(lowered)));

  const current = Math.min(active, Math.max(items.length - 1, 0));
  useEffect(() => setActive(0), [text]);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
        <div className="absolute inset-0 bg-black/40" onClick={close} />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Buyruqlar palitrasi"
          className="relative w-full max-w-xl overflow-hidden rounded-xl border bg-background shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") close();
                else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((current + 1) % Math.max(items.length, 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((current - 1 + items.length) % Math.max(items.length, 1));
                } else if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  items[current]?.run();
                }
              }}
              placeholder="Vazifa yozing yoki qidiring…  #teg !3 @ertaga"
              aria-label="Buyruq yoki vazifa"
              role="combobox"
              aria-expanded="true"
              aria-controls="command-results"
              aria-activedescendant={items[current] ? `cmd-${items[current].id}` : undefined}
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul id="command-results" role="listbox" className="max-h-[50vh] overflow-auto p-1.5">
            {items.map((it, i) => (
              <li
                key={it.id}
                id={`cmd-${it.id}`}
                role="option"
                aria-selected={i === current}
                onMouseMove={() => setActive(i)}
                onClick={() => it.run()}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
                  i === current && "bg-accent",
                )}
              >
                {it.icon}
                <span className="min-w-0 flex-1 truncate">{it.label}</span>
                {it.hint && <span className="shrink-0 text-xs text-muted-foreground">{it.hint}</span>}
              </li>
            ))}
            {searchEnabled && (taskResults.isFetching || goalResults.isFetching) && (
              <li className="flex items-center gap-2 px-2.5 py-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Qidirilmoqda…
              </li>
            )}
          </ul>
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            {create.isError ? (
              <span className="text-destructive">Qo'shib bo'lmadi: {create.error.message}</span>
            ) : notice ? (
              <span className="text-success">{notice}</span>
            ) : (
              <span>
                <kbd>↑↓</kbd> tanlash · <kbd>Enter</kbd> bajarish · <kbd>Esc</kbd> yopish · #teg, !1–3,
                @bugun/@ertaga/@hafta/@oy/@juma
              </span>
            )}
          </div>
        </div>
      </div>
      {taskSheet && (
        <TaskSheet
          target={taskSheet.target}
          tasks={[taskSheet.task]}
          goals={flattenTree(tree.data ?? [])}
          onClose={() => setTaskSheet(null)}
        />
      )}
    </>
  );
}

/** Ctrl+K / Cmd+K bilan ochiladigan palitra holati. */
export function useCommandPaletteShortcut(setOpen: (fn: (open: boolean) => boolean) => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // `code` — klaviatura tartibidan qat'i nazar (kirillda ham) K tugmasi.
      if ((e.ctrlKey || e.metaKey) && (e.code === "KeyK" || e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
}
