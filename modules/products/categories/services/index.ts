import { apiClient } from "@/lib/api-client";
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

export const categoryKeys = {
    all: ['categories'] as const,
    list: (businessId: string, page?: number, search?: string) =>
        ['categories', 'list', businessId, page, search] as const,
    allFlat: (businessId: string) =>
        ['categories', 'all', businessId] as const,   // ← distinct key from paginated list
    detail: (businessId: string, id: string) =>
        ['categories', 'detail', businessId, id] as const,
};

export interface Category {
    id: string;
    business_id: string;
    name: string;
    description: string | null;
    is_active: boolean;
}

interface PaginationMeta {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

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

export const getBusinessIdFromCookie = (): string => {
    const businessId = Cookies.get('active_business_id');
    if (!businessId) {
        throw new Error('No active business selected');
    }
    return businessId;
};

// Paginated list — for a categories management page/table
export const useCategories = (
    businessId: string,
    page: number = 1,
    search?: string
) => {
    return useQuery<CategoriesListResponse>({
        queryKey: categoryKeys.list(businessId, page, search),
        queryFn: () =>
            apiClient<CategoriesListResponse>(
                `/api/categories?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`
            ),
        staleTime: 5 * 60 * 1000,
        enabled: !!businessId,
    });
};

// Unpaginated — for dropdowns/selects (e.g. product form category picker)
export const useAllCategories = () => {
    const businessId = getBusinessIdFromCookie();
    return useQuery<CategoriesAllResponse>({
        queryKey: categoryKeys.allFlat(businessId),
        queryFn: () => apiClient<CategoriesAllResponse>(`/api/categories/all`),
        staleTime: 5 * 60 * 1000,
        enabled: !!businessId,
    });
};