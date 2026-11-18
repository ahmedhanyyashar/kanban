import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

import { Toaster } from "@repo/ui/components/sonner";

import { QueryProvider } from "@/providers/query";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        {/* motion libraries follow the visitor's "reduce motion" setting */}
        <MotionConfig reducedMotion="user">
          {children}
          <Toaster />
        </MotionConfig>
      </QueryProvider>
    </ThemeProvider>
  );
}
