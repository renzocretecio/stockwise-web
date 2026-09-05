"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExplanationDrawer } from
    "@/modules/intelligence/components/explanation-drawer";
import { useAnomalyExplanation } from
    "@/modules/intelligence/services/intelligence";
import type { InventoryAnomaly } from "@/modules/dashboard/types";

export function AnomalyList({ anomalies }: { anomalies: InventoryAnomaly[] }) {
    const explanation = useAnomalyExplanation();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const selectedAnomaly = anomalies.find((anomaly) => anomaly.id === selectedId);

    return (
        <section className="border-t">
            <header className="border-b">
                <div className={
                    "flex flex-col gap-1 p-4 " +
                    "sm:flex-row sm:items-center sm:gap-3"
                }
            >
                    <AlertTriangle className="size-5 text-amber-600" />
                    <h2 className="font-semibold">
                        Inventory anomalies
                    </h2>
                    <p className="text-xs text-muted-foreground sm:border-l sm:pl-3">
                        Exceptions from stock balances, counts, and adjustments.
                    </p>
                </div>
                
            </header>

            {anomalies.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                    No inventory anomalies require investigation.
                </p>
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
                                explanation.isPending && selectedId === anomaly.id
                            }
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
                title={selectedAnomaly?.title ?? "Inventory anomaly explanation"}
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
    onExplain,
}: {
    anomaly: InventoryAnomaly;
    explanationError: Error | null | undefined;
    isExplaining: boolean;
    onExplain: () => void;
}) {
    return (
        <Card className="h-full gap-4 bg-muted/30 py-4 rounded-md" size="sm">
            <div className="px-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {anomalyTypeLabel(anomaly.anomaly_type)}
                        </p>
                        <h3 className="mt-1 font-semibold">
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
                        {anomaly.severity}
                    </Badge>
                </div>

                <p className="mt-4 text-sm font-medium">{anomaly.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {anomaly.detail}
                </p>
            </div>

            <div className="mt-auto flex flex-wrap gap-2 border-t px-4 pt-4">
                <Button
                    disabled={isExplaining}
                    onClick={onExplain}
                    size="sm"
                    type="button"
                    variant="outline"
                >
                    <Sparkles className="mr-1.5 size-4" />
                    {isExplaining ? "Explaining…" : "Explain"}
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
