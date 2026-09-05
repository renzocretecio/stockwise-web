import { Pencil, Trash2 } from "lucide-react";

import type { DataTableColumn } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "../types";

const stockStatusLabel: Record<
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
      cell: (product) => (
        <div className="min-w-40">
          <p className="font-medium text-foreground">{product.name}</p>
          {product.sku ? (
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {product.sku}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "category_name",
      header: "Category",
      cell: (product) => (
        <span className="text-muted-foreground">
          {product.category_name ?? product.category ?? "Uncategorized"}
        </span>
      ),
    },
    {
      key: "supplier_name",
      header: "Supplier",
      cell: (product) => (
        <span className="text-muted-foreground">
          {product.supplier_name ?? "—"}
        </span>
      ),
    },
    {
      key: "quantity",
      header: "Stock",
      align: "right",
      sortable: true,
      cell: (product) => (
        <span className="whitespace-nowrap font-medium tabular-nums">
          {product.quantity ?? product.stock_quantity ?? 0} {product.unit ?? "unit"}
        </span>
      ),
    },
    {
      key: "selling_price",
      header: "Price",
      align: "right",
      sortable: true,
      cell: (product) => (
        <span className="whitespace-nowrap tabular-nums">
          {product.selling_price != null
            ? formatCurrency(product.selling_price)
            : "—"}
        </span>
      ),
    },
    {
      key: "margin_percent",
      header: "Margin",
      align: "right",
      sortable: true,
      cell: (product) => {
        const margin = product.margin_percent ?? 0;
        return (
          <span
            className={
              margin < 0 ? "text-destructive" : "text-emerald-600"
            }
          >
            {margin.toFixed(1)}%
          </span>
        );
      },
    },
    {
      key: "stock_status",
      header: "Status",
      cell: (product) => {
        const status = stockStatusLabel[product.stock_status] ?? {
          label: "Unknown",
          className: "bg-muted text-muted-foreground",
        };
        return (
          <span
            className={
              "inline-flex whitespace-nowrap px-2 py-0.5 text-xs font-medium " +
              status.className
            }
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
      cell: (product) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            aria-label={`Edit ${product.name}`}
            className="size-8 p-0"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(product);
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            aria-label={`Delete ${product.name}`}
            className="size-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(product);
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
}
