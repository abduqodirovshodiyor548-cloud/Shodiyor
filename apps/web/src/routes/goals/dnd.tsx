import { useState, type HTMLAttributes, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { periodOf, type TaskDto, type TaskPlanInput, type TaskStatus, type UpdateTaskInput } from "@loiha/shared";
import { planningApi } from "@/lib/planning";
import { cn } from "@/lib/utils";

// S1-10: vazifani sudrab ko'chirish (dnd-kit). Tashlash nishoni — bo'lim (reja: kun/hafta/oy, ixtiyoriy fokus)
// yoki kanban ustuni (holat). Ko'chirish optimistik: keshdagi vazifa darhol yangilanadi, xato bo'lsa qayta yuklanadi.

export type DropTarget =
  { kind: "plan"; plan: TaskPlanInput; focus?: boolean } | { kind: "status"; status: TaskStatus };

/** Nishon vazifaga hech narsa o'zgartirmasa — `null`. */
function patchFor(task: TaskDto, target: DropTarget): UpdateTaskInput | null {
  if (target.kind === "status") return task.status === target.status ? null : { status: target.status };
  const start = periodOf(target.plan.level, target.plan.date).start;
  const samePlan = task.planLevel === target.plan.level && task.planStart === start;
  const sameFocus = target.focus === undefined || task.focus === target.focus;
  if (samePlan && sameFocus) return null;
  return { ...(samePlan ? {} : { plan: target.plan }), ...(target.focus === undefined ? {} : { focus: target.focus }) };
}

/** Keshdagi vazifaga yamoqni qo'llash (server javobini kutmasdan). */
function applyPatch(task: TaskDto, patch: UpdateTaskInput): TaskDto {
  const next = { ...task };
  if (patch.status) next.status = patch.status;
  if (patch.focus !== undefined) next.focus = patch.focus;
  if (patch.plan) {
    next.planLevel = patch.plan.level;
    next.planStart = periodOf(patch.plan.level, patch.plan.date).start;
  }
  return next;
}

function useMoveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateTaskInput }) => planningApi.updateTask(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      qc.setQueriesData<TaskDto[]>({ queryKey: ["tasks"] }, (old) =>
        Array.isArray(old) ? old.map((t) => (t.id === id ? applyPatch(t, patch) : t)) : old,
      );
    },
    // Muvaffaqiyatda ham: progress (maqsadlar) va boshqa davr ro'yxatlari serverdan yangilanadi.
    onSettled: () =>
      Promise.all([qc.invalidateQueries({ queryKey: ["tasks"] }), qc.invalidateQueries({ queryKey: ["goals"] })]),
  });
}

/** Sudrab ko'chirish konteksti: ichidagi `DraggableTask` va `useDropTarget` bilan ishlaydi. */
export function TaskDnd({ children }: { children: ReactNode }) {
  const sensors = useSensors(
    // 6px siljimaguncha sudrash boshlanmaydi — oddiy bosish (panelni ochish, checkbox) ishlayveradi.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // Enter panelni ochish uchun band — klaviaturada sudrash Space bilan boshlanadi.
    useSensor(KeyboardSensor, {
      keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space", "Enter"] },
    }),
  );
  const move = useMoveTask();
  const [active, setActive] = useState<TaskDto | null>(null);

  const onDragStart = (e: DragStartEvent) => setActive((e.active.data.current?.task as TaskDto | undefined) ?? null);
  const onDragEnd = (e: DragEndEvent) => {
    setActive(null);
    const task = e.active.data.current?.task as TaskDto | undefined;
    const target = e.over?.data.current?.target as DropTarget | undefined;
    if (!task || !target) return;
    const patch = patchFor(task, target);
    if (patch) move.mutate({ id: task.id, patch });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActive(null)}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            "Vazifani ko'chirish uchun bo'sh joy tugmasini bosing, strelkalar bilan siljiting va yana bo'sh joy bilan tashlang. Bekor qilish — Esc.",
        },
      }}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {active && (
          <div className="max-w-sm cursor-grabbing rounded-lg border bg-card px-3 py-2 text-sm shadow-lg">
            {active.title}
          </div>
        )}
      </DragOverlay>
      {move.isError && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-destructive px-4 py-2 text-sm text-white shadow-lg"
        >
          Ko'chirib bo'lmadi: {move.error.message}
        </div>
      )}
    </DndContext>
  );
}

/** Sudraladigan vazifa elementi uchun ref, tinglovchilar va holat klassi. */
export function useDraggableTask(task: TaskDto, enabled = true) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: task.id,
    data: { task },
    disabled: !enabled,
  });
  return {
    ref: setNodeRef,
    // Element hodisalari bilan birlashtirish uchun (masalan kartadagi Enter) oddiy HTML atributlari sifatida.
    props: { ...attributes, ...listeners } as HTMLAttributes<HTMLElement>,
    className: cn(enabled && "touch-none", isDragging && "opacity-40"),
  };
}

/** Tashlash nishoni; `isOver` — ustida sudralayotgan vazifa bor. */
export function useDropTarget(id: string, target: DropTarget | undefined) {
  const { setNodeRef, isOver, active } = useDroppable({ id, data: { target }, disabled: !target });
  return { ref: setNodeRef, isOver: isOver && !!active };
}
