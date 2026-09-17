"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
                <div className="p-4 sm:p-5">
                    <div className="overflow-hidden rounded-2xl border">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">
                                        Quantity
                                    </TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Detected</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {anomalies.map((anomaly) => (
                                    <AnomalyRow
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
                                        key={anomaly.id}
                                        limitReached={aiAllowance.exhausted}
                                        onExplain={() => {
                                            setSelectedId(anomaly.id);
                                            explanation.mutate(anomaly.id, {
                                                onSuccess: () =>
                                                    setDrawerOpen(true),
                                            });
                                        }}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
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

function AnomalyRow({
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
        <TableRow>
            <TableCell className="max-w-72 whitespace-normal">
                <p className="font-medium">{anomaly.product_name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {anomaly.title}
                </p>
            </TableCell>
            <TableCell>{anomalyTypeLabel(anomaly.anomaly_type)}</TableCell>
            <TableCell className="text-right font-medium tabular-nums">
                {formatQuantity(anomaly.quantity)}
                <span className="ml-1 font-normal text-muted-foreground">
                    units
                </span>
            </TableCell>
            <TableCell>
                <Badge
                    variant={
                        anomaly.severity === "high"
                            ? "destructive"
                            : "secondary"
                    }
                >
                    {anomaly.severity === "high" ? "High" : "Medium"}
                </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
                {formatOccurredAt(anomaly.occurred_at)}
            </TableCell>
            <TableCell>
                <div className="flex justify-end gap-2">
                    <Button
                        disabled={isExplaining || limitReached}
                        onClick={onExplain}
                        size="sm"
                        title={
                            limitReached
                                ? "Weekly AI limit reached"
                                : "Uses 1 AI action"
                        }
                        type="button"
                        variant="outline"
                    >
                        <Sparkles className="size-4" />
                        {isExplaining ? "Explaining…" : "Explain"}
                    </Button>
                    <Link
                        className={
                            "inline-flex items-center gap-1 px-2 text-sm " +
                            "font-medium text-primary hover:underline"
                        }
                        href={
                            "/inventory/movements?product_id=" +
                            anomaly.product_id
                        }
                    >
                        Investigate
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
                {explanationError ? (
                    <p className="mt-2 text-right text-xs text-destructive">
                        {explanationError.message}
                    </p>
                ) : null}
            </TableCell>
        </TableRow>
    );
}

const quantityFormatter = new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 2,
    signDisplay: "exceptZero",
});

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeZone: "Asia/Manila",
    timeStyle: "short",
});

function formatQuantity(value: number) {
    return quantityFormatter.format(value);
}

function formatOccurredAt(value: string | null) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
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
