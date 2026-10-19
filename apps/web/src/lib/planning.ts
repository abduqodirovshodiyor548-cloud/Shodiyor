import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateGoalInput,
  CreateKeyResultInput,
  CreateTagInput,
  CreateTaskInput,
  GoalDto,
  GoalTreeNode,
  KeyResultDto,
  TagDto,
  TaskDto,
  UpdateGoalInput,
  UpdateKeyResultInput,
  UpdateTaskInput,
} from "@loiha/shared";
import { request } from "@/lib/api";

// Maqsadlar, key result'lar va vazifalar API'si (S1-05/S1-06). Har qanday yozishdan keyin progress serverda qayta
// hisoblanadi va maqsad o'chirilsa vazifalar bog'lanmagan bo'lib qoladi — shuning uchun ikkala so'rovlar guruhi
// (`["goals", …]`, `["tasks", …]`) yangilanadi.

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const planningApi = {
  /** `period` berilmasa — barcha maqsadlar daraxti (qidiruv palitrasi uchun). */
  goalTree: (period?: string) =>
    request<GoalTreeNode[]>(`/api/goals/tree${period ? `?period=${encodeURIComponent(period)}` : ""}`),
  goals: (params: Record<string, string>) => request<GoalDto[]>(`/api/goals?${new URLSearchParams(params)}`),
  tags: () => request<TagDto[]>("/api/tags"),
  createTag: (input: CreateTagInput) => request<TagDto>("/api/tags", json("POST", input)),
  createGoal: (input: CreateGoalInput) => request<GoalDto>("/api/goals", json("POST", input)),
  updateGoal: (id: string, input: UpdateGoalInput) => request<GoalDto>(`/api/goals/${id}`, json("PATCH", input)),
  deleteGoal: (id: string) => request<null>(`/api/goals/${id}`, json("DELETE")),
  createKeyResult: (input: CreateKeyResultInput) => request<KeyResultDto>("/api/key-results", json("POST", input)),
  updateKeyResult: (id: string, input: UpdateKeyResultInput) =>
    request<KeyResultDto>(`/api/key-results/${id}`, json("PATCH", input)),
  deleteKeyResult: (id: string) => request<null>(`/api/key-results/${id}`, json("DELETE")),
  tasks: (period: string) => request<TaskDto[]>(`/api/tasks?period=${encodeURIComponent(period)}&limit=1000`),
  /** Ixtiyoriy filtrlar bilan (S1-06: from/to, status, planLevel …). */
  taskQuery: (params: Record<string, string>) => request<TaskDto[]>(`/api/tasks?${new URLSearchParams(params)}`),
  createTask: (input: CreateTaskInput) => request<TaskDto>("/api/tasks", json("POST", input)),
  updateTask: (id: string, input: UpdateTaskInput) => request<TaskDto>(`/api/tasks/${id}`, json("PATCH", input)),
  deleteTask: (id: string) => request<null>(`/api/tasks/${id}`, json("DELETE")),
};

export function useGoalTree(period?: string, enabled = true) {
  return useQuery({
    queryKey: ["goals", "tree", period ?? "all"],
    queryFn: () => planningApi.goalTree(period),
    enabled,
  });
}

export function useTags() {
  return useQuery({ queryKey: ["tags"], queryFn: planningApi.tags, staleTime: 60_000 });
}

/** Davr bilan kesishadigan vazifalar (Q-043). */
export function useTasks(period: string, enabled = true) {
  return useQuery({ queryKey: ["tasks", period], queryFn: () => planningApi.tasks(period), enabled });
}

export function useTaskQuery(params: Record<string, string>, enabled = true) {
  return useQuery({ queryKey: ["tasks", "query", params], queryFn: () => planningApi.taskQuery(params), enabled });
}

/** Yozish amallari; muvaffaqiyatdan keyin maqsad va vazifa so'rovlari yangilanadi. */
export function usePlanningMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["goals"] }),
        qc.invalidateQueries({ queryKey: ["tasks"] }),
        qc.invalidateQueries({ queryKey: ["tags"] }),
      ]),
  });
}

/** Daraxtni tekis ro'yxatga aylantiradi (ota-bola tartibida). */
export function flattenTree(nodes: GoalTreeNode[]): GoalTreeNode[] {
  return nodes.flatMap((n) => [n, ...flattenTree(n.children)]);
}
