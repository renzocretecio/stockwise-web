"use client";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { BarList, MetricCard, MetricGrid, number, ReportError, ReportHeader, ReportLoading } from "@/modules/reports/components/report-ui";
import { useStockMovementReport } from "@/modules/reports/services/reports";
import type { ReportPeriod, StockMovementReport } from "@/modules/reports/types";
type Movement = StockMovementReport["by_type"][number];
const columns: DataTableColumn<Movement>[] = [
    { key: "type", header: "Movement type", cell: (row) => <span className="font-medium capitalize">{row.movement_type.replaceAll("_", " ")}</span> },
    { key: "count", header: "Movements", align: "right", cell: (row) => number.format(row.total_movements) },
    { key: "quantity", header: "Net quantity change", align: "right", cell: (row) => <span className={row.total_quantity_change < 0 ? "font-medium text-destructive" : "font-medium text-emerald-600"}>{row.total_quantity_change > 0 ? "+" : ""}{number.format(row.total_quantity_change)}</span> },
];
export default function MovementReportPage() { const [period, setPeriod] = useState<ReportPeriod>(30); const { data, isLoading, error } = useStockMovementReport(period); const inbound = data?.by_type.filter((row) => row.total_quantity_change > 0).reduce((sum, row) => sum + row.total_quantity_change, 0) ?? 0; const outbound = data?.by_type.filter((row) => row.total_quantity_change < 0).reduce((sum, row) => sum + Math.abs(row.total_quantity_change), 0) ?? 0; return <div className="space-y-6 pb-12"><ReportHeader title="Stock Movement Report" description="Inventory inflows, outflows, and adjustments by movement type." icon={ArrowLeftRight} period={period} onPeriodChange={setPeriod} />
    {isLoading ? <ReportLoading /> : error || !data ? <ReportError error={error} /> : <><MetricGrid><MetricCard label="Movement records" value={number.format(data.total_movements)} /><MetricCard label="Inbound units" value={`+${number.format(inbound)}`} tone="good" /><MetricCard label="Outbound units" value={`-${number.format(outbound)}`} tone="danger" /><MetricCard label="Net change" value={number.format(inbound - outbound)} /></MetricGrid><BarList title="Net quantity by type" items={data.by_type} getKey={(row) => row.movement_type} getLabel={(row) => row.movement_type.replaceAll("_", " ")} getValue={(row) => row.total_quantity_change} formatValue={(value) => `${value > 0 ? "+" : ""}${number.format(value)}`} /><DataTable columns={columns} data={data.by_type} getRowId={(row) => row.movement_type} emptyLabel="movement summary" /></>}
    </div>; }
