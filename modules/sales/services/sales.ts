import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { executeOrQueue } from "@/lib/offline-sync";
import { referenceDataKeys } from
    "@/modules/offline/services/reference-data";
import {
    SaleCreateResponse,
    SaleDetailResponse,
    SaleFormData,
    SaleReturnFormData,
    SaleReturnResponse,
    SaleReturnsResponse,
    SalesResponse,
    SaleVoidResponse,
} from "@/modules/sales/types";

export const saleKeys = {
    all: ["sales"] as const,

    lists: () => [
        ...saleKeys.all,
        "list",
    ] as const,

    list: (
        page: number,
        pageSize: number,
        search?: string,
    ) => [
        ...saleKeys.lists(),
        page,
        pageSize,
        search,
    ] as const,

    detail: (saleId: string) => [
        ...saleKeys.all,
        "detail",
        saleId,
    ] as const,

    returns: () => [...saleKeys.all, "returns"] as const,

    returnList: (page: number, pageSize: number, search?: string) => [
        ...saleKeys.returns(),
        page,
        pageSize,
        search,
    ] as const,
};

export const useSaleReturns = (
    page: number = 1,
    pageSize: number = 20,
    search?: string,
) => useQuery({
    queryKey: saleKeys.returnList(page, pageSize, search),
    queryFn: () => apiClient<SaleReturnsResponse>(
        `/api/sales/returns?page=${page}&page_size=${pageSize}` +
        (search ? `&search=${encodeURIComponent(search)}` : ""),
    ),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
});

export const useSales = (
    page: number = 1,
    pageSize: number = 10,
    search?: string,
) => {
    return useQuery({
        queryKey: saleKeys.list(
            page,
            pageSize,
            search,
        ),

        queryFn: () =>
            apiClient<SalesResponse>(
                `/api/sales?page=${page}&page_size=${pageSize}` +
                    (search
                        ? `&search=${encodeURIComponent(search)}`
                        : ""),
            ),

        staleTime: 2 * 60 * 1000,
    });
};

export const useSale = (
    saleId: string,
) => {
    return useQuery({
        queryKey: saleKeys.detail(saleId),

        queryFn: () =>
            apiClient<SaleDetailResponse>(
                `/api/sales/${saleId}`,
            ),

        enabled: !!saleId,
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useCreateSale = () => {
    const queryClient = useQueryClient();

    return useMutation({
        networkMode: "always",
        mutationFn: (
            payload: SaleFormData,
        ) =>
            executeOrQueue<SaleCreateResponse>(
                "sale",
                payload,
                "/api/sales",
                [
                    saleKeys.lists(),
                    ["products"],
                    ["inventory"],
                    referenceDataKeys.all,
                ],
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: saleKeys.lists(),
            });

            queryClient.invalidateQueries({
                queryKey: ["products"],
            });

            queryClient.invalidateQueries({
                queryKey: ["inventory"],
            });
            queryClient.invalidateQueries({
                queryKey: referenceDataKeys.all,
            });
        },
    });
};

export const useVoidSale = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            saleId,
            reason
        }:{
            saleId: string,
            reason: string
        }) =>
            apiClient<SaleVoidResponse>(
                `/api/sales/${saleId}/void`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        reason,
                    }),
                },
            ),

        onSuccess: (
            _,
            variables,
        ) => {
            queryClient.invalidateQueries({
                queryKey: saleKeys.lists(),
            });

            queryClient.invalidateQueries({
                queryKey: saleKeys.detail(
                    variables.saleId,
                ),
            });
            queryClient.invalidateQueries({
                queryKey: referenceDataKeys.all,
            });
        },
    });
};

export const useCreateSaleReturn = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            saleId,
            payload,
        }: {
            saleId: string;
            payload: SaleReturnFormData;
        }) =>
            apiClient<SaleReturnResponse>(
                `/api/sales/${saleId}/returns`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
            ),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: saleKeys.lists(),
            });
            queryClient.invalidateQueries({
                queryKey: saleKeys.detail(variables.saleId),
            });
            queryClient.invalidateQueries({
                queryKey: saleKeys.returns(),
            });
            queryClient.invalidateQueries({
                queryKey: ["products"],
            });
            queryClient.invalidateQueries({
                queryKey: ["inventory"],
            });
            queryClient.invalidateQueries({
                queryKey: referenceDataKeys.all,
            });
        },
    });
};
