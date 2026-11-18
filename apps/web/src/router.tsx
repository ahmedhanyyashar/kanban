import { NuqsAdapter } from "nuqs/adapters/react-router/v8";
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useLocation,
} from "react-router";

import { ErrorBoundary } from "@repo/ui/blocks/error-boundary";

import { ShellLayout } from "@/layouts/shell";
import { BoardPage } from "@/pages/board";
import { CalendarPage } from "@/pages/calendar";
import { DashboardPage } from "@/pages/dashboard";
import { LandingPage } from "@/pages/landing";
import { MyTasksPage } from "@/pages/my-tasks";
import { NotFoundPage } from "@/pages/not-found";
import { SettingsPage } from "@/pages/settings";
import { SignInPage } from "@/pages/sign-in";
import { SignUpPage } from "@/pages/sign-up";
import { TeamPage } from "@/pages/team";

// A board keeps its filters in the address (nuqs), and the adapter reads the router, so it sits inside it.
// A page that fails to render shows a message instead of a blank screen; moving to another page clears it.
export function Root() {
  const { pathname } = useLocation();
  return (
    <NuqsAdapter>
      <ErrorBoundary key={pathname}>
        <Outlet />
      </ErrorBoundary>
    </NuqsAdapter>
  );
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/sign-in", element: <SignInPage /> },
      { path: "/sign-up", element: <SignUpPage /> },
      {
        element: <ShellLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/board/:boardId", element: <BoardPage /> },
          { path: "/my-tasks", element: <MyTasksPage /> },
          { path: "/calendar", element: <CalendarPage /> },
          { path: "/team", element: <TeamPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
