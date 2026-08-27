import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from "@/lib/api-client";
import { inventoryKeys } from "./movements";
import {StockAdjustmentResponse, AdjustStockFormData} from "../types/adjustments"

export const useAdjustStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AdjustStockFormData) =>
            apiClient<StockAdjustmentResponse>("/api/inventory/adjustments", {
                method: "POST",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            // An adjustment changes both current stock levels AND creates a
            // movement record, so invalidate both feature areas — plus the
            // Products list, since quantity/stock_status live on the product
            // response too.
            queryClient.invalidateQueries({ queryKey: inventoryKeys.overview() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};