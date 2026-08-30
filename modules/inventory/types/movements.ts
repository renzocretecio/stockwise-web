export interface StockMovementItem {
    id: string;
    product_id: string;
    product_name: string;
    // The API intentionally returns a string so historical/custom movement
    // values remain readable even when new movement types are introduced.
    movement_type: string;
    quantity_change: number;
    reason: string | null;
    reference_type: string | null;
    reference_id: string | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
}
