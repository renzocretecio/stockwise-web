"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import type { InventoryBriefing } from "@/modules/briefings/types";

const card =
    "h-full min-w-0 overflow-hidden rounded-2xl border " +
    "border-primary/25 bg-primary/[0.12] shadow-sm";

export function SalesAiInsight({
    briefing,
    isLoading,
}: {
    briefing?: InventoryBriefing | null;
    isLoading: boolean;
}) {
    if (isLoading && !briefing) {
        return (
            <section
                aria-busy="true"
                aria-label="Loading yesterday's business update"
                className={card + " p-5"}
            >
                <div className="h-9 w-9 animate-pulse rounded-2xl bg-muted" />
                <div className="mt-5 h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-12 animate-pulse rounded bg-muted" />
            </section>
        );
    }

    if (!briefing) {
        return (
            <section className={card + " p-5"}>
                <InsightHeading provider="template" />
                <p className="mt-5 text-sm leading-6 text-muted-foreground">
                    Yesterday&apos;s business update is not available yet.
                    Reconnect and refresh the dashboard to load it.
                </p>
            </section>
        );
    }

    return (
        <section aria-labelledby="sales-ai-insight-title" className={card}>
            <div className="p-4">
                <InsightHeading provider={briefing.narrator_provider} />

                <div className="mt-5">
                    {briefing.summary[0] ? (
                        <p
                            className={
                                "mt-2 text-sm leading-6 " +
                                "text-muted-foreground"
                            }
                        >
                            {briefing.summary[0]}
                        </p>
                    ) : null}
                </div>
            </div>
        </section>
    );
}

function InsightHeading({ provider }: { provider: string }) {
    const source = provider === "groq" ? "AI insight" : "Data insight";

    return (
        <div className="flex items-start gap-3">
            <span
                className={
                    "grid size-9 shrink-0 place-items-center " +
                    "rounded-2xl bg-primary/10 text-primary"
                }
            >
                <Sparkles aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0">
                <h2
                    className="text-sm font-semibold"
                    id="sales-ai-insight-title"
                >
                    Yesterday&apos;s business update
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                    {source} from today&apos;s inventory briefing
                </p>
            </div>
            <Link
                className={
                    "ml-auto inline-flex shrink-0 gap-1 " +
                    "text-xs font-medium text-primary hover:underline " +
                    "focus-visible:outline-none focus-visible:ring-2 " +
                    "focus-visible:ring-ring"
                }
                href="/dashboard/overview?tab=insight"
            >
                Full briefing
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
        </div>
    );
}
