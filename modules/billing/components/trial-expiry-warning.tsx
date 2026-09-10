"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHasPermission } from "@/modules/auth/hooks/use-has-permission";
import { useSubscription } from "@/modules/billing/services/billing";
import { requestPlanUpgrade } from "@/modules/billing/upgrade-events";

const WARNING_WINDOW_DAYS = 7;
const FREE_MEMBER_LIMIT = 1;
const ONE_HOUR = 60 * 60 * 1000;

export function TrialExpiryWarning() {
    const canManageBilling = useHasPermission("billing.manage");
    const subscription = useSubscription();
    const [currentTime, setCurrentTime] = useState<number | null>(null);
    const trialEndsAt = subscription.data?.trial_ends_at;

    useEffect(() => {
        const initialUpdate = window.setTimeout(
            () => setCurrentTime(Date.now()),
            0,
        );
        const interval = window.setInterval(
            () => setCurrentTime(Date.now()),
            ONE_HOUR,
        );

        return () => {
            window.clearTimeout(initialUpdate);
            window.clearInterval(interval);
        };
    }, []);

    const daysRemaining =
        currentTime !== null && trialEndsAt
            ? Math.max(
                  Math.ceil(
                      (new Date(trialEndsAt).getTime() - currentTime) /
                          (24 * 60 * 60 * 1000),
                  ),
                  0,
              )
            : null;

    const data = subscription.data;
    if (
        !canManageBilling ||
        !data ||
        data.status !== "trialing" ||
        daysRemaining === null ||
        daysRemaining > WARNING_WINDOW_DAYS
    ) {
        return null;
    }

    const affectedMembers = Math.max(
        data.usage.active_members - FREE_MEMBER_LIMIT,
        0,
    );
    const affectedMemberLabel =
        affectedMembers === 1 ? "member" : "members";
    const deadline =
        daysRemaining === 0 ? "today" : `in ${daysRemaining} days`;

    return (
        <section
            aria-live="polite"
            data-no-print="true"
            className={
                "mx-4 mt-3 flex flex-col gap-3 border border-amber-300/70 " +
                "bg-amber-50 p-4 text-amber-950 dark:border-amber-700/60 " +
                "dark:bg-amber-950/30 dark:text-amber-100 sm:flex-row " +
                "sm:items-center sm:justify-between"
            }
            role="status"
        >
            <div className="flex min-w-0 gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                <div>
                    <p className="text-sm font-semibold">
                        Your Pro trial ends {deadline}.
                    </p>
                    <p className="mt-0.5 text-xs text-current/75">
                        {affectedMembers > 0
                            ? `${affectedMembers} team ` +
                              `${affectedMemberLabel} ` +
                              "will lose access when this business returns " +
                              "to Free."
                            : "This business will return to Free limits " +
                              "unless you upgrade."}
                    </p>
                </div>
            </div>
            <Button
                className="shrink-0"
                onClick={() =>
                    requestPlanUpgrade({
                        current_plan: "pro",
                        target_plan: "pro",
                    })
                }
                size="sm"
                type="button"
                variant="outline"
            >
                Review plan
                <ArrowRight className="size-4" />
            </Button>
        </section>
    );
}
