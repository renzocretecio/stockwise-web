import type { PaginationMeta } from "@/types/pagination";

export type OutOfStockBehavior =
    | "mark_sold_out"
    | "hide"
    | "continue_selling";

export type StorePaymentMethod =
    | "cod"
    | "gcash"
    | "bank_transfer"
    | "pay_on_pickup";

export type DeliveryMethod = "pickup" | "delivery";

export type StoreOrderStatus =
    | "new"
    | "confirmed"
    | "processing"
    | "ready"
    | "shipped"
    | "completed"
    | "cancelled";

export type Storefront = {
    id: string;
    business_id?: string;
    slug: string;
    public_url: string;
    name: string;
    description?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
    currency_code: string;
    is_active?: boolean;
    out_of_stock_behavior?: OutOfStockBehavior;
    pickup_enabled: boolean;
    delivery_enabled: boolean;
    payment_methods: StorePaymentMethod[];
    payment_instructions: Partial<Record<StorePaymentMethod, string>>;
    created_at?: string;
    updated_at?: string;
};

export type StorefrontPayload = {
    name: string;
    slug?: string;
    description?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
    is_active: boolean;
    out_of_stock_behavior: OutOfStockBehavior;
    pickup_enabled: boolean;
    delivery_enabled: boolean;
    payment_methods: StorePaymentMethod[];
    payment_instructions: Partial<Record<StorePaymentMethod, string>>;
};

export type StoreCategory = {
    id: string;
    name: string;
    product_count?: number;
};

export type StoreProduct = {
    id: string | null;
    product_id: string;
    name: string;
    description?: string | null;
    price: number;
    image_url?: string | null;
    category?: StoreCategory | null;
    availability: "in_stock" | "sold_out";
    sku?: string | null;
    is_public?: boolean;
    sort_order?: number;
    available_quantity?: number;
};

export type StoreProductPayload = {
    is_public: boolean;
    public_name?: string | null;
    public_description?: string | null;
    public_price?: number | null;
    public_image_url?: string | null;
    sort_order: number;
};

export type StoreOrderItem = {
    id: string;
    product_id: string;
    product_name: string;
    sku?: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
};

export type StoreOrder = {
    id: string;
    store_id?: string;
    business_id?: string;
    sale_id?: string | null;
    store_name?: string;
    store_slug?: string;
    currency_code?: string;
    payment_instructions?: string | null;
    reference_number: string;
    status: StoreOrderStatus;
    customer_name: string;
    customer_contact: string;
    delivery_method: DeliveryMethod;
    delivery_address?: string | null;
    customer_notes?: string | null;
    payment_method: StorePaymentMethod;
    subtotal: number;
    total_amount: number;
    items: StoreOrderItem[];
    created_at: string;
    confirmed_at?: string | null;
    processing_at?: string | null;
    ready_at?: string | null;
    shipped_at?: string | null;
    completed_at?: string | null;
    cancelled_at?: string | null;
    cancellation_reason?: string | null;
};

export type StoreProductsResponse = {
    products: StoreProduct[];
    published_count: number;
    pagination: PaginationMeta;
};

export type StoreOrdersResponse = {
    orders: StoreOrder[];
    pagination: PaginationMeta;
};

export type StoreCategoriesResponse = {
    categories: StoreCategory[];
};

export type PublicOrderPayload = {
    items: Array<{
        store_product_id: string;
        quantity: number;
    }>;
    customer_name: string;
    customer_contact: string;
    delivery_method: DeliveryMethod;
    delivery_address?: string | null;
    customer_notes?: string | null;
    payment_method: StorePaymentMethod;
};

export type PublicOrderResponse = {
    order: StoreOrder;
    tracking_token: string;
};
