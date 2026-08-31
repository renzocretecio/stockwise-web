import { PackageCheck, Eye, Pencil, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DataTableColumn } from "@/components/DataTable";
import { Purchase, PurchaseStatus } from "@/modules/purchases/types";
import { formatCurrency } from "@/lib/currency";

const statusLabel: Record<PurchaseStatus, { label: string; className: string }> = {
    draft: {
        label: "Draft",
        className: "text-muted-foreground bg-muted",
    },
    ordered: {
        label: "Awaiting receipt",
        className: "text-amber-600 bg-amber-500/10",
    },
    received: {
        label: "Received",
        className: "text-emerald-600 bg-emerald-500/10",
    },
    cancelled: {
        label: "Cancelled",
        className: "text-muted-foreground bg-muted",
    },
};

interface GetPurchaseColumnsOptions {
    onView: (purchase: Purchase) => void;
    onEdit: (purchase: Purchase) => void;
    onOrder: (purchase: Purchase) => void;
    onReceive: (purchase: Purchase) => void;
}

export function getPurchaseColumns({
    onView,
    onEdit,
    onOrder,
    onReceive,
}: GetPurchaseColumnsOptions): DataTableColumn<Purchase>[] {
    const columns: DataTableColumn<Purchase>[] = [
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
            cell: (p) => <span className="text-foreground">{p.supplier_name}</span>,
        },
        {
            key: "status",
            header: "Status",
            cell: (p) => {
                const status = statusLabel[p.status];
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
            key: "total_amount",
            header: "Total",
            align: "right",
            sortable: true,
            cell: (p) => (
                <span className="font-medium">{formatCurrency(p.total_amount)}</span>
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
            key: "received_at",
            header: "Received",
            cell: (p) => (
                <span className="text-muted-foreground">
                    {p.received_at
                        ? new Date(p.received_at).toLocaleDateString()
                        : "—"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            align: "right",
            width: "w-52",
            cell: (p) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(p);
                        }}
                        aria-label={`View ${p.reference_number ?? p.id}`}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>

                    {p.status === "draft" && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(p);
                                }}
                                aria-label={`Edit ${p.reference_number ?? p.id}`}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="cursor-pointer gap-1.5"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOrder(p);
                                }}
                            >
                                <Send className="h-4 w-4" />
                                Place order
                            </Button>
                        </>
                    )}

                    {p.status === "ordered" && (
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
                    )}
                </div>
            ),
        },
    ];

    return columns;
}
