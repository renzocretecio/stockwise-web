import type { DataTableColumn } from "@/components/DataTable";
import { StockMovementItem } from "../types/movements";

const movementTypeLabel: Record<string, { label: string; className: string }> =
    {
        purchase: {
            label: "Purchase received",
            className: "text-emerald-600 bg-emerald-500/10",
        },
        // Kept for older rows created before the backend standardized on purchase.
        purchase_receive: {
            label: "Purchase received",
            className: "text-emerald-600 bg-emerald-500/10",
        },
        sale: {
            label: "Sale",
            className: "text-blue-600 bg-blue-500/10",
        },
        adjustment: {
            label: "Adjustment",
            className: "text-amber-600 bg-amber-500/10",
        },
        count_adjustment: {
            label: "Count adjustment",
            className: "text-purple-600 bg-purple-500/10",
        },
        return: {
            label: "Return",
            className: "text-cyan-600 bg-cyan-500/10",
        },
        damage: {
            label: "Damage",
            className: "text-red-600 bg-red-500/10",
        },
        expired: {
            label: "Expired",
            className: "text-orange-600 bg-orange-500/10",
        },
        transfer_in: {
            label: "Transfer in",
            className: "text-teal-600 bg-teal-500/10",
        },
        transfer_out: {
            label: "Transfer out",
            className: "text-indigo-600 bg-indigo-500/10",
        },
    };

const formatMovementType = (value: string) => ({
    label: value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    className: "text-muted-foreground bg-muted",
});

export function getStockMovementColumns(): DataTableColumn<StockMovementItem>[] {
    return [
        {
            key: "created_at",
            header: "Date",
            sortable: true,
            width: "w-40",
            cell: (r) => (
                <span className="text-muted-foreground">
                    {new Date(r.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </span>
            ),
        },
        {
            key: "product_name",
            header: "Product",
            sortable: true,
            cell: (r) => (
                <span className="font-medium text-foreground">
                    {r.product_name}
                </span>
            ),
        },
        {
            key: "movement_type",
            header: "Type",
            cell: (r) => {
                const type =
                    movementTypeLabel[r.movement_type] ??
                    formatMovementType(r.movement_type);
                return (
                    <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${type.className}`}
                    >
                        {type.label}
                    </span>
                );
            },
        },
        {
            key: "quantity_change",
            header: "Change",
            align: "right",
            cell: (r) => (
                <span
                    className={
                        r.quantity_change > 0
                            ? "text-emerald-600 font-medium"
                            : r.quantity_change < 0
                              ? "text-destructive font-medium"
                              : "text-muted-foreground"
                    }
                >
                    {r.quantity_change > 0 ? "+" : ""}
                    {r.quantity_change}
                </span>
            ),
        },
        {
            key: "reason",
            header: "Reason",
            cell: (r) => (
                <span className="text-muted-foreground capitalize">
                    {r.reason?.replace(/_/g, " ") ?? "—"}
                </span>
            ),
        },
        {
            key: "notes",
            header: "Notes",
            cell: (r) => (
                <span className="text-muted-foreground text-xs line-clamp-1">
                    {r.notes ?? "—"}
                </span>
            ),
        },
    ];
}
