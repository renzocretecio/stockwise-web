"use client";

import { ThemeProvider } from "./ThemeProvider";
import { QueryProvider } from "./QueryProvider";
import { Toaster } from "@/components/ui/toast";
import { AppearanceProvider } from "./AppearanceProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Toaster>
        <QueryProvider>
          <AppearanceProvider>{children}</AppearanceProvider>
        </QueryProvider>
      </Toaster>
    </ThemeProvider>
  );
}
