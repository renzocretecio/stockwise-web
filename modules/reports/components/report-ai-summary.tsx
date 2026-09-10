"use client";

import { useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAiAllowance } from "@/modules/billing/components/ai-usage";
import { IntelligenceMessageView } from
    "@/modules/intelligence/components/message";
import {
    type ReportSummaryType,
    useReportSummary,
    useStoredReportSummary,
} from "@/modules/intelligence/services/intelligence";
import type {
    ReportDateRange,
    ReportPeriod,
} from "@/modules/reports/types";
import { useHasPermission } from "@/modules/auth/hooks/use-has-permission";

export function ReportAiSummary({
    report,
    days,
    dateRange,
}: {
    report: ReportSummaryType;
    days?: ReportPeriod;
    dateRange?: ReportDateRange;
}) {
    const allowance = useAiAllowance();
    const canSummarize = useHasPermission("reports.summarize");
    const summarize = useReportSummary();
    const storedSummary = useStoredReportSummary(
        report,
        days,
        dateRange,
    );
    const [error, setError] = useState<string>();
    const response = storedSummary.data;
    const summaryPeriod = response?.context.period;

    const createSummary = async () => {
        setError(undefined);
        try {
            await summarize.mutateAsync({ report, days, dateRange });
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "Unable to summarize this report.",
            );
        }
    };

    const actionLabel = response
        ? "Generate a new summary"
        : "Summarize report";

    if (!canSummarize) return null;

    return (
        <section className="border-b p-4 sm:p-5">
            <div
                className={
                    "flex flex-col gap-3 sm:flex-row sm:items-center " +
                    "sm:justify-between"
                }
            >
                <div>
                    <h2 className="flex items-center gap-2 font-semibold">
                        <Sparkles className="size-4 text-primary" />
                        AI report summary
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Uses calculated totals and capped rankings, never raw
                        transaction rows.
                    </p>
                </div>
                <Button
                    disabled={summarize.isPending || allowance.exhausted}
                    onClick={() => void createSummary()}
                    size="sm"
                    type="button"
                >
                    {summarize.isPending ? (
                        <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                        <Sparkles className="size-4" />
                    )}
                    {summarize.isPending ? "Summarizing…" : actionLabel}
                </Button>
            </div>

            {allowance.exhausted ? (
                <p className="mt-3 text-xs text-destructive">
                    Your weekly AI allowance has been used. It will reset
                    {allowance.resetLabel
                        ? ` ${allowance.resetLabel}`
                        : " soon"}
                    .
                </p>
            ) : null}
            {error ? (
                <p className="mt-3 text-xs text-destructive">{error}</p>
            ) : null}
            {response ? (
                <div className="mt-4">
                    {typeof summaryPeriod === "string" ? (
                        <p className="mb-2 text-xs text-muted-foreground">
                            Summary for {summaryPeriod}. Generate a new one
                            after changing the report period.
                        </p>
                    ) : null}
                    <IntelligenceMessageView response={response} />
                </div>
            ) : null}
        </section>
    );
}
