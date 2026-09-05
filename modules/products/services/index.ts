import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from "@/lib/api-client";
import {ProductsResponse, OverallStatusResponse } from '../types';

export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: () => [...productKeys.lists()] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
    suppliers: () => ['suppliers'] as const,
    suppliersList: () => [...productKeys.suppliers()] as const,
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
    category_id?: string;
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
            queryClient.invalidateQueries({
                queryKey: ["overall-status-products"],
            });
        },
    });
};

// Get single product
export const useProduct = (productId: string) => {

    return useQuery<ProductsResponse>({
        queryKey: productKeys.detail(productId),
        queryFn: () =>
            apiClient(`/api/products/${productId}`),
        enabled: !!productId,
        staleTime: 5 * 60 * 1000,
    });
};

// Get all products
export const useProducts = (page: number = 1, pageSize: number = 20, search?: string) => {

    return useQuery({
        queryKey: [...productKeys.list(), page, pageSize, search],
        queryFn: () =>
            apiClient<ProductsResponse>(
                `/api/products?page=${page}&page_size=${pageSize}${
                    search ? `&search=${encodeURIComponent(search)}` : ""
                }`,
            ),
        staleTime: 5 * 60 * 1000,
    });
};

// Get suppliers
export const useSuppliers = () => {
    return useQuery({
        queryKey: productKeys.suppliersList(),
        queryFn: () => apiClient<SupplierResponse>('/api/suppliers'),
        staleTime: 10 * 60 * 1000,
    });
};

// Update product
export const useUpdateProduct = (productId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: Partial<FormData>) =>
            apiClient(`/api/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: productKeys.detail(productId),
            });
            queryClient.invalidateQueries({
                queryKey: productKeys.list(),
            });
            queryClient.invalidateQueries({
                queryKey: ["overall-status-products"],
            });
        },
    });
};

// Delete product
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: string) =>
            apiClient(`/api/products/${productId}`, {
                method: 'DELETE',
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: productKeys.list(),
            });
            queryClient.invalidateQueries({
                queryKey: ["overall-status-products"],
            });
        },
    });
};

export const useProductOverallStats = () => {
    return useQuery({
        queryKey: ["overall-status-products"],
        queryFn: () => apiClient<OverallStatusResponse>('/api/products/status/overview'),
        staleTime: 10 * 60 * 1000,
    })
}
