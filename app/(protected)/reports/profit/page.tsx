"use client";
import { useState } from "react";
import { DollarSign } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { currency, MetricCard, MetricGrid, number, ReportError, ReportHeader, ReportLoading } from "@/modules/reports/components/report-ui";
import { useProfitReport } from "@/modules/reports/services/reports";
import type { ProfitReport, ReportPeriod } from "@/modules/reports/types";
type Product = ProfitReport["by_product"][number];
const columns: DataTableColumn<Product>[] = [
    { key: "product", header: "Product", cell: (row) => <span className="font-medium">{row.product_name}</span> }, { key: "quantity", header: "Qty", align: "right", cell: (row) => number.format(row.quantity_sold) },
    { key: "revenue", header: "Revenue", align: "right", cell: (row) => currency.format(row.revenue) }, { key: "cost", header: "Cost", align: "right", cell: (row) => currency.format(row.cost) },
    { key: "profit", header: "Profit", align: "right", cell: (row) => <span className={row.profit < 0 ? "font-medium text-destructive" : "font-medium text-emerald-600"}>{currency.format(row.profit)}</span> }, { key: "margin", header: "Margin", align: "right", cell: (row) => `${row.margin_percent.toFixed(1)}%` },
];
export default function ProfitReportPage() { const [period, setPeriod] = useState<ReportPeriod>(30); const { data, isLoading, error } = useProfitReport(period); return <div className="space-y-6 pb-12"><ReportHeader title="Profit Report" description="Gross profit and margin based on captured sale costs." icon={DollarSign} period={period} onPeriodChange={setPeriod} />
    {isLoading ? <ReportLoading /> : error || !data ? <ReportError error={error} /> : <><MetricGrid><MetricCard label="Revenue" value={currency.format(data.summary.total_revenue)} /><MetricCard label="Cost of goods" value={currency.format(data.summary.total_cost)} /><MetricCard label="Gross profit" value={currency.format(data.summary.total_profit)} tone={data.summary.total_profit >= 0 ? "good" : "danger"} /><MetricCard label="Gross margin" value={`${data.summary.profit_margin_percent.toFixed(1)}%`} /></MetricGrid><div><h2 className="mb-3 font-semibold">Profit by product</h2><DataTable columns={columns} data={data.by_product} getRowId={(row) => row.product_id} emptyLabel="product profit" /></div></>}
    </div>; }
