export type DashboardKpis = {
  sales_today: number;
  sales_yesterday: number;
  sales_change_percent: number | null;
  inventory_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
};
export type InventoryRiskSummary = {
  stock_days_threshold: number;
  out_of_stock_skus: number;
  low_stock_skus: number;
  below_reorder_point: number;
  below_days_of_stock: number;
  pending_reorder_recommendations: number;
  expected_deliveries_today: number;
  late_purchase_orders: number;
  estimated_sales_at_risk: number;
};
export type InventoryAgingBucket = {
  key: "active" | "slowing" | "at_risk" | "dead_stock";
  sku_count: number;
  inventory_value: number;
};
export type InventoryEfficiencyAction = {
  product_id: string;
  product_name: string;
  sku: string | null;
  classification: InventoryAgingBucket["key"];
  current_stock: number;
  inventory_value: number;
  last_sale_date: string | null;
  days_without_sale: number;
  excess_units: number;
  excess_value: number;
  is_perishable: boolean;
  suggested_action: string;
};
export type InventoryEfficiencySummary = {
  dead_stock_value: number;
  dead_stock_percentage: number;
  slow_moving_skus: number;
  perishable_skus: number;
  overstocked_products: number;
  capital_tied_up: number;
  aging_buckets: InventoryAgingBucket[];
  actions: InventoryEfficiencyAction[];
};
export type DashboardTrendPoint = {
  date: string;
  revenue: number;
  gross_profit: number;
  items_sold: number;
  order_count: number;
  inventory_value: number;
  stockout_count: number;
  dead_stock_value: number;
  inventory_turnover: number;
  purchase_receipts: number;
  adjustments: number;
  discrepancies: number;
};
export type DashboardTrendsData = {
  success: boolean;
  start_date: string;
  end_date: string;
  granularity: "day" | "week" | "month";
  inventory_valuation_method: string;
  points: DashboardTrendPoint[];
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
  estimated_unit_cost: number;
  estimated_order_cost: number;
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
  inventory_risk: InventoryRiskSummary;
  inventory_efficiency: InventoryEfficiencySummary;
  forecasts: DemandForecast[];
  anomalies: InventoryAnomaly[];
};
