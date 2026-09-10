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
import { CreateBusinessForm } from "@/modules/business/components/CreateBusinessForm";
import { FeatureGate } from "@/modules/billing/components/feature-gate";
import { PlanSettings } from "@/modules/billing/components/plan-settings";
import { ProfileSettings } from "@/modules/auth/components/ProfileSettings";
import { WeeklyOwnerSummarySettings } from "@/modules/notifications/components/WeeklyOwnerSummarySettings";
import { TeamAccessSettings } from "@/modules/members/components/TeamAccessSettings";
import {
    SettingsSidebar,
    type SettingsSection,
} from "@/modules/settings/components/SettingsSidebar";

export function SettingsHub({
    open,
    onOpenChange,
    section: controlledSection,
    onSectionChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    section?: SettingsSection;
    onSectionChange?: (section: SettingsSection) => void;
}) {
    const [uncontrolledSection, setUncontrolledSection] =
        useState<SettingsSection>("profile");
    const section = controlledSection ?? uncontrolledSection;

    const setSection = (nextSection: SettingsSection) => {
        setUncontrolledSection(nextSection);
        onSectionChange?.(nextSection);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="h-[min(780px,calc(100dvh-2rem))] w-[calc(100vw-2rem)]
          max-h-none !max-w-4xl gap-0 overflow-hidden p-0 !rounded-2xl"
            >
                <DialogHeader className="sr-only">
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Manage your profile, business, notifications, and
                        appearance.
                    </DialogDescription>
                </DialogHeader>
                <div
                    className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)]
            lg:grid-cols-[220px_minmax(0,1fr)] lg:grid-rows-none"
                >
                    <SettingsSidebar
                        activeSection={section}
                        onSelect={setSection}
                    />
                    <main className="min-h-0 min-w-0 overflow-y-auto">
                        {section === "profile" || section === "business" ? (
                            <ProfileSettings section={section} />
                        ) : null}
                        {section === "business" ? (
                            <div className="border-t p-4">
                                <CreateBusinessForm />
                            </div>
                        ) : null}
                        {section === "team" ? <TeamAccessSettings /> : null}
                        {section === "notifications" ? (
                            <FeatureGate
                                className="h-full"
                                description={
                                    "Schedule an owner-ready inventory and sales summary " +
                                    "with the Pro plan."
                                }
                                feature="weekly_owner_summary"
                                title="Weekly summaries are a Pro feature"
                            >
                                <WeeklyOwnerSummarySettings />
                            </FeatureGate>
                        ) : null}
                        {section === "plan" ? <PlanSettings /> : null}
                        {section === "appearance" ? (
                            <AppearanceSettings />
                        ) : null}
                    </main>
                </div>
            </DialogContent>
        </Dialog>
    );
}
