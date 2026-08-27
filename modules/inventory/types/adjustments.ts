export interface StockAdjustmentResponse {
    success: boolean;
    product_id: string;
    quantity_before: number;
    quantity_after: number;
    quantity_change: number;
    message: string;
}

export interface AdjustStockFormData {
    product_id: string;
    quantity_change: number;
    reason: AdjustmentReason;
    notes: string;
}

export type AdjustmentReason =
    | "damage"
    | "shrinkage"
    | "expiry"
    | "found"
    | "correction"
    | "other";