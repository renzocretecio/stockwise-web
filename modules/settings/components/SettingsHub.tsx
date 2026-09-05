"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { AppearanceSettings } from "@/modules/settings/components/AppearanceSettings";
import { ProfileSettings } from "@/modules/auth/components/ProfileSettings";
import { WeeklyOwnerSummarySettings } from
  "@/modules/notifications/components/WeeklyOwnerSummarySettings";
import {
  SettingsSidebar,
  type SettingsSection,
} from "@/modules/settings/components/SettingsSidebar";

export function SettingsHub({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [section, setSection] = useState<SettingsSection>("profile");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[min(780px,calc(100dvh-2rem))] w-[calc(100vw-2rem)]
          max-h-none !max-w-4xl gap-0 overflow-hidden p-0 !rounded-md"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your profile, business, notifications, and appearance.
          </DialogDescription>
        </DialogHeader>
        <div
          className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)]
            lg:grid-cols-[220px_minmax(0,1fr)] lg:grid-rows-none"
        >
          <SettingsSidebar activeSection={section} onSelect={setSection} />
          <main className="min-h-0 min-w-0 overflow-y-auto">
            {section === "profile" || section === "business" ? (
              <ProfileSettings section={section} />
            ) : null}
            {section === "notifications" ? (
              <WeeklyOwnerSummarySettings />
            ) : null}
            {section === "appearance" ? <AppearanceSettings /> : null}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}