import { Pencil, Trash2 } from "lucide-react";

import type { DataTableColumn } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import type { Category } from "../types/category";

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
      cell: (category) => (
        <div className="min-w-52">
          <p className="font-medium text-foreground">{category.name}</p>
          {category.description ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {category.description}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "product_count",
      header: "Active products",
      align: "right",
      cell: (category) => (
        <span className="font-medium tabular-nums">
          {category.product_count ?? 0}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "w-24",
      cell: (category) => {
        const hasProducts = category.product_count > 0;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              aria-label={`Edit ${category.name}`}
              className="size-8 p-0"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(category);
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              aria-label={`Delete ${category.name}`}
              className={
                "size-8 p-0 text-destructive hover:bg-destructive/10 " +
                "hover:text-destructive"
              }
              disabled={hasProducts}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(category);
              }}
              size="sm"
              title={
                hasProducts
                  ? "Reassign or remove its products before deleting"
                  : "Delete category"
              }
              type="button"
              variant="ghost"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
