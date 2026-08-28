"use client";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { MetricCard, MetricGrid, number, ReportError, ReportHeader, ReportLoading } from "@/modules/reports/components/report-ui";
import { useLowStockReport } from "@/modules/reports/services/reports";
import type { LowStockReport } from "@/modules/reports/types";
type Item = LowStockReport["items"][number];
const columns: DataTableColumn<Item>[] = [
    { key: "product", header: "Product", cell: (row) => <div><p className="font-medium">{row.product_name}</p><p className="text-xs text-muted-foreground">{row.sku || "No SKU"}</p></div> },
    { key: "status", header: "Status", cell: (row) => <Badge variant={row.status === "out_of_stock" ? "destructive" : "secondary"}>{row.status.replaceAll("_", " ")}</Badge> },
    { key: "quantity", header: "On hand", align: "right", cell: (row) => number.format(row.quantity) }, { key: "reorder", header: "Reorder point", align: "right", cell: (row) => number.format(row.reorder_point) },
    { key: "supplier", header: "Supplier", cell: (row) => <div><p>{row.supplier_name || "Not assigned"}</p><p className="text-xs text-muted-foreground">{row.lead_time_days} day lead time</p></div> },
];
export default function LowStockReportPage() { const { data, isLoading, error } = useLowStockReport(); const out = data?.items.filter((item) => item.status === "out_of_stock").length ?? 0; return <div className="space-y-6 pb-12"><ReportHeader title="Low Stock Report" description="Products requiring replenishment attention." icon={AlertTriangle} />
    {isLoading ? <ReportLoading /> : error || !data ? <ReportError error={error} /> : <><MetricGrid><MetricCard label="Products requiring attention" value={number.format(data.total_items)} tone="warning" /><MetricCard label="Out of stock" value={number.format(out)} tone={out ? "danger" : "default"} /><MetricCard label="Low stock" value={number.format(data.total_items - out)} /><MetricCard label="Without supplier" value={number.format(data.items.filter((item) => !item.supplier_id).length)} tone="warning" /></MetricGrid><DataTable columns={columns} data={data.items} getRowId={(row) => row.product_id} emptyLabel="low-stock product" /></>}
    </div>; }
