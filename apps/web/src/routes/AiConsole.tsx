import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ChevronRight, Loader2, Plus, Send, Square, Wrench } from "lucide-react";
import { TERMINAL_JOB_STATUSES, type JobDto, type JobStatus } from "@loiha/shared";
import { Badge, Button, Card, Textarea } from "@/components/ui";
import { api, useJobs } from "@/lib/api";
import { useJobStream, type StreamBlock } from "@/lib/useJobStream";
import { cn, formatDuration, formatTime } from "@/lib/utils";

const STATUS: Record<JobStatus, { label: string; tone: "neutral" | "info" | "success" | "warning" | "danger" }> = {
  queued: { label: "navbatda", tone: "neutral" },
  running: { label: "ishlayapti", tone: "info" },
  succeeded: { label: "tayyor", tone: "success" },
  failed: { label: "xato", tone: "danger" },
  cancelled: { label: "bekor qilindi", tone: "warning" },
};

const promptOf = (j: JobDto) => (typeof j.input.prompt === "string" ? j.input.prompt : String(j.input.text ?? j.kind));

export function AiConsolePage({ jobId }: { jobId: string | null }) {
  const navigate = useNavigate({ from: "/ai" });
  const qc = useQueryClient();
  const jobs = useJobs();
  const select = (id: string | null) => navigate({ search: id ? { job: id } : {} });

  return (
    <div className="flex h-full min-h-0">
      <aside className="hidden w-72 shrink-0 flex-col border-r lg:flex">
        <div className="flex h-14 items-center justify-between px-4">
          <span className="text-sm font-medium">Tarix</span>
          <Button size="sm" variant="outline" onClick={() => select(null)}>
            <Plus /> Yangi
          </Button>
        </div>
        <div className="flex-1 space-y-1 overflow-auto px-2 pb-4">
          {jobs.data?.length === 0 && <p className="px-2 text-sm text-muted-foreground">Hali so'rovlar yo'q</p>}
          {jobs.data?.map((j) => (
            <button
              key={j.id}
              onClick={() => select(j.id)}
              className={cn("w-full rounded-md px-3 py-2 text-left hover:bg-accent", j.id === jobId && "bg-accent")}
            >
              <div className="line-clamp-2 text-sm">{promptOf(j)}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge tone={STATUS[j.status].tone}>{STATUS[j.status].label}</Badge>
                <span>{formatTime(j.createdAt)}</span>
                {j.kind !== "claude" && <span>· {j.kind}</span>}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        {jobId ? (
          <JobView key={jobId} jobId={jobId} onChanged={() => qc.invalidateQueries({ queryKey: ["jobs"] })} />
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-center">
            <div>
              <h1 className="text-xl font-semibold">AI konsol</h1>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                So'rov Claude CLI orqali bajariladi. Claude dashboard ma'lumotlariga faqat dashboard-mcp tool'lari
                orqali kira oladi.
              </p>
            </div>
          </div>
        )}
        <Composer jobId={jobId} onCreated={(j) => select(j.id)} />
      </section>
    </div>
  );
}

function JobView({ jobId, onChanged }: { jobId: string; onChanged: () => void }) {
  const qc = useQueryClient();
  const job = useQuery({ queryKey: ["job", jobId], queryFn: () => api.job(jobId) });
  const stream = useJobStream(jobId, () => {
    void qc.invalidateQueries({ queryKey: ["job", jobId] });
    onChanged();
  });
  const cancel = useMutation({ mutationFn: () => api.cancelJob(jobId), onSuccess: onChanged });
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // scrollIntoView yangi brauzerlarda Promise qaytaradi — effektdan qaytarmaslik kerak
    void bottom.current?.scrollIntoView({ block: "end" });
  }, [stream.blocks]);

  const j = job.data;
  const status = stream.status ?? j?.status ?? null;
  const active = status === "queued" || status === "running";
  const error = stream.error ?? j?.error;

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {status && (
            <Badge tone={STATUS[status].tone}>
              {active && <Loader2 className="size-3 animate-spin" />}
              {STATUS[status].label}
            </Badge>
          )}
          {stream.meta?.model && <span>{stream.meta.model}</span>}
          {stream.meta?.mcpServers.map((s) => (
            <Badge key={s.name} tone={s.status === "connected" ? "success" : "warning"}>
              mcp: {s.name}
            </Badge>
          ))}
          {j?.costUsd != null && <span>${j.costUsd.toFixed(4)}</span>}
          {j && formatDuration(j.startedAt, j.finishedAt) && <span>{formatDuration(j.startedAt, j.finishedAt)}</span>}
          <span className="flex-1" />
          {active && (
            <Button size="sm" variant="outline" onClick={() => cancel.mutate()} disabled={cancel.isPending}>
              <Square /> To'xtatish
            </Button>
          )}
        </div>

        {j && (
          <div className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
            {promptOf(j)}
          </div>
        )}

        {stream.blocks.map((b, i) => (
          <Block key={i} block={b} />
        ))}

        {status === "running" && stream.blocks.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Claude ishga tushmoqda…
          </div>
        )}

        {error && (status === "failed" || status === "cancelled" || status === "queued") && (
          <Card className="flex gap-3 border-destructive/40 bg-destructive/5 p-4 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="min-w-0 whitespace-pre-wrap break-words">{error}</div>
          </Card>
        )}
        <div ref={bottom} />
      </div>
    </div>
  );
}

function Block({ block }: { block: StreamBlock }) {
  switch (block.kind) {
    case "text":
      return <div className="whitespace-pre-wrap text-sm leading-relaxed">{block.text}</div>;
    case "tool_use":
      return (
        <details className="group rounded-lg border bg-muted/40 text-xs">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2">
            <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" />
            <Wrench className="size-3.5 text-muted-foreground" />
            <span className="font-mono">{block.tool.name}</span>
          </summary>
          <pre className="overflow-auto border-t px-3 py-2 font-mono">{JSON.stringify(block.tool.input, null, 2)}</pre>
        </details>
      );
    case "tool_result":
      return (
        <pre
          className={cn(
            "max-h-60 overflow-auto rounded-lg border px-3 py-2 font-mono text-xs",
            block.isError ? "border-destructive/40 text-destructive" : "text-muted-foreground",
          )}
        >
          {block.content}
        </pre>
      );
    case "log":
      return <div className="font-mono text-xs text-warning">{block.message}</div>;
  }
}

function Composer({ jobId, onCreated }: { jobId: string | null; onCreated: (j: JobDto) => void }) {
  const qc = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [resume, setResume] = useState(true);
  const current = useQuery({ queryKey: ["job", jobId], queryFn: () => api.job(jobId!), enabled: !!jobId });
  const canResume =
    !!current.data?.claudeSessionId &&
    current.data.kind === "claude" &&
    TERMINAL_JOB_STATUSES.includes(current.data.status) &&
    current.data.status === "succeeded";

  const create = useMutation({
    mutationFn: () =>
      api.createClaudeJob({
        prompt,
        ...(canResume && resume ? { resumeSessionId: current.data!.claudeSessionId! } : {}),
      }),
    onSuccess: (j) => {
      setPrompt("");
      void qc.invalidateQueries({ queryKey: ["jobs"] });
      onCreated(j);
    },
  });

  const submit = () => prompt.trim() && !create.isPending && create.mutate();

  return (
    <div className="border-t bg-background p-4">
      <div className="mx-auto max-w-3xl space-y-2">
        <div className="relative">
          <Textarea
            rows={3}
            value={prompt}
            placeholder="Claude'ga so'rov yozing…  (⌘/Ctrl + Enter — yuborish)"
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            className="pr-14"
          />
          <Button
            size="icon"
            className="absolute right-2 bottom-2"
            onClick={submit}
            disabled={!prompt.trim() || create.isPending}
            aria-label="Yuborish"
          >
            {create.isPending ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {canResume ? (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={resume} onChange={(e) => setResume(e.target.checked)} />
              Shu suhbatni davom ettirish
            </label>
          ) : (
            <span>Yangi suhbat</span>
          )}
          {create.error && <span className="text-destructive">{create.error.message}</span>}
        </div>
      </div>
    </div>
  );
}
