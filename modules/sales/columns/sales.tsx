"use client";

import type { DataTableColumn } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";

import { cn } from "@/lib/utils";
import { Sale, SaleStatus } from "@/modules/sales/types";

type SaleColumnsOptions = {
    onVoid: (sale: Sale) => void;
    onReturn: (sale: Sale) => void;
};

const STATUS_STYLES: Record<SaleStatus, string> = {
    completed: "bg-emerald-500/10 text-emerald-600",
    partially_returned: "bg-amber-500/10 text-amber-700",
    returned: "bg-blue-500/10 text-blue-700",
    voided: "bg-destructive/10 text-destructive",
};

export function getSaleColumns({
    onVoid,
    onReturn,
}: SaleColumnsOptions): DataTableColumn<Sale>[] {
    return [
        {
            key: "reference_number",
            header: "Reference #",
            cell: (row) => (
                <span className="font-medium">
                    {row.reference_number || "—"}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            cell: (row) => {
                const statusClass =
                    STATUS_STYLES[row.status] ??
                    "bg-muted text-muted-foreground";

                return (
                    <span
                        className={cn(
                            "inline-flex px-2 py-0.5 text-xs font-medium capitalize",
                            statusClass,
                        )}
                    >
                        {row.status.replaceAll("_", " ")}
                    </span>
                );
            },
        },
        {
            key: "payment_method",
            header: "Payment",
            cell: (row) => (
                <span className="capitalize">
                    {row.payment_method.replace("_", " ")}
                </span>
            ),
        },
        {
            key: "item_count",
            header: "Items",
            align: "right",
            cell: (row) => row.item_count,
        },
        {
            key: "total_amount",
            header: "Total",
            align: "right",
            cell: (row) => (
                <span className="font-medium">
                    {formatCurrency(row.total_amount)}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            align: "right",
            width: "w-32",
            cell: (row) => (
                <div className="flex justify-end">
                    {(row.status === "completed" ||
                        row.status === "partially_returned") && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 cursor-pointer px-2 text-primary hover:bg-primary/10"
                            onClick={(event) => {
                                event.stopPropagation();
                                onReturn(row);
                            }}
                        >
                            Return
                        </Button>
                    )}
                    {row.status === "completed" && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 cursor-pointer px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={(event) => {
                                event.stopPropagation();
                                onVoid(row);
                            }}
                        >
                            Void
                        </Button>
                    )}
                </div>
            ),
        },
    ];
}
