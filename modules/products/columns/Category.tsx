import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DataTableColumn } from "@/components/DataTable";
import { Category } from "../types/category";

interface GetCategoryColumnsOptions {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function getCategoryColumns({
  onEdit,
  onDelete,
}: GetCategoryColumnsOptions): DataTableColumn<Category>[] {
  return [
    {
      key: "name",
      header: "Category",
      sortable: true,
      cell: (c) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{c.name}</span>
          {c.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              {c.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "product_count",
      header: "Products",
      align: "center",
      sortable: true,
      cell: (c) => (
        <span className="inline-flex items-center justify-center min-w-[1.75rem] px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
          {c.product_count}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      cell: (c) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            c.is_active
              ? "text-emerald-600 bg-emerald-500/10"
              : "text-muted-foreground bg-muted"
          }`}
        >
          {c.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      cell: (c) =>
        c.created_at ? (
          <span className="text-muted-foreground">
            {new Date(c.created_at).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "w-24",
      cell: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(c);
            }}
            aria-label={`Edit ${c.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(c);
            }}
            aria-label={`Delete ${c.name}`}
            disabled={c.product_count > 0}
            title={
              c.product_count > 0
                ? "Reassign or remove products from this category first"
                : "Delete category"
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}