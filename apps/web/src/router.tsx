import { Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AiConsolePage } from "@/routes/AiConsole";
import { HomePage, PlaceholderPage } from "@/routes/Home";
import { GOAL_VIEWS, GoalsPage, type GoalView } from "@/routes/goals/GoalsPage";

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

const goalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/maqsadlar",
  validateSearch: (s: Record<string, unknown>): { view?: GoalView; period?: string } => ({
    ...(GOAL_VIEWS.includes(s.view as GoalView) ? { view: s.view as GoalView } : {}),
    ...(typeof s.period === "string" ? { period: s.period } : {}),
  }),
  component: function GoalsRoute() {
    const { view, period } = goalsRoute.useSearch();
    return <GoalsPage view={view ?? "yil"} period={period} />;
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

const routeTree = rootRoute.addChildren([homeRoute, aiRoute, goalsRoute, ...placeholders]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
