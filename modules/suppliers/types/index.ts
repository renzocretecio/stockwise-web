export interface Supplier {
    id: string; 
    business_id: string; 
    name: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null; 
    address: string | null;
    payment_terms: string | null;
    lead_time_days: number;
    is_active: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateSupplierInput {
    name: string;
    contact_person?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    payment_terms?: string | null;
    lead_time_days?: number;
    is_active?: boolean;
    notes?: string | null;
}


export type UpdateSupplierInput = Partial<CreateSupplierInput>;


export interface SuppliersResponse {
    success: boolean
    suppliers: Supplier[];
}
