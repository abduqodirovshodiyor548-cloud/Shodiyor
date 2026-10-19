import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateGoalInput,
  CreateKeyResultInput,
  CreateTaskInput,
  GoalDto,
  GoalTreeNode,
  KeyResultDto,
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
  goalTree: (period: string) => request<GoalTreeNode[]>(`/api/goals/tree?period=${encodeURIComponent(period)}`),
  createGoal: (input: CreateGoalInput) => request<GoalDto>("/api/goals", json("POST", input)),
  updateGoal: (id: string, input: UpdateGoalInput) => request<GoalDto>(`/api/goals/${id}`, json("PATCH", input)),
  deleteGoal: (id: string) => request<null>(`/api/goals/${id}`, json("DELETE")),
  createKeyResult: (input: CreateKeyResultInput) => request<KeyResultDto>("/api/key-results", json("POST", input)),
  updateKeyResult: (id: string, input: UpdateKeyResultInput) =>
    request<KeyResultDto>(`/api/key-results/${id}`, json("PATCH", input)),
  deleteKeyResult: (id: string) => request<null>(`/api/key-results/${id}`, json("DELETE")),
  tasks: (period: string) => request<TaskDto[]>(`/api/tasks?period=${encodeURIComponent(period)}&limit=1000`),
  createTask: (input: CreateTaskInput) => request<TaskDto>("/api/tasks", json("POST", input)),
  updateTask: (id: string, input: UpdateTaskInput) => request<TaskDto>(`/api/tasks/${id}`, json("PATCH", input)),
  deleteTask: (id: string) => request<null>(`/api/tasks/${id}`, json("DELETE")),
};

export function useGoalTree(period: string) {
  return useQuery({ queryKey: ["goals", "tree", period], queryFn: () => planningApi.goalTree(period) });
}

/** Davr bilan kesishadigan vazifalar (Q-043). */
export function useTasks(period: string, enabled = true) {
  return useQuery({ queryKey: ["tasks", period], queryFn: () => planningApi.tasks(period), enabled });
}

/** Yozish amallari; muvaffaqiyatdan keyin maqsad va vazifa so'rovlari yangilanadi. */
export function usePlanningMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () =>
      Promise.all([qc.invalidateQueries({ queryKey: ["goals"] }), qc.invalidateQueries({ queryKey: ["tasks"] })]),
  });
}

/** Daraxtni tekis ro'yxatga aylantiradi (ota-bola tartibida). */
export function flattenTree(nodes: GoalTreeNode[]): GoalTreeNode[] {
  return nodes.flatMap((n) => [n, ...flattenTree(n.children)]);
}
