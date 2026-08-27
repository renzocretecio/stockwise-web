export type SaleStatus =
    | "completed"
    | "partially_returned"
    | "returned"
    | "voided";

export type PaymentMethod =
    | "cash"
    | "card"
    | "gcash"
    | "bank_transfer";

export type SaleItem = {
    id: string;
    product_id: string;
    product_name: string;
    sku?: string | null;

    quantity: number;
    unit_price: number;
    unit_cost: number;
    discount_amount: number;
    line_total: number;
    line_profit?: number;
    returned_quantity?: number;
    returnable_quantity?: number;
    created_at?: string;
};

export type Sale = {
    id: string;
    reference_number: string | null;
    status: SaleStatus;

    sale_date: string;

    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;

    payment_method: PaymentMethod;
    notes: string | null;

    items: SaleItem[];
    item_count: number;

    created_by?: string | null;
    voided_by?: string | null;
    voided_at?: string | null;

    created_at: string;
    updated_at?: string;
};

export type SaleFormItem = {
    product_id: string;
    quantity: number;
    unit_price: number;
};

export type SaleFormData = {
    reference_number: string;
    items: SaleFormItem[];
    payment_method: PaymentMethod;
    tax_amount: number;
    discount_amount: number;
    notes: string;
};

export type PaginationMeta = {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
};

export type SalesResponse = {
    success: boolean;
    sales: Sale[];
    pagination: PaginationMeta;
};

export type SaleDetailResponse = Sale;

export type SaleReturnFormData = {
    reason: string;
    notes?: string;
    items: {
        sale_item_id: string;
        quantity: number;
    }[];
};

export type SaleReturnResponse = {
    success: boolean;
    return_id: string;
    sale_id: string;
    sale_status: SaleStatus;
    refund_amount: number;
    message: string;
};

export type SaleReturn = {
    id: string;
    sale_id: string;
    sale_reference_number: string | null;
    status: "completed" | "cancelled";
    reason: string;
    notes: string | null;
    refund_amount: number;
    item_count: number;
    total_quantity: number;
    created_by: string | null;
    created_at: string;
};

export type SaleReturnsResponse = {
    success: boolean;
    returns: SaleReturn[];
    pagination: PaginationMeta;
};

export type SaleCreateResponse = {
    success: boolean;
    sale_id: string;
    status: SaleStatus;
    total_amount: number;
    message: string;
};

export type SaleVoidResponse = {
    success: boolean;
    sale_id: string;
    status: SaleStatus;
    message: string;
};
