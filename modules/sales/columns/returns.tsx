import type { DataTableColumn } from "@/components/DataTable";
import { cn } from "@/lib/utils";
import type { SaleReturn } from "@/modules/sales/types";

const currency = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
});

const dateTime = new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
});

export const returnColumns: DataTableColumn<SaleReturn>[] = [
    {
        key: "sale_reference_number",
        header: "Original sale",
        cell: (row) => (
            <div>
                <p className="font-medium">{row.sale_reference_number || "No reference"}</p>
                <p className="font-mono text-xs text-muted-foreground">{row.id.slice(0, 8)}</p>
            </div>
        ),
    },
    {
        key: "status",
        header: "Status",
        cell: (row) => (
            <span className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                row.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-700"
                    : "bg-muted text-muted-foreground",
            )}>
                {row.status}
            </span>
        ),
    },
    {
        key: "reason",
        header: "Reason",
        cell: (row) => (
            <div className="max-w-64">
                <p className="truncate">{row.reason}</p>
                {row.notes && <p className="truncate text-xs text-muted-foreground">{row.notes}</p>}
            </div>
        ),
    },
    {
        key: "items",
        header: "Items",
        align: "right",
        cell: (row) => (
            <div>
                <p>{row.item_count} line{row.item_count === 1 ? "" : "s"}</p>
                <p className="text-xs text-muted-foreground">Qty {row.total_quantity}</p>
            </div>
        ),
    },
    {
        key: "refund_amount",
        header: "Refund",
        align: "right",
        cell: (row) => <span className="font-medium">{currency.format(row.refund_amount)}</span>,
    },
    {
        key: "created_at",
        header: "Returned at",
        align: "right",
        cell: (row) => dateTime.format(new Date(row.created_at)),
    },
];
