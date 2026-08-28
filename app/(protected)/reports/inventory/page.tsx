"use client";
import { Package } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { BarList, currency, MetricCard, MetricGrid, number, ReportError, ReportHeader, ReportLoading } from "@/modules/reports/components/report-ui";
import { useInventoryReport } from "@/modules/reports/services/reports";
import type { InventoryReport } from "@/modules/reports/types";
type Category = InventoryReport["by_category"][number];
const columns: DataTableColumn<Category>[] = [
    { key: "category", header: "Category", cell: (row) => <span className="font-medium">{row.category}</span> },
    { key: "products", header: "Products", align: "right", cell: (row) => number.format(row.product_count) },
    { key: "units", header: "Units", align: "right", cell: (row) => number.format(row.total_units) },
    { key: "value", header: "Stock value", align: "right", cell: (row) => <span className="font-medium">{currency.format(row.stock_value)}</span> },
];
export default function InventoryReportPage() { const { data, isLoading, error } = useInventoryReport(); return <div className="space-y-6 pb-12"><ReportHeader title="Inventory Report" description="Current stock valuation and category distribution." icon={Package} />
    {isLoading ? <ReportLoading /> : error || !data ? <ReportError error={error} /> : <><MetricGrid><MetricCard label="Stock value" value={currency.format(data.summary.total_stock_value)} /><MetricCard label="Active products" value={number.format(data.summary.total_products)} /><MetricCard label="Total units" value={number.format(data.summary.total_units)} /><MetricCard label="Stock alerts" value={number.format(data.summary.low_stock_count + data.summary.out_of_stock_count)} tone="warning" note={`${data.summary.out_of_stock_count} out of stock`} /></MetricGrid>
    <BarList title="Value by category" items={data.by_category} getKey={(row) => row.category} getLabel={(row) => row.category} getValue={(row) => row.stock_value} formatValue={currency.format} /><div><h2 className="mb-3 font-semibold">Category breakdown</h2><DataTable columns={columns} data={data.by_category} getRowId={(row) => row.category} emptyLabel="category" /></div></>}
    </div>; }
