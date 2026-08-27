export type CountScope = "all" | "category" | "custom";
export type CountStatus = "in_progress" | "finalized" | "cancelled";

export interface InventoryCountListItem {
    id: string;
    name: string;
    status: CountStatus;
    total_items: number;
    counted_items: number;
    created_at: string;
    finalized_at: string | null;
}

export interface InventoryCountItemPreview {
    product_id: string;
    product_name: string;
    sku: string | null;
    expected_quantity: number;
    counted_quantity: number | null;
    variance: number | null;
}

export interface InventoryCountDetail {
    id: string;
    name: string;
    status: CountStatus;
    scope: string;
    total_items: number;
    counted_items: number;
    items_with_variance: number;
    created_at: string;
    finalized_at: string | null;
    items: InventoryCountItemPreview[];
}

export interface InventoryCountCreatePayload {
    name: string;
    scope: CountScope;
    category?: string;
    product_ids?: string[];
}

export type RecordCountItemPayload = {
    product_id: string;
    counted_quantity: number;
    notes?: string | null;
};

export type RecordCountItemsPayload = {
    items: RecordCountItemPayload[];
};

export type RecordCountItemResult = {
    product_id: string;
    expected_quantity: number;
    counted_quantity: number;
    variance: number;
};

export type RecordCountItemsResponse = {
    success: boolean;
    count_id: string;
    updated_items: number;
    items: RecordCountItemResult[];
};