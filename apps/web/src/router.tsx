import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useLocation,
} from "react-router";

import { ErrorBoundary } from "@repo/ui/blocks/error-boundary";

import { NotFoundPage } from "@/pages/not-found";

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
    children: [{ path: "*", element: <NotFoundPage /> }],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
