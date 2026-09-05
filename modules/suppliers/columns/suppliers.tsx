"use client";

import type { DataTableColumn } from "@/components/DataTable";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Supplier } from "@/modules/suppliers/types";

type SupplierColumnsOptions = {
    onEdit: (supplier: Supplier) => void;
    onDelete: (supplier: Supplier) => void;
};

export function getSupplierColumns({
    onEdit,
    onDelete,
}: SupplierColumnsOptions): DataTableColumn<Supplier>[] {
    return [
        {
            key: "name",
            header: "Name",
            cell: (row) => <span className="font-medium">{row.name}</span>,
        },
        {
            key: "contact_person",
            header: "Contact",
            cell: (row) => row.contact_person || "—",
        },
        {
            key: "email",
            header: "Email",
            cell: (row) => row.email || "—",
        },
        {
            key: "phone",
            header: "Phone",
            cell: (row) => row.phone || "—",
        },
        {
            key: "lead_time_days",
            header: "Lead Time",
            cell: (row) => {
                const days = row.lead_time_days;

                return (
                    <span>
                        {days} {days === 1 ? "day" : "days"}
                    </span>
                );
            },
        },
        {
            key: "actions",
            header: "",
            align: "right",
            width: "w-24",
            cell: (row) => {
                const supplier = row;

                return (
                    <div className="flex items-center justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="size-8 p-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(supplier);
                            }}
                            aria-label={`Edit ${supplier.name}`}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={
                                "size-8 p-0 text-destructive hover:bg-destructive/10 " +
                                "hover:text-destructive"
                            }
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(supplier);
                            }}
                            aria-label={`Delete ${supplier.name}`}
                            title="Delete Supplier"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];
}
