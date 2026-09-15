"use client";

import { RefreshCw, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAiAllowance } from "@/modules/billing/components/ai-usage";
import {
    useGenerateBriefing,
    useTodayBriefing,
} from "@/modules/briefings/services/briefings";

const card =
    "min-w-0 overflow-hidden rounded-2xl border " +
    "border-border/70 bg-card shadow-sm";

export function Briefing({ bento = false }: { bento?: boolean }) {
    const { data, error, isLoading } = useTodayBriefing();
    const generate = useGenerateBriefing();
    const aiAllowance = useAiAllowance();
    const briefing = data?.briefing;
    const surface = bento ? card : "min-w-0";

    if (isLoading) {
        return (
            <section
                aria-busy
                aria-label="Loading daily inventory briefing"
                className={surface + " p-5 sm:p-6"}
            >
                <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                <div className="mt-6 h-24 animate-pulse rounded-2xl bg-muted" />
                <div className="mt-4 h-16 animate-pulse rounded-2xl bg-muted" />
            </section>
        );
    }

    if (!briefing) {
        const message = error ?? generate.error;

        return (
            <section className={surface + " p-6 sm:p-8"}>
                <div className="mx-auto flex max-w-lg flex-col items-center py-6 text-center">
                    <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <Sparkles className="size-6" />
                    </span>
                    <h2 className="mt-4 text-xl font-semibold">
                        Daily Inventory Briefing
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        See the most important changes in sales and inventory in
                        one short update.
                    </p>
                    {message ? (
                        <p className="mt-3 text-sm text-destructive">
                            {message instanceof Error
                                ? message.message
                                : "Unable to generate the briefing."}
                        </p>
                    ) : null}
                    <Button
                        className="mt-5"
                        disabled={generate.isPending}
                        onClick={() => generate.mutate(false)}
                        type="button"
                    >
                        <Sparkles className="mr-2 size-4" />
                        {generate.isPending
                            ? "Analyzing inventory…"
                            : "Generate today’s briefing"}
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Automatic daily briefing · No AI allowance used
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className={surface} aria-labelledby="daily-briefing-title">
            <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/10 to-primary/[0.02] p-5 sm:p-6">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <Sparkles className="size-5" />
                    </span>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2
                                id="daily-briefing-title"
                                className="font-semibold"
                            >
                                Daily Inventory Briefing
                            </h2>
                            <Badge variant="secondary">
                                {briefing.narrator_provider === "groq"
                                    ? "AI generated"
                                    : "Data generated"}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Generated {formatGeneratedAt(briefing.generated_at)}
                        </p>
                    </div>
                </div>
                <h3 className="mt-3 text-xl font-semibold leading-snug sm:text-2xl">
                    {briefing.headline}
                </h3>
                <ul className="mt-4 space-y-1">
                    {briefing.summary.map((item, index) => (
                        <li
                            className="ml-4 list-disc pl-1 text-sm leading-7 text-muted-foreground marker:text-primary/60"
                            key={`${index}-${item}`}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function formatGeneratedAt(value: string) {
    return new Intl.DateTimeFormat("en-PH", {
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        month: "short",
        timeZone: "Asia/Manila",
        year: "numeric",
    }).format(new Date(value));
}
