export type SupplierImportRow = {
    row_number: number;
    name: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    payment_terms: string | null;
    lead_time_days: number;
    notes: string | null;
};

export type SupplierImportError = {
    row_number: number;
    message: string;
};

export type SupplierImportPreview = {
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    rows: SupplierImportRow[];
    errors: SupplierImportError[];
};

export type SupplierImportPreviewResponse = {
    business_id: string;
    filename: string;
    preview: SupplierImportPreview;
};

export type SupplierImportCommitResponse = {
    created: number;
    errors: Array<{
        row_number: number;
        field: string;
        message: string;
    }>;
    message: string;
};
