export type ReportPeriod = 7 | 30 | 90 | 365;

export type ReportDateRange = {
    startDate: string;
    endDate: string;
};

export type SalesReportTopProduct = {
    product_id: string;
    product_name: string;
    sku: string | null;
    quantity_sold: number;
    units_per_day: number;
    current_stock: number;
    days_of_stock_remaining: number | null;
    revenue: number;
    profit: number;
};

export type SalesReportSlowProduct = {
    product_id: string;
    product_name: string;
    sku: string | null;
    current_stock: number;
    inventory_value: number;
    last_sale_date: string | null;
    days_without_sale: number;
    classification: "slow" | "very_slow" | "dead_stock";
};

export type SalesReport = {
    success: boolean;
    period_days: number;
    summary: {
        total_sales: number;
        total_revenue: number;
        total_profit: number;
        total_items_sold: number;
        average_sale_value: number;
        voided_count: number;
    };
    by_day: {
        date: string;
        revenue: number;
        profit: number;
        sales_count: number;
    }[];
    top_products: SalesReportTopProduct[];
    slow_products: SalesReportSlowProduct[];
};

export type OperationalMetrics = {
    success: boolean;
    period_days: number;
    stock_accuracy_rate: number | null;
    counted_items: number;
    accurate_items: number;
    inventory_days: number | null;
    inventory_value: number;
    period_cogs: number;
    shrinkage_rate: number | null;
    shrinkage_units: number;
    shrinkage_value: number;
    receipt_completion_rate: number | null;
    ordered_purchases: number;
    received_purchases: number;
};

export type PurchaseReport = {
    success: boolean;
    period_days: number;
    summary: {
        total_purchases: number;
        total_spent: number;
        total_items_received: number;
        average_purchase_value: number;
        pending_count: number;
    };
    by_day: { date: string; spent: number; purchases_count: number }[];
    by_supplier: {
        supplier_id: string;
        supplier_name: string;
        total_spent: number;
        purchases_count: number;
    }[];
};

export type InventoryReport = {
    success: boolean;
    summary: {
        total_products: number;
        total_stock_value: number;
        total_units: number;
        low_stock_count: number;
        out_of_stock_count: number;
    };
    by_category: {
        category: string;
        product_count: number;
        stock_value: number;
        total_units: number;
    }[];
};

export type ProfitReport = {
    success: boolean;
    period_days: number;
    summary: {
        total_revenue: number;
        total_cost: number;
        total_profit: number;
        profit_margin_percent: number;
    };
    by_product: {
        product_id: string;
        product_name: string;
        quantity_sold: number;
        revenue: number;
        cost: number;
        profit: number;
        margin_percent: number;
    }[];
};

export type LowStockReport = {
    success: boolean;
    total_items: number;
    items: {
        product_id: string;
        product_name: string;
        sku: string | null;
        quantity: number;
        reorder_point: number;
        safety_stock: number;
        supplier_id: string | null;
        supplier_name: string | null;
        lead_time_days: number;
        status: "low_stock" | "out_of_stock";
    }[];
};

export type StockMovementReport = {
    success: boolean;
    period_days: number;
    total_movements: number;
    by_type: {
        movement_type: string;
        total_movements: number;
        total_quantity_change: number;
    }[];
};
