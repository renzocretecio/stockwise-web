import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from "@/lib/api-client";
import { executeOrQueue } from "@/lib/offline-sync";
import { InventoryCountCreatePayload, InventoryCountListItem, InventoryCountDetail, RecordCountItemsPayload, RecordCountItemsResponse } from '../types/counts';
import {
    referenceDataKeys,
    type FormReferenceCatalog,
} from "@/modules/offline/services/reference-data";
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
        networkMode: "always",
        mutationFn: (payload: InventoryCountCreatePayload) =>
            executeOrQueue<InventoryCountCreateResponse>(
                "physical_count",
                { ...payload, action: "start" },
                "/api/inventory-counts",
                [countKeys.lists()],
            ).then((result) => {
                if ("queued" in result) {
                    const catalog = queryClient
                        .getQueriesData<FormReferenceCatalog>({
                            queryKey: referenceDataKeys.all,
                        })
                        .map(([, data]) => data)
                        .find((data) => data?.available);
                    const cachedProducts = catalog?.products ?? [];
                    const categoryById = new Map(
                        (catalog?.categories ?? []).map((category) => [
                            category.id,
                            category.name,
                        ]),
                    );
                    const selectedProducts = cachedProducts.filter((product) =>
                        payload.scope === "all"
                            ? true
                            : payload.scope === "category"
                              ? categoryById.get(product.category_id ?? "") ===
                                payload.category
                              : payload.product_ids?.includes(product.id),
                    );

                    queryClient.setQueryData(
                        countKeys.detail(result.clientEventId),
                        {
                            success: true,
                            count: {
                                id: result.clientEventId,
                                name: payload.name,
                                status: "in_progress",
                                scope: payload.scope,
                                total_items: selectedProducts.length,
                                counted_items: 0,
                                items_with_variance: 0,
                                created_at: new Date().toISOString(),
                                finalized_at: null,
                                items: selectedProducts.map((product) => ({
                                    product_id: product.id,
                                    product_name: product.name,
                                    sku: product.sku ?? null,
                                    expected_quantity:
                                        product.quantity ??
                                        product.stock_quantity ??
                                        0,
                                    counted_quantity: null,
                                    variance: null,
                                })),
                            },
                        },
                    );

                    return {
                        success: true,
                        inventory_count_id: result.clientEventId,
                        name: payload.name,
                        status: "in_progress",
                        total_items: 0,
                        message: "Physical count queued for sync.",
                    };
                }
                return "result" in result && result.result
                    ? (result.result as InventoryCountCreateResponse)
                    : result;
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: countKeys.lists() });
        },
    });
};

export const useRecordCountItems = (countId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        networkMode: "always",
        mutationFn: (payload: RecordCountItemsPayload) =>
            executeOrQueue<RecordCountItemsResponse>(
                "physical_count",
                { action: "record", count_id: countId, ...payload },
                `/api/inventory-counts/${countId}/record`,
                [countKeys.detail(countId), countKeys.lists()],
            ).then((result) => {
                if ("queued" in result) {
                    return {
                        success: true,
                        count_id: countId,
                        updated_items: payload.items.length,
                        items: [],
                    };
                }
                return "result" in result && result.result
                    ? (result.result as RecordCountItemsResponse)
                    : result;
            }),
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
        networkMode: "always",
        mutationFn: () =>
            executeOrQueue<FinalizeCountResponse>(
                "physical_count",
                { action: "finalize", count_id: countId },
                `/api/inventory-counts/${countId}/finalize`,
                [
                    countKeys.detail(countId),
                    countKeys.lists(),
                    ["inventory"],
                    ["products"],
                    referenceDataKeys.all,
                ],
            ).then((result) => {
                if ("queued" in result) {
                    return {
                        success: true,
                        count_id: countId,
                        status: "finalized",
                        adjustments_made: 0,
                        message: "Count finalization queued for sync.",
                    };
                }
                return "result" in result && result.result
                    ? (result.result as FinalizeCountResponse)
                    : result;
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: countKeys.detail(countId) });
            queryClient.invalidateQueries({ queryKey: countKeys.lists() });
            // Finalizing creates stock movements and changes StockBalance —
            // refresh those feature areas too.
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: referenceDataKeys.all });
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
