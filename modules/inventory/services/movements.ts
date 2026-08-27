import { useQuery } from '@tanstack/react-query';
import { apiClient } from "@/lib/api-client";
import type { StockMovementItem } from "../types/movements";
import type { PaginationMeta } from "@/types/pagination";

export const inventoryKeys = {
    all: ['inventory'] as const,
    overview: () => [...inventoryKeys.all, 'overview'] as const,
    overviewList: (page?: number, pageSize?: number, search?: string, status?: string) =>
        [...inventoryKeys.overview(), page, pageSize, search, status] as const,
    movements: () => [...inventoryKeys.all, 'movements'] as const,
    movementsList: (
        page?: number,
        pageSize?: number,
        productId?: string,
        movementType?: string
    ) => [...inventoryKeys.movements(), page, pageSize, productId, movementType] as const,
};

interface StockMovementsResponse {
    success: boolean;
    movements: StockMovementItem[];
    pagination: PaginationMeta;
}

export const useStockMovements = (
    page: number = 1,
    pageSize: number = 50,
    productId?: string,
    movementType?: string
) => {
    return useQuery({
        queryKey: inventoryKeys.movementsList(page, pageSize, productId, movementType),
        queryFn: () =>
            apiClient<StockMovementsResponse>(
                `/api/inventory/movements?page=${page}&page_size=${pageSize}` +
                    (productId ? `&product_id=${encodeURIComponent(productId)}` : "") +
                    (movementType ? `&movement_type=${encodeURIComponent(movementType)}` : "")
            ),
        staleTime: 60 * 1000,
    });
};