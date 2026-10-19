import { useQuery } from "@tanstack/react-query";
import type { CreateClaudeJobInput, JobDto } from "@loiha/shared";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  // 204 (DELETE) — tanasiz javob.
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(body?.error ?? `HTTP ${res.status}`, res.status);
  return body as T;
}

export interface Health {
  ok: boolean;
  uptimeSec: number;
  queue: { running: number; concurrency: number };
  claude: { bin: string; available: boolean; version: string | null; error?: string };
}

export const api = {
  health: () => request<Health>("/api/health"),
  jobs: () => request<JobDto[]>("/api/jobs?limit=50"),
  job: (id: string) => request<JobDto>(`/api/jobs/${id}`),
  createClaudeJob: (input: Partial<CreateClaudeJobInput> & { prompt: string }) =>
    request<JobDto>("/api/jobs/claude", { method: "POST", body: JSON.stringify(input) }),
  cancelJob: (id: string) => request<{ ok: boolean }>(`/api/jobs/${id}/cancel`, { method: "POST" }),
};

export function useHealth() {
  return useQuery({ queryKey: ["health"], queryFn: api.health, refetchInterval: 10_000, retry: false });
}

export function useJobs() {
  return useQuery({ queryKey: ["jobs"], queryFn: api.jobs, refetchInterval: 5_000 });
}
