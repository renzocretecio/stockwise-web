"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      args[0]?.includes?.(
        "Encountered a script tag while rendering React component",
      )
    ) {
      return;
    }
    originalError(...args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <NextThemesProvider {...props}>
      {mounted ? (
        children
      ) : (
        <div style={{ visibility: "hidden" }}>{children}</div>
      )}
    </NextThemesProvider>
  );
}
