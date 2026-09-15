"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExplanationDrawer } from "@/modules/intelligence/components/explanation-drawer";
import { useAnomalyExplanation } from "@/modules/intelligence/services/intelligence";
import type { InventoryAnomaly } from "@/modules/dashboard/types";
import { useAiAllowance } from "@/modules/billing/components/ai-usage";

export function AnomalyList({ anomalies }: { anomalies: InventoryAnomaly[] }) {
    const explanation = useAnomalyExplanation();
    const aiAllowance = useAiAllowance();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const selectedAnomaly = anomalies.find(
        (anomaly) => anomaly.id === selectedId,
    );

    return (
        <section>
            <header className="border-b bg-amber-500/5">
                <div className={"flex flex-wrap items-center gap-3 p-5 sm:p-6"}>
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 className="font-semibold">Inventory anomalies</h2>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Unusual stock changes worth investigating.
                        </p>
                    </div>
                    <Badge variant="secondary">
                        {anomalies.length} to review
                    </Badge>
                </div>
            </header>

            {anomalies.length === 0 ? (
                <div className="flex items-center gap-3 p-6">
                    <ShieldCheck className="size-8 shrink-0 text-primary" />
                    <div>
                        <p className="text-sm font-medium">No issues flagged</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            No inventory anomalies require investigation.
                        </p>
                    </div>
                </div>
            ) : (
                <div
                    className={
                        "grid gap-4 p-4 sm:grid-cols-2 sm:p-6 " +
                        "xl:grid-cols-3"
                    }
                >
                    {anomalies.map((anomaly) => (
                        <AnomalyCard
                            anomaly={anomaly}
                            explanationError={
                                selectedId === anomaly.id
                                    ? explanation.error
                                    : undefined
                            }
                            isExplaining={
                                explanation.isPending &&
                                selectedId === anomaly.id
                            }
                            limitReached={aiAllowance.exhausted}
                            key={anomaly.id}
                            onExplain={() => {
                                setSelectedId(anomaly.id);
                                explanation.mutate(anomaly.id, {
                                    onSuccess: () => setDrawerOpen(true),
                                });
                            }}
                        />
                    ))}
                </div>
            )}
            <ExplanationDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                title={
                    selectedAnomaly?.title ?? "Inventory anomaly explanation"
                }
                description={
                    selectedAnomaly
                        ? `Explanation for ${selectedAnomaly.product_name}.`
                        : "StockWise explanation for this inventory anomaly."
                }
                response={
                    selectedId === selectedAnomaly?.id
                        ? explanation.data
                        : undefined
                }
            />
        </section>
    );
}

function AnomalyCard({
    anomaly,
    explanationError,
    isExplaining,
    limitReached,
    onExplain,
}: {
    anomaly: InventoryAnomaly;
    explanationError: Error | null | undefined;
    isExplaining: boolean;
    limitReached: boolean;
    onExplain: () => void;
}) {
    return (
        <Card
            className={
                "h-full min-w-0 gap-4 rounded-2xl border py-5 " +
                "shadow-sm ring-0 " +
                (anomaly.severity === "high"
                    ? "border-destructive/20 bg-gradient-to-b from-destructive/5 to-card"
                    : "border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-card")
            }
            size="sm"
        >
            <div className="px-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {anomalyTypeLabel(anomaly.anomaly_type)}
                        </p>
                        <h3 className="mt-2 break-words text-lg font-semibold">
                            {anomaly.product_name}
                        </h3>
                    </div>
                    <Badge
                        variant={
                            anomaly.severity === "high"
                                ? "destructive"
                                : "secondary"
                        }
                    >
                        {anomaly.severity === "high"
                            ? "High priority"
                            : "Review needed"}
                    </Badge>
                </div>

                <div className="mt-5 rounded-2xl border border-border/50 bg-card/70 p-4">
                    <p className="text-xs text-muted-foreground">
                        {anomaly.anomaly_type === "negative_stock"
                            ? "Stock balance"
                            : anomaly.anomaly_type === "count_variance"
                              ? "Count difference"
                              : "Quantity changed"}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                        {new Intl.NumberFormat("en-PH", {
                            maximumFractionDigits: 2,
                            signDisplay: "exceptZero",
                        }).format(anomaly.quantity)}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                            units
                        </span>
                    </p>
                </div>
                <p className="mt-4 text-sm font-medium">{anomaly.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {anomaly.detail}
                </p>
            </div>

            <div className="mt-auto flex flex-wrap gap-2 border-t px-4 pt-4">
                <Button
                    disabled={isExplaining || limitReached}
                    onClick={onExplain}
                    size="sm"
                    type="button"
                    variant="outline"
                >
                    <Sparkles className="mr-1.5 size-4" />
                    {isExplaining
                        ? "Explaining…"
                        : limitReached
                          ? "Weekly AI limit reached"
                          : "Explain · 1 AI action"}
                </Button>
                <Link
                    className={
                        "inline-flex items-center gap-1 px-2 text-sm " +
                        "font-medium text-primary hover:underline"
                    }
                    href={
                        "/inventory/movements?product_id=" + anomaly.product_id
                    }
                >
                    Investigate <ArrowRight className="size-4" />
                </Link>
            </div>

            {explanationError ? (
                <p className="px-4 text-sm text-destructive">
                    {explanationError.message}
                </p>
            ) : null}
        </Card>
    );
}

function anomalyTypeLabel(type: InventoryAnomaly["anomaly_type"]) {
    switch (type) {
        case "negative_stock":
            return "Negative stock";
        case "count_variance":
            return "Count discrepancy";
        case "large_adjustment":
            return "Large adjustment";
    }
}
