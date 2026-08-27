export type ImportProductRow = {
    row_number: number;
    sku: string;
    barcode: string;
    name: string;
    description: string;
    category: string;
    brand: string;
    unit: string;
    cost_price: number;
    selling_price: number;
    reorder_point: number;
    safety_stock: number;
    lead_time_days: number;
    is_perishable: boolean;
    supplier_name: string;
};

export type ImportPreview = {
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    rows: ImportProductRow[];
    errors: unknown[];
};

export type ImportPreviewResponse = {
    business_id: string;
    filename: string;
    preview: ImportPreview;
};