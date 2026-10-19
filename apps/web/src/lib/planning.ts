import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateGoalInput,
  CreateKeyResultInput,
  GoalDto,
  GoalTreeNode,
  KeyResultDto,
  UpdateGoalInput,
  UpdateKeyResultInput,
} from "@loiha/shared";
import { request } from "@/lib/api";

// Maqsadlar va key result'lar API'si (S1-05/S1-06). Har qanday yozishdan keyin progress serverda qayta hisoblanadi,
// shuning uchun barcha maqsad so'rovlari (`["goals", …]`) yangilanadi.

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
};

export function useGoalTree(period: string) {
  return useQuery({ queryKey: ["goals", "tree", period], queryFn: () => planningApi.goalTree(period) });
}

/** Maqsad/KR yozish amallari; muvaffaqiyatdan keyin maqsad so'rovlari yangilanadi. */
export function usePlanningMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

/** Daraxtni tekis ro'yxatga aylantiradi (ota-bola tartibida). */
export function flattenTree(nodes: GoalTreeNode[]): GoalTreeNode[] {
  return nodes.flatMap((n) => [n, ...flattenTree(n.children)]);
}
