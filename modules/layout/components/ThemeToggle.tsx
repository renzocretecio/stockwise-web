"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useAppearance } from "@/providers/AppearanceProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { resolvedTheme } = useTheme();
    const { ready, changeAppearance } = useAppearance();
    const dark = ready && resolvedTheme === "dark";

    return (
        <button
            aria-checked={dark}
            aria-label="Dark mode"
            className={cn(
                "inline-flex h-11 w-12 shrink-0 items-center justify-center",
                "rounded-2xl focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring disabled:opacity-50",
            )}
            disabled={!ready}
            onClick={() => changeAppearance({ mode: dark ? "light" : "dark" })}
            role="switch"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            type="button"
        >
            <span
                className={cn(
                    "flex h-7 w-12 items-center rounded-full border px-0.5",
                    "transition-colors",
                    dark ? "bg-primary/15" : "bg-muted",
                )}
            >
                <span
                    className={cn(
                        "grid size-5 place-items-center rounded-full bg-card",
                        "text-foreground transition-transform motion-reduce:transition-none",
                        dark && "translate-x-5",
                    )}
                >
                    {dark ? (
                        <Moon aria-hidden="true" className="size-3" />
                    ) : (
                        <Sun aria-hidden="true" className="size-3" />
                    )}
                </span>
            </span>
        </button>
    );
}
