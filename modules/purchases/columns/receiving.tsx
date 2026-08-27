import { PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DataTableColumn } from "@/components/DataTable";
import type { Purchase } from "@/modules/purchases/types";

interface GetReceivingColumnsOptions {
    onReceive: (purchase: Purchase) => void;
}

export function getReceivingColumns({
    onReceive,
}: GetReceivingColumnsOptions): DataTableColumn<Purchase>[] {
    return [
        {
            key: "reference_number",
            header: "Purchase",
            sortable: true,
            cell: (p) => (
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                        {p.reference_number ?? p.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {p.item_count} item{p.item_count === 1 ? "" : "s"}
                    </span>
                </div>
            ),
        },
        {
            key: "supplier_name",
            header: "Supplier",
            sortable: true,
            cell: (p) => (
                <span className="text-foreground">{p.supplier_name}</span>
            ),
        },
        {
            key: "total_amount",
            header: "Total",
            align: "right",
            sortable: true,
            cell: (p) => (
                <span className="font-medium">
                    ₱
                    {p.total_amount.toLocaleString(
                        "en-PH",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        },
                    )}
                </span>
            ),
        },
        {
            key: "created_at",
            header: "Ordered",
            sortable: true,
            cell: (p) => (
                <span className="text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            align: "right",
            width: "w-40",
            cell: (p) => (
                <Button
                    size="sm"
                    className="cursor-pointer gap-1.5"
                    onClick={(e) => {
                        e.stopPropagation();
                        onReceive(p);
                    }}
                >
                    <PackageCheck className="h-4 w-4" />
                    Receive
                </Button>
            ),
        },
    ];
}