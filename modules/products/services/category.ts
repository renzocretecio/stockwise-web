import { apiClient } from "@/lib/api-client";
import { useMutation, useQuery } from '@tanstack/react-query';
import { Category } from "../types/category";
import { PaginationMeta } from "../types";
import { useQueryClient } from "@tanstack/react-query";
import { CategoryFormData, CategoryCreateResponse } from "../types/category";

export const categoryKeys = {
    all: ['categories'] as const,
    listPrefix: () => ['categories', 'list'] as const,
    list: (page?: number, page_size?: number, search?: string) =>
        ['categories', 'list', page, page_size, search] as const,
    allFlat: () => ['categories', 'all'] as const,
    detail: (id: string) => ['categories', 'detail', id] as const,
};

interface CategoriesListResponse {
    success: boolean;
    categories: Category[];
    total: number;
    pagination?: PaginationMeta;
}

interface CategoriesAllResponse {
    success: boolean;
    categories: Category[];
    total: number;
}

// Paginated list — for a categories management page/table
export const useCategories = (
    page: number = 1,
    page_size: number = 10,
    search?: string
) => {    
    return useQuery<CategoriesListResponse>({
        queryKey: categoryKeys.list(page, page_size, search),
        queryFn: () =>
            apiClient<CategoriesListResponse>(
                `/api/categories?page=${page}&page_size=${page_size}${search ? `&search=${encodeURIComponent(search)}` : ""}`
            ),
        staleTime: 5 * 60 * 1000,
    });
};

// Unpaginated — for dropdowns/selects (e.g. product form category picker)
export const useAllCategories = () => {
    return useQuery<CategoriesAllResponse>({
        queryKey: categoryKeys.allFlat(),
        queryFn: () => apiClient<CategoriesAllResponse>(`/api/categories/all`),
        staleTime: 5 * 60 * 1000,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CategoryFormData) => apiClient<CategoryCreateResponse>("/api/categories", {method: "POST", body: JSON.stringify(payload)}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.listPrefix() });
            queryClient.invalidateQueries({ queryKey: categoryKeys.allFlat() });
        }
    })
}

export const useUpdateCategory = (categoryId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: Partial<CategoryFormData>) =>
            apiClient(`/api/categories/${categoryId}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.listPrefix() });
            queryClient.invalidateQueries({ queryKey: categoryKeys.allFlat() });
        },
    });
}

export const useDeleteCategory = (categoryId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => apiClient<CategoryCreateResponse>(`/api/categories/${categoryId}`, {method: "DELETE"}),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['categories', 'list'],
            });
            queryClient.invalidateQueries({
                queryKey: categoryKeys.allFlat(),
            });
        }
    })
}
