import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import {
    SupplierCreateResponse,
    SupplierFormData,
    SupplierResponse,
    SuppliersResponse,
} from "@/modules/suppliers/types";

export const supplierKeys = {
    all: ["suppliers"] as const,

    lists: () => [...supplierKeys.all, "list"] as const,

    detail: (supplierId: string) =>
        [...supplierKeys.all, "detail", supplierId] as const,
};

export const useSuppliers = (
    page: number = 1,
    pageSize: number = 10,
    search?: string,
) => {
    return useQuery({
        queryKey: [...supplierKeys.lists(), page, pageSize, search],

        queryFn: () =>
            apiClient<SuppliersResponse>(
                `/api/suppliers?page=${page}&page_size=${pageSize}` +
                    (search ? `&search=${encodeURIComponent(search)}` : ""),
            ),

        staleTime: 1000 * 60 * 2,
    });
};

export const useSupplier = (supplierId: string) => {
    return useQuery({
        queryKey: supplierKeys.detail(supplierId),

        queryFn: () =>
            apiClient<SupplierResponse>(`/api/suppliers/${supplierId}`),

        enabled: !!supplierId,
    });
};

export const useCreateSupplier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: SupplierFormData) =>
            apiClient<SupplierCreateResponse>("/api/suppliers", {
                method: "POST",
                body: JSON.stringify(payload),
            }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: supplierKeys.lists(),
            });
        },
    });
};

export const useUpdateSupplier = (supplierId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: Partial<SupplierFormData>) =>
            apiClient<SupplierResponse>(`/api/suppliers/${supplierId}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: supplierKeys.lists(),
            });

            queryClient.invalidateQueries({
                queryKey: supplierKeys.detail(supplierId),
            });
        },
    });
};

export const useDeleteSupplier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (supplierId: string) =>
            apiClient(`/api/suppliers/${supplierId}`, {
                method: "DELETE",
            }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: supplierKeys.lists(),
            });
        },
    });
};
