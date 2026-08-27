import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DataTableColumn } from "@/components/DataTable";
import type { InventoryCountListItem } from "@/modules/inventory/types/counts";

const statusLabel: Record<
    InventoryCountListItem["status"],
    { label: string; className: string }
> = {
    in_progress: {
        label: "In progress",
        className: "text-amber-600 bg-amber-500/10",
    },
    finalized: {
        label: "Completed",
        className: "text-emerald-600 bg-emerald-500/10",
    },
    cancelled: {
        label: "Cancelled",
        className: "text-muted-foreground bg-muted",
    },
};

interface GetCountColumnsOptions {
    onView: (count: InventoryCountListItem) => void;
}

export function getCountColumns({
    onView,
}: GetCountColumnsOptions): DataTableColumn<InventoryCountListItem>[] {
    return [
        {
            key: "name",
            header: "Count session",
            sortable: true,
            cell: (c) => <span className="font-medium text-foreground">{c.name}</span>,
        },
        {
            key: "status",
            header: "Status",
            cell: (c) => {
                const status = statusLabel[c.status];
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
            key: "progress",
            header: "Progress",
            cell: (c) => {
                const pct =
                c.total_items > 0
                    ? Math.round((c.counted_items / c.total_items) * 100)
                    : 0;
                return (
                <div className="flex items-center gap-2 min-w-[140px]">
                    <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                    />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                    {c.counted_items}/{c.total_items}
                    </span>
                </div>
                );
            },
        },
        {
            key: "created_at",
            header: "Started",
            sortable: true,
            cell: (c) => (
                <span className="text-muted-foreground">
                {new Date(c.created_at).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: "finalized_at",
            header: "Finalized",
            cell: (c) => (
                <span className="text-muted-foreground">
                {c.finalized_at
                    ? new Date(c.finalized_at).toLocaleDateString()
                    : "—"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            align: "right",
            width: "w-20",
            cell: (c) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        onView(c);
                    }}
                    aria-label={`View ${c.name}`}
                    >
                    <Eye className="h-4 w-4" />
                </Button>
            ),
        },
    ];
}