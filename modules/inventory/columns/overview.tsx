import type { DataTableColumn } from "@/components/DataTable";
import { InventoryOverviewItem } from "../types/overview";

const inventoryStatusLabel: Record<
    string,
    { label: string; className: string }
> = {
    in_stock: {
        label: "In stock",
        className: "text-emerald-600 bg-emerald-500/10",
    },
    low_stock: {
        label: "Low stock",
        className: "text-amber-600 bg-amber-500/10",
    },
    out_of_stock: {
        label: "Out of stock",
        className: "text-destructive bg-destructive/10",
    },
};

const formatCurrency = (value: number) => {
    return `${value.toFixed(2)}`;
};

export function getInventoryOverviewColumns(): DataTableColumn<InventoryOverviewItem>[] {
    return [
        {
            key: "product_name",
            header: "Product",
            sortable: true,
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                        {item.product_name}
                    </span>

                    {item.sku && (
                        <span className="font-mono text-xs text-muted-foreground">
                            {item.sku}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "unit",
            header: "Unit",
            cell: (item) => (
                <span className="text-muted-foreground">
                    {item.unit}
                </span>
            ),
        },
        {
            key: "quantity",
            header: "Quantity",
            align: "right",
            sortable: true,
            cell: (item) => (
                <span className="font-medium">
                    {item.quantity}
                </span>
            ),
        },
        {
            key: "reserved_quantity",
            header: "Reserved",
            align: "right",
            sortable: true,
            cell: (item) => (
                <span className="text-muted-foreground">
                    {item.reserved_quantity}
                </span>
            ),
        },
        {
            key: "available_quantity",
            header: "Available",
            align: "right",
            sortable: true,
            cell: (item) => (
                <span className="font-medium">
                    {item.available_quantity}
                </span>
            ),
        },
        {
            key: "average_cost",
            header: "Avg. Cost",
            align: "right",
            sortable: true,
            cell: (item) => (
                <span>
                    {formatCurrency(item.average_cost)}
                </span>
            ),
        },
        {
            key: "stock_value",
            header: "Stock Value",
            align: "right",
            sortable: true,
            cell: (item) => (
                <span className="font-medium">
                    {formatCurrency(item.stock_value)}
                </span>
            ),
        },
        {
            key: "reorder_point",
            header: "Reorder Point",
            align: "right",
            sortable: true,
            cell: (item) => (
                <span>
                    {item.reorder_point}
                </span>
            ),
        },
        {
            key: "safety_stock",
            header: "Safety Stock",
            align: "right",
            sortable: true,
            cell: (item) => (
                <span>
                    {item.safety_stock}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            cell: (item) => {
                const status = inventoryStatusLabel[
                    item.status.toLowerCase()
                ] ?? {
                    label: item.status,
                    className: "text-muted-foreground bg-muted",
                };

                return (
                    <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                    >
                        {status.label}
                    </span>
                );
            },
        },
    ];
}