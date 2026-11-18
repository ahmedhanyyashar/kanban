import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useLocation,
} from "react-router";

import { ErrorBoundary } from "@repo/ui/blocks/error-boundary";

import { ShellLayout } from "@/layouts/shell";
import { NotFoundPage } from "@/pages/not-found";
import { SettingsPage } from "@/pages/settings";
import { SignInPage } from "@/pages/sign-in";
import { SignUpPage } from "@/pages/sign-up";

// A page that fails to render shows a message instead of a blank screen; moving to another page clears it.
export function Root() {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary key={pathname}>
      <Outlet />
    </ErrorBoundary>
  );
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: "/sign-in", element: <SignInPage /> },
      { path: "/sign-up", element: <SignUpPage /> },
      {
        element: <ShellLayout />,
        children: [{ path: "/settings", element: <SettingsPage /> }],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
