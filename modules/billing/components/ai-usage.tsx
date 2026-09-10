"use client";

import { Bot } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSubscription } from "@/modules/billing/services/billing";

export function useAiAllowance() {
    const subscription = useSubscription();
    const limit = subscription.data?.limits.ai_insights_weekly;
    const used = subscription.data?.usage.ai_insights ?? 0;
    const exhausted =
        typeof limit === "number" && used >= limit;

    return {
        ...subscription,
        exhausted,
        limit,
        resetLabel: formatResetDate(
            subscription.data?.usage.ai_period_start,
        ),
        used,
    };
}

export function AiUsage({ className }: { className?: string }) {
    const usage = useAiAllowance();

    if (usage.isLoading && !usage.data) {
        return (
            <div
                className={cn(
                    "h-[4.75rem] w-full animate-pulse bg-muted/50",
                    "sm:w-72",
                    className,
                )}
            />
        );
    }

    if (!usage.data) {
        return (
            <div
                className={cn(
                    "w-full border bg-background/60 p-3 sm:w-72 rounded-2xl",
                    className,
                )}
            >
                <p className="text-xs text-muted-foreground">
                    AI usage is temporarily unavailable.
                </p>
            </div>
        );
    }

    const limit = usage.limit;
    const percentage =
        typeof limit === "number" && limit > 0
            ? Math.min((usage.used / limit) * 100, 100)
            : 0;
    const remaining =
        typeof limit === "number"
            ? Math.max(limit - usage.used, 0)
            : null;

    return (
        <div
            className={cn(
                "w-full border bg-background/60 p-3 sm:w-72 rounded-2xl",
                className,
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-medium">
                    <Bot className="size-4 text-primary" />
                    AI actions this week
                </span>
                <span className="text-xs font-semibold tabular-nums">
                    {limit === null
                        ? `${usage.used} used`
                        : `${usage.used} of ${limit}`}
                </span>
            </div>

            {typeof limit === "number" ? (
                <div
                    aria-label={
                        `${Math.round(percentage)}% of AI allowance used`
                    }
                    aria-valuemax={limit}
                    aria-valuemin={0}
                    aria-valuenow={Math.min(usage.used, limit)}
                    className="mt-2 h-1.5 overflow-hidden bg-muted"
                    role="progressbar"
                >
                    <div
                        className={cn(
                            "h-full bg-primary transition-[width]",
                            percentage >= 90 && "bg-destructive",
                            percentage >= 70 &&
                                percentage < 90 &&
                                "bg-amber-500",
                        )}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            ) : null}

            <p className="mt-2 text-[11px] text-muted-foreground">
                {remaining === null
                    ? "Unlimited allowance"
                    : `${remaining} remaining`}
                {usage.resetLabel
                    ? ` · Resets ${usage.resetLabel}`
                    : ""}
            </p>
        </div>
    );
}

function formatResetDate(periodStart?: string) {
    if (!periodStart) return null;

    const [year, month, day] = periodStart.split("-").map(Number);
    if (!year || !month || !day) return null;

    const resetDate = new Date(Date.UTC(year, month - 1, day + 7));
    return new Intl.DateTimeFormat("en-PH", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
    }).format(resetDate);
}
