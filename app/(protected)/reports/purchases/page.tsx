"use client";
import { useState } from "react";
import { TrendingDown } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { BarList, currency, MetricCard, MetricGrid, number, ReportError, ReportHeader, ReportLoading } from "@/modules/reports/components/report-ui";
import { usePurchaseReport } from "@/modules/reports/services/reports";
import type { PurchaseReport, ReportPeriod } from "@/modules/reports/types";
type Supplier = PurchaseReport["by_supplier"][number];
const columns: DataTableColumn<Supplier>[] = [
    { key: "supplier", header: "Supplier", cell: (row) => <span className="font-medium">{row.supplier_name}</span> },
    { key: "purchases", header: "Received orders", align: "right", cell: (row) => number.format(row.purchases_count) },
    { key: "spent", header: "Total spent", align: "right", cell: (row) => <span className="font-medium">{currency.format(row.total_spent)}</span> },
];
export default function PurchaseReportPage() {
    const [period, setPeriod] = useState<ReportPeriod>(30); const { data, isLoading, error } = usePurchaseReport(period);
    return <div className="space-y-6 pb-12"><ReportHeader title="Purchase Report" description="Received purchasing spend and supplier performance." icon={TrendingDown} period={period} onPeriodChange={setPeriod} />
        {isLoading ? <ReportLoading /> : error || !data ? <ReportError error={error} /> : <><MetricGrid><MetricCard label="Total spent" value={currency.format(data.summary.total_spent)} /><MetricCard label="Received purchases" value={number.format(data.summary.total_purchases)} /><MetricCard label="Units received" value={number.format(data.summary.total_items_received)} /><MetricCard label="Awaiting action" value={number.format(data.summary.pending_count)} tone={data.summary.pending_count ? "warning" : "default"} note="Draft and ordered purchases" /></MetricGrid>
        <BarList title="Daily purchasing spend" items={data.by_day} getKey={(row) => row.date} getLabel={(row) => new Date(`${row.date}T00:00:00`).toLocaleDateString("en-PH", { month: "short", day: "numeric" })} getValue={(row) => row.spent} formatValue={currency.format} />
        <div><h2 className="mb-3 font-semibold">Spend by supplier</h2><DataTable columns={columns} data={data.by_supplier} getRowId={(row) => row.supplier_id} emptyLabel="supplier purchase" /></div></>}
    </div>;
}
