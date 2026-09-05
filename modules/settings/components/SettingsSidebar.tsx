"use client";

import {
  BellRing,
  Building2,
  Monitor,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type SettingsSection =
  | "profile"
  | "business"
  | "notifications"
  | "appearance";

const settingsLinks: Array<{
  label: string;
  value: SettingsSection;
  icon: typeof UserRound;
}> = [
  {
    label: "Profile",
    value: "profile",
    icon: UserRound,
  },
  {
    label: "Business Profile",
    value: "business",
    icon: Building2,
  },
  {
    label: "Notifications",
    value: "notifications",
    icon: BellRing,
  },
  {
    label: "Appearance",
    value: "appearance",
    icon: Monitor,
  },
];

export function SettingsSidebar({
  activeSection,
  onSelect,
}: {
  activeSection: SettingsSection;
  onSelect: (section: SettingsSection) => void;
}) {
  return (
    <aside className="border-b bg-muted/20 p-4 lg:border-b-0 lg:border-r">
      <div className="mb-4 hidden lg:block">
        <h2 className="mt-1 text-lg font-semibold tracking-tight">Settings</h2>
      </div>
      <nav
        aria-label="Settings navigation"
        className="grid gap-1 sm:grid-cols-2 lg:block"
      >
        {settingsLinks.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.value;

          return (
            <button
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5",
                "text-left text-sm",
                "font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              onClick={() => onSelect(item.value)}
              key={item.label}
              type="button"
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}