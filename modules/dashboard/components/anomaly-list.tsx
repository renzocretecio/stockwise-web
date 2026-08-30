"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { InventoryAnomaly } from "@/modules/dashboard/types";
import { IntelligenceMessageView } from
  "@/modules/intelligence/components/message";
import { useAnomalyExplanation } from
  "@/modules/intelligence/services/intelligence";

export function AnomalyList({ anomalies }: { anomalies: InventoryAnomaly[] }) {
  const explanation = useAnomalyExplanation();
  const selectedId = explanation.variables;

  return (
    <Card className="overflow-hidden">
      <div className="border-b p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-semibold">Inventory anomalies</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Verifiable exceptions from stock balances, counts, and adjustments.
        </p>
      </div>
      {anomalies.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">
          No inventory anomalies require investigation.
        </p>
      ) : (
        <div className="divide-y">
          {anomalies.map((anomaly) => (
            <div key={anomaly.id} className="p-5">
              <div
                className={
                  "flex flex-col justify-between gap-3 sm:flex-row " +
                  "sm:items-center"
                }
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{anomaly.title}</p>
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
                  <p className="mt-1 text-sm text-muted-foreground">
                    {anomaly.detail}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={
                      explanation.isPending && selectedId === anomaly.id
                    }
                    onClick={() => explanation.mutate(anomaly.id)}
                  >
                    <Sparkles className="mr-1 h-4 w-4" />
                    Explain
                  </Button>
                  <Link
                    href={
                      "/inventory/movements?product_id=" + anomaly.product_id
                    }
                    className={
                      "flex items-center gap-1 text-sm font-medium " +
                      "text-primary hover:underline"
                    }
                  >
                    Investigate <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              {explanation.data && selectedId === anomaly.id ? (
                <div className="mt-4">
                  <IntelligenceMessageView response={explanation.data} />
                </div>
              ) : null}
              {explanation.error && selectedId === anomaly.id ? (
                <p className="mt-3 text-sm text-destructive">
                  {explanation.error.message}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
