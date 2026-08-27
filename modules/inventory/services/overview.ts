import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from "@/lib/api-client";
import { PaginationMeta } from "@/types/pagination";
import {InventoryOverviewResponse} from "@/modules/inventory/types/overview";

export const overviewKeys = {
    all: ['inventory'] as const,
    lists: () => [...overviewKeys.all, 'overview'] as const,
}

export const useStockOverview = (page: number = 1, pageSize: number = 10, searchQuery?: string, status?: string) => {
    return useQuery<InventoryOverviewResponse>({
        queryKey: [...overviewKeys.all, page, pageSize, searchQuery, status],
        queryFn: () => 
            apiClient<InventoryOverviewResponse>(
                `/api/inventory/overview?page=${page}&page_size=${pageSize}` +
                    (searchQuery
                        ? `&search=${encodeURIComponent(searchQuery)}`
                        : "") +
                    (status && status !== "all"
                        ? `&status=${encodeURIComponent(status)}`
                        : ""),
            ),
        staleTime: 1000 * 60 * 2,
    })
}