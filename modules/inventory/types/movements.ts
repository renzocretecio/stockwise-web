export interface StockMovementItem {
    id: string;
    product_id: string;
    product_name: string;
    movement_type:
        | "purchase_receive"
        | "sale"
        | "adjustment"
        | "count_adjustment"
        | "return";
    quantity_change: number;
    reason: string | null;
    reference_type: string | null;
    reference_id: string | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
}