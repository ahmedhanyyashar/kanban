import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { ApiError } from "@/lib/api-client";

/** A refusal (a 4xx) will not change by asking again; a network or server failure might, a couple of times. */
export function retryQuery(failures: number, error: Error) {
  const refused =
    error instanceof ApiError &&
    error.status !== undefined &&
    error.status < 500;
  return !refused && failures < 2;
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000, retry: retryQuery } },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
