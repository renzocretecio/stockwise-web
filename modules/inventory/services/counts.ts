import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from "@/lib/api-client";
import { InventoryCountCreatePayload, InventoryCountListItem, InventoryCountDetail, RecordCountItemsPayload, RecordCountItemsResponse } from '../types/counts';
export const countKeys = {
    all: ['inventory-counts'] as const,
    lists: () => [...countKeys.all, 'list'] as const,
    detail: (countId: string) => [...countKeys.all, 'detail', countId] as const,
};  

// ============================================================================
// Queries
// ============================================================================

interface InventoryCountsResponse {
    success: boolean;
    counts: InventoryCountListItem[];
}

export const useInventoryCounts = () => {
    return useQuery({
        queryKey: countKeys.lists(),
        queryFn: () => apiClient<InventoryCountsResponse>('/api/inventory-counts'),
        staleTime: 30 * 1000,
    });
};

interface InventoryCountDetailResponse {
    success: boolean;
    count: InventoryCountDetail;
}

export const useInventoryCountDetail = (countId: string) => {
    return useQuery({
        queryKey: countKeys.detail(countId),
        queryFn: () => apiClient<InventoryCountDetailResponse>(`/api/inventory-counts/${countId}`),
        enabled: !!countId,
        staleTime: 10 * 1000, // short — this view is actively being edited during a session
    });
};

// ============================================================================
// Mutations
// ============================================================================

interface InventoryCountCreateResponse {
    success: boolean;
    inventory_count_id: string;
    name: string;
    status: string;
    total_items: number;
    message: string;
}

export const useStartCount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: InventoryCountCreatePayload) =>
            apiClient<InventoryCountCreateResponse>('/api/inventory-counts', {
                method: 'POST',
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: countKeys.lists() });
        },
    });
};

interface RecordCountItemResponse {
    success: boolean;
    product_id: string;
    expected_quantity: number;
    counted_quantity: number;
    variance: number;
}

export const useRecordCountItems = (countId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RecordCountItemsPayload) =>
            apiClient<RecordCountItemsResponse>(
                `/api/inventory-counts/${countId}/record`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: countKeys.detail(countId),
            });

            queryClient.invalidateQueries({
                queryKey: countKeys.lists(),
            });
        },
    });
};

interface FinalizeCountResponse {
    success: boolean;
    count_id: string;
    status: string;
    adjustments_made: number;
    message: string;
}

export const useFinalizeCount = (countId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            apiClient<FinalizeCountResponse>(
                `/api/inventory-counts/${countId}/finalize`,
                { method: 'POST' }
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: countKeys.detail(countId) });
            queryClient.invalidateQueries({ queryKey: countKeys.lists() });
            // Finalizing creates stock movements and changes StockBalance —
            // refresh those feature areas too.
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useCancelCount = (countId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            apiClient(`/api/inventory-counts/${countId}/cancel`, {
                method: 'POST',
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: countKeys.detail(countId) });
            queryClient.invalidateQueries({ queryKey: countKeys.lists() });
        },
    });
};