"use client";

import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun, PaintbrushVertical } from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

const themes = [
  {
    value: "light",
    label: "Light",
    description: "A bright workspace for daytime use.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "A darker workspace for low-light environments.",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Follow your device preference automatically.",
    icon: Monitor,
  },
];

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (value: string) => {
    setTheme(value);
  };

  return (
    <div>
      <SectionHeading
        description="Choose how Stockwise looks on this device."
        icon={<PaintbrushVertical className="size-4" />}
        title="Appearance"
      />
      <section className="max-w-2xl p-5 sm:p-6">
        <div className="grid gap-3">
          {themes.map((option) => {
            const Icon = option.icon;
            const selected = theme === option.value;

            return (
              <button
                aria-pressed={selected}
                className={cn(
                  "flex items-center gap-4 border p-4 text-left rounded-md",
                  "transition-colors hover:bg-muted/60",
                  selected && "border-primary bg-primary/5",
                )}
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                type="button"
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center
                    rounded-md bg-muted text-primary"
                >
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{option.label}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {option.description}
                  </span>
                </span>
                {selected ? <Check className="size-4 text-primary" /> : null}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  description,
  icon,
  title,
}: {
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b p-4">
      <div
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center
          rounded-md bg-muted text-primary"
      >
        {icon}
      </div>
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}