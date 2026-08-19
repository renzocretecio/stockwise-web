import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from "@/lib/api-client";
import Cookies from 'js-cookie';

export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (businessId: string) => [...productKeys.lists(), businessId] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (businessId: string, id: string) => [...productKeys.details(), businessId, id] as const,
    suppliers: () => ['suppliers'] as const,
    suppliersList: (businessId: string) => [...productKeys.suppliers(), businessId] as const,
};

export interface FormData {
    name: string;
    sku?: string;
    barcode?: string;
    supplier_id?: string;
    cost_price: number;
    selling_price: number;
    reorder_point?: number;
    safety_stock?: number;
    category?: string;
    brand?: string;
    unit?: string;
    lead_time_days?: number;
    is_perishable?: boolean;
    description?: string;
}

interface Supplier {
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

interface SupplierResponse {
    success: boolean;
    suppliers: Supplier[];
}

interface ProductResponse {
    success: boolean;
    product_id: string;
    message: string;
}

// Get business ID from cookie
export const getBusinessIdFromCookie = (): string => {
    const businessId = Cookies.get('active_business_id');
    if (!businessId) {
        throw new Error('No active business selected');
    }
    return businessId;
};

// Create product mutation
export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: FormData) =>
        apiClient<ProductResponse>(
            "/api/products",
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
        ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: productKeys.lists(),
            });
        },
    });
};

// Get single product
export const useProduct = (productId: string) => {
    const businessId = getBusinessIdFromCookie();

    return useQuery({
        queryKey: productKeys.detail(businessId, productId),
        queryFn: () =>
            apiClient(`/api/products/${productId}`),
        enabled: !!productId,
        staleTime: 5 * 60 * 1000,
    });
};

// Get all products
export const useProducts = (page: number = 1, pageSize: number = 20, search?: string) => {
    const businessId = getBusinessIdFromCookie();

    return useQuery({
        queryKey: [...productKeys.list(businessId), page, pageSize, search],
        queryFn: () =>
            apiClient(
                `/api/products?page=${page}&page_size=${pageSize}${
                    search ? `&search=${encodeURIComponent(search)}` : ""
                }`,
                {
                    headers: {
                        'X-Business-ID': businessId,
                    },
                }
            ),
        staleTime: 5 * 60 * 1000,
    });
};

// Get suppliers
export const useSuppliers = () => {
    const businessId = getBusinessIdFromCookie();

    return useQuery({
        queryKey: productKeys.suppliersList(businessId),
        queryFn: () => apiClient<SupplierResponse>('/api/suppliers'),
        staleTime: 10 * 60 * 1000,
    });
};

// Update product
export const useUpdateProduct = (productId: string) => {
    const queryClient = useQueryClient();
    const businessId = getBusinessIdFromCookie();

    return useMutation({
        mutationFn: (payload: Partial<FormData>) =>
            apiClient(`/api/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: productKeys.detail(businessId, productId),
            });
            queryClient.invalidateQueries({
                queryKey: productKeys.list(businessId),
            });
        },
    });
};

// Delete product
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    const businessId = getBusinessIdFromCookie();

    return useMutation({
        mutationFn: (productId: string) =>
            apiClient(`/api/products/${productId}`, {
                method: 'DELETE',
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: productKeys.list(businessId),
            });
        },
    });
};