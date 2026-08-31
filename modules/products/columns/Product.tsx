import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DataTableColumn } from "@/components/DataTable";
import { Product } from "../types";
import { formatCurrency } from "@/lib/currency";

const stockStatusLabel: Record<
    Product["stock_status"],
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

interface GetProductColumnsOptions {
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}

export function getProductColumns({
    onEdit,
    onDelete,
}: GetProductColumnsOptions): DataTableColumn<Product>[] {
    return [
        {
            key: "name",
            header: "Product",
            sortable: true,
            cell: (p) => (
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">{p.name}</span>
                    {p.sku && (
                        <span className="text-xs text-muted-foreground font-mono">
                        {p.sku}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "category_name",
            header: "Category",
            cell: (p) => (
                <span className="text-muted-foreground">
                    {p.category_name ?? "Uncategorized"}
                </span>
            ),
        },
        {
        key: "supplier_name",
        header: "Supplier",
            cell: (p) => (
                <span className="text-muted-foreground">
                    {p.supplier_name ?? "—"}
                </span>
            ),
        },
        {
            key: "quantity",
            header: "Stock",
            align: "right",
            sortable: true,
            cell: (p) => (
                <span className="font-medium">
                    {p.quantity} {p.unit}
                </span>
            ),
        },
        {
            key: "selling_price",
            header: "Price",
            align: "right",
            sortable: true,
            cell: (p) => <span>{p.selling_price && formatCurrency(p.selling_price)}</span>,
            },
        {
            key: "margin_percent",
            header: "Margin",
            align: "right",
            sortable: true,
            cell: (p) => (
                <span className="text-emerald-600">
                    {p.margin_percent.toFixed(1)}%
                </span>
            ),
        },
        {
            key: "stock_status",
            header: "Status",
            cell: (p) => {
                const status = stockStatusLabel[p.stock_status];
                return (
                <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}
                >
                    {status.label}
                </span>
                );
            },
        },
        {
            key: "actions",
            header: "",
            align: "right",
            width: "w-24",
            cell: (p) => (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer"
                        onClick={(e) => {
                        e.stopPropagation();
                        onEdit(p);
                        }}
                        aria-label={`Edit ${p.name}`}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                        e.stopPropagation();
                        onDelete(p);
                        }}
                        aria-label={`Delete ${p.name}`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];
}