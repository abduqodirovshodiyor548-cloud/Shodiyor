import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Home,
  Menu,
  Monitor,
  Moon,
  Settings,
  Sparkles,
  Sun,
  Target,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { useHealth } from "@/lib/api";
import { useTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const NAV: { to: string; label: string; icon: LucideIcon; sprint?: string }[] = [
  { to: "/", label: "Bosh sahifa", icon: Home },
  { to: "/bugun", label: "Bugun", icon: CalendarCheck },
  { to: "/ai", label: "AI konsol", icon: Sparkles },
  { to: "/maqsadlar", label: "Maqsadlar", icon: Target, sprint: "S1" },
  { to: "/kalendar", label: "Kalendar", icon: CalendarDays, sprint: "S2" },
  { to: "/bilim-bazasi", label: "Bilim bazasi", icon: BookOpen, sprint: "S3" },
  { to: "/instrumentlar", label: "Instrumentlar", icon: Wrench, sprint: "S5" },
  { to: "/sozlamalar", label: "Sozlamalar", icon: Settings, sprint: "S9" },
];

const THEMES: { value: Theme; icon: LucideIcon; label: string }[] = [
  { value: "light", icon: Sun, label: "Yorug'" },
  { value: "dark", icon: Moon, label: "Qorong'i" },
  { value: "system", icon: Monitor, label: "Tizim" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-full">
      {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r bg-sidebar transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <span className="font-semibold tracking-tight">Dashboard</span>
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Menyuni yopish">
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 px-2">
          {NAV.map(({ to, label, icon: Icon, sprint }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              activeProps={{ className: "bg-accent !text-foreground font-medium" }}
            >
              <Icon className="size-4" />
              <span className="flex-1">{label}</span>
              {sprint && <span className="text-[10px] text-muted-foreground/70">{sprint}</span>}
            </Link>
          ))}
        </nav>
        <SidebarFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b px-4 md:hidden">
          <button onClick={() => setOpen(true)} aria-label="Menyuni ochish">
            <Menu className="size-5" />
          </button>
          <span className="font-semibold">Dashboard</span>
        </header>
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarFooter() {
  const { theme, setTheme } = useTheme();
  const health = useHealth();
  const ok = health.data?.ok && health.data.claude.available;

  return (
    <div className="space-y-3 border-t p-3">
      <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
        <span
          className={cn("size-2 rounded-full", health.isError ? "bg-destructive" : ok ? "bg-success" : "bg-warning")}
        />
        {health.isError ? "Server bilan aloqa yo'q" : ok ? "Server va Claude CLI tayyor" : "Tekshirilmoqda…"}
      </div>
      <div className="flex rounded-md bg-muted p-0.5">
        {THEMES.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={label}
            aria-pressed={theme === value}
            className={cn(
              "flex flex-1 items-center justify-center rounded py-1 text-muted-foreground",
              theme === value && "bg-card text-foreground shadow-xs",
            )}
          >
            <Icon className="size-3.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
