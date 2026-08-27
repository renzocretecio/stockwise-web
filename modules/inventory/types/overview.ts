import type { PaginationMeta } from "@/types/pagination";

export type InventoryOverviewItem = {
    product_id: string;
    product_name: string;
    sku: string;
    unit: string;
    quantity: number;
    reserved_quantity: number;
    available_quantity: number;
    average_cost: number;
    stock_value: number;
    reorder_point: number;
    safety_stock: number;
    status: string;
};

export type StockOverviewSummary = {
    total_products: number;
    total_stock_value: number;
    low_stock_count: number;
    out_of_stock_count: number;
};

export type InventoryOverviewResponse = {
    success: boolean;
    items: InventoryOverviewItem[];
    summary: StockOverviewSummary;
    pagination: PaginationMeta;
};