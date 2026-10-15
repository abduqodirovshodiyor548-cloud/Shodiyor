import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { NAV } from "@/components/layout/AppShell";
import { useHealth } from "@/lib/api";

export function HomePage() {
  const health = useHealth();
  const h = health.data;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Xush kelibsiz</h1>
        <p className="text-sm text-muted-foreground">Lokal AI dashboard — Sprint 0: poydevor.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Server</div>
          <div className="mt-1 flex items-center gap-2 font-medium">
            {health.isError ? <Badge tone="danger">ulanmagan</Badge> : <Badge tone="success">ishlayapti</Badge>}
          </div>
          {h && <div className="mt-2 text-xs text-muted-foreground">Ish vaqti: {h.uptimeSec}s</div>}
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Claude CLI</div>
          <div className="mt-1 font-medium">
            {h ? (
              h.claude.available ? (
                <Badge tone="success">{h.claude.version}</Badge>
              ) : (
                <Badge tone="danger">topilmadi</Badge>
              )
            ) : (
              "—"
            )}
          </div>
          {h && !h.claude.available && <div className="mt-2 text-xs text-destructive">{h.claude.error}</div>}
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Job navbati</div>
          <div className="mt-1 font-medium tabular-nums">{h ? `${h.queue.running} / ${h.queue.concurrency}` : "—"}</div>
          <div className="mt-2 text-xs text-muted-foreground">ishlayotgan / limit</div>
        </Card>
      </div>

      <Card className="divide-y">
        {NAV.filter((n) => n.to !== "/").map((n) => (
          <Link key={n.to} to={n.to} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent">
            <n.icon className="size-4 text-muted-foreground" />
            <span className="flex-1">{n.label}</span>
            {n.sprint ? <Badge>{n.sprint} da</Badge> : <Badge tone="info">tayyor</Badge>}
            <ArrowRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </Card>
    </div>
  );
}

export function PlaceholderPage({ title, sprint }: { title: string; sprint: string }) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Bu bo'lim {sprint} sprintida quriladi.</p>
      </div>
    </div>
  );
}
