"use client";
import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { BarList, currency, MetricCard, MetricGrid, number, ReportError, ReportHeader, ReportLoading } from "@/modules/reports/components/report-ui";
import { useSalesReport } from "@/modules/reports/services/reports";
import type { ReportPeriod, SalesReport } from "@/modules/reports/types";

type Product = SalesReport["top_products"][number];
const columns: DataTableColumn<Product>[] = [
    { key: "product", header: "Product", cell: (row) => <span className="font-medium">{row.product_name}</span> },
    { key: "quantity", header: "Qty sold", align: "right", cell: (row) => number.format(row.quantity_sold) },
    { key: "revenue", header: "Revenue", align: "right", cell: (row) => currency.format(row.revenue) },
    { key: "profit", header: "Profit", align: "right", cell: (row) => <span className="font-medium text-emerald-600">{currency.format(row.profit)}</span> },
];
export default function SalesReportPage() {
    const [period, setPeriod] = useState<ReportPeriod>(30); const { data, isLoading, error } = useSalesReport(period);
    return <div className="space-y-6 pb-12"><ReportHeader title="Sales Report" description="Revenue, profit, sales volume, and best-selling products." icon={TrendingUp} period={period} onPeriodChange={setPeriod} />
        {isLoading ? <ReportLoading /> : error || !data ? <ReportError error={error} /> : <><MetricGrid>
            <MetricCard label="Revenue" value={currency.format(data.summary.total_revenue)} /><MetricCard label="Gross profit" value={currency.format(data.summary.total_profit)} tone="good" />
            <MetricCard label="Completed sales" value={number.format(data.summary.total_sales)} note={`${number.format(data.summary.total_items_sold)} units sold`} /><MetricCard label="Average sale" value={currency.format(data.summary.average_sale_value)} note={`${data.summary.voided_count} voided`} />
        </MetricGrid><BarList title="Daily revenue" items={data.by_day} getKey={(row) => row.date} getLabel={(row) => new Date(`${row.date}T00:00:00`).toLocaleDateString("en-PH", { month: "short", day: "numeric" })} getValue={(row) => row.revenue} formatValue={currency.format} />
        <div><h2 className="mb-3 font-semibold">Top products</h2><DataTable columns={columns} data={data.top_products} getRowId={(row) => row.product_id} emptyLabel="product sale" /></div></>}
    </div>;
}
