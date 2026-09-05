import { PaginationMeta } from "@/types/pagination";

export type PurchaseStatus = "draft" | "ordered" | "received" | "cancelled";

export type PurchaseItem = {
    id?: string;
    product_id: string;
    product_name?: string;
    sku?: string | null;
    quantity: number;
    unit_cost: number;
    line_total?: number;
};

export type Purchase = {
    id: string;
    supplier_id: string;
    supplier_name: string;
    reference_number: string | null;
    status: PurchaseStatus;
    expected_delivery_date?: string | null;
    items: PurchaseItem[];
    item_count: number;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    notes: string | null;
    created_at: string;
    ordered_at?: string | null;
    received_at?: string | null;
};

export type PurchaseFormData = {
    supplier_id: string;
    reference_number: string;
    expected_delivery_date: string | null;
    items: {
        product_id: string;
        quantity: number;
        unit_cost: number;
    }[];
    tax_amount: number;
    discount_amount: number;
    notes: string;
};

export type PurchasesResponse = {
    success: boolean;
    purchases: Purchase[];
    pagination: PaginationMeta;
};

export type PurchaseDetailResponse = {
    success: boolean;
    purchase: Purchase;
};

export type PurchaseMutationResponse = {
    success: boolean;
    purchase?: Purchase;
    purchase_id?: string;
    message?: string;
};
