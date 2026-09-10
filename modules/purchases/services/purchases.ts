import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { executeOrQueue, type QueuedMutation } from "@/lib/offline-sync";
import {
    Purchase,
    PurchaseFormData,
    PurchaseMutationResponse,
    PurchasesResponse,
} from "@/modules/purchases/types";
import { referenceDataKeys } from
    "@/modules/offline/services/reference-data";

export const purchaseKeys = {
    all: ["purchases"] as const,

    lists: () => [...purchaseKeys.all, "list"] as const,

    list: (
        page?: number,
        pageSize?: number,
        status?: string,
        supplierId?: string,
        search?: string,
    ) =>
        [
            ...purchaseKeys.lists(),
            page,
            pageSize,
            status,
            supplierId,
            search,
        ] as const,

    detail: (purchaseId: string) =>
        [...purchaseKeys.all, "detail", purchaseId] as const,
};

export const usePurchases = (
    page: number = 1,
    pageSize: number = 20,
    statusFilter?: string,
    supplierId?: string,
    search?: string,
) => {
    return useQuery({
        queryKey: purchaseKeys.list(
            page,
            pageSize,
            statusFilter,
            supplierId,
            search,
        ),
        queryFn: () =>
            apiClient<PurchasesResponse>(
                `/api/purchases?page=${page}&page_size=${pageSize}` +
                    (statusFilter
                        ? `&status=${encodeURIComponent(statusFilter)}`
                        : "") +
                    (supplierId
                        ? `&supplier_id=${encodeURIComponent(supplierId)}`
                        : "") +
                    (search ? `&search=${encodeURIComponent(search)}` : ""),
            ),
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const usePurchase = (purchaseId: string) => {
    return useQuery({
        queryKey: purchaseKeys.detail(purchaseId),
        queryFn: () => apiClient<Purchase>(`/api/purchases/${purchaseId}`),
        enabled: !!purchaseId,
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useCreatePurchase = () => {
    const queryClient = useQueryClient();

    return useMutation({
        networkMode: "always",
        mutationFn: (payload: PurchaseFormData) =>
            executeOrQueue<PurchaseMutationResponse>(
                "purchase",
                payload,
                "/api/purchases",
                [purchaseKeys.lists()],
            ).then((result) => {
                if ("queued" in result) {
                    return {
                        success: true,
                        message: "Purchase draft queued for sync.",
                    } as PurchaseMutationResponse & QueuedMutation;
                }
                return "result" in result && result.result
                    ? (result.result as PurchaseMutationResponse)
                    : result;
            }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: purchaseKeys.lists(),
            });
        },
    });
};

export const useUpdatePurchase = (purchaseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: PurchaseFormData) =>
            apiClient<PurchaseMutationResponse>(
                `/api/purchases/${purchaseId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(payload),
                },
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: purchaseKeys.lists(),
            });

            queryClient.invalidateQueries({
                queryKey: purchaseKeys.detail(purchaseId),
            });
            queryClient.invalidateQueries({
                queryKey: referenceDataKeys.all,
            });
        },
    });
};

export const useReceivePurchase = (purchaseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            apiClient<PurchaseMutationResponse>(
                `/api/purchases/${purchaseId}/receive`,
                {
                    method: "POST",
                },
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: purchaseKeys.lists(),
            });

            queryClient.invalidateQueries({
                queryKey: purchaseKeys.detail(purchaseId),
            });
            queryClient.invalidateQueries({
                queryKey: referenceDataKeys.all,
            });
        },
    });
};

export const useOrderPurchase = (purchaseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            apiClient<PurchaseMutationResponse>(
                `/api/purchases/${purchaseId}/order`,
                { method: "POST" },
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: purchaseKeys.lists(),
            });
            queryClient.invalidateQueries({
                queryKey: purchaseKeys.detail(purchaseId),
            });
        },
    });
};

export const useCancelPurchase = (purchaseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            apiClient<PurchaseMutationResponse>(
                `/api/purchases/${purchaseId}/cancel`,
                {
                    method: "POST",
                },
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: purchaseKeys.lists(),
            });

            queryClient.invalidateQueries({
                queryKey: purchaseKeys.detail(purchaseId),
            });
        },
    });
};
