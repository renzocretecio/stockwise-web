export type DashboardKpis = {
  sales_today: number;
  sales_yesterday: number;
  sales_change_percent: number | null;
  inventory_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
};
export type ForecastPoint = {
  date: string;
  actual: number | null;
  forecast: number | null;
};
export type DemandForecast = {
  product_id: string;
  product_name: string;
  sku: string | null;
  supplier_id: string | null;
  supplier_name: string | null;
  current_stock: number;
  incoming_stock: number;
  safety_stock: number;
  lead_time_days: number;
  average_daily_sales_7d: number;
  average_daily_sales_30d: number;
  forecast_daily_demand: number;
  lead_time_demand: number;
  recommended_order_quantity: number;
  estimated_stockout_date: string | null;
  order_by_date: string;
  confidence: "high" | "medium" | "low";
  explanation: string[];
  series: ForecastPoint[];
};
export type InventoryAnomaly = {
  id: string;
  product_id: string;
  product_name: string;
  anomaly_type: "negative_stock" | "count_variance" | "large_adjustment";
  severity: "high" | "medium";
  quantity: number;
  title: string;
  detail: string;
  occurred_at: string | null;
};
export type DashboardData = {
  success: boolean;
  as_of: string;
  kpis: DashboardKpis;
  forecasts: DemandForecast[];
  anomalies: InventoryAnomaly[];
};
