import { Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AiConsolePage } from "@/routes/AiConsole";
import { HomePage, PlaceholderPage } from "@/routes/Home";
import { TodayPage } from "@/routes/today/TodayPage";
import { isIsoDate } from "@loiha/shared";
import { GOAL_VIEWS, GoalsPage, TASK_MODES, type GoalView } from "@/routes/goals/GoalsPage";
import type { TaskMode } from "@/routes/goals/TaskViews";

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
  notFoundComponent: () => <PlaceholderPage title="Sahifa topilmadi" sprint="—" />,
});

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: HomePage });

const aiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai",
  validateSearch: (s: Record<string, unknown>): { job?: string } => (typeof s.job === "string" ? { job: s.job } : {}),
  component: function AiRoute() {
    const { job } = aiRoute.useSearch();
    return <AiConsolePage jobId={job ?? null} />;
  },
});

const todayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bugun",
  validateSearch: (s: Record<string, unknown>): { date?: string } =>
    typeof s.date === "string" && isIsoDate(s.date) ? { date: s.date } : {},
  component: function TodayRoute() {
    const { date } = todayRoute.useSearch();
    return <TodayPage date={date} />;
  },
});

const goalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/maqsadlar",
  validateSearch: (s: Record<string, unknown>): { view?: GoalView; period?: string; mode?: TaskMode } => ({
    ...(GOAL_VIEWS.includes(s.view as GoalView) ? { view: s.view as GoalView } : {}),
    ...(typeof s.period === "string" ? { period: s.period } : {}),
    ...(TASK_MODES.includes(s.mode as TaskMode) ? { mode: s.mode as TaskMode } : {}),
  }),
  component: function GoalsRoute() {
    const { view, period, mode } = goalsRoute.useSearch();
    return <GoalsPage view={view ?? "yil"} period={period} mode={mode ?? "royxat"} />;
  },
});

const placeholders = [
  { path: "/kalendar", title: "Kalendar", sprint: "S2" },
  { path: "/bilim-bazasi", title: "Bilim bazasi", sprint: "S3" },
  { path: "/instrumentlar", title: "Instrumentlar", sprint: "S5–S8" },
  { path: "/sozlamalar", title: "Sozlamalar", sprint: "S9" },
].map((p) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: p.path,
    component: () => <PlaceholderPage title={p.title} sprint={p.sprint} />,
  }),
);

const routeTree = rootRoute.addChildren([homeRoute, aiRoute, todayRoute, goalsRoute, ...placeholders]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
