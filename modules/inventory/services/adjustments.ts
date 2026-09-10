import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executeOrQueue } from "@/lib/offline-sync";
import { inventoryKeys } from "./movements";
import {StockAdjustmentResponse, AdjustStockFormData} from "../types/adjustments"
import { referenceDataKeys } from
    "@/modules/offline/services/reference-data";

export const useAdjustStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        networkMode: "always",
        mutationFn: (payload: AdjustStockFormData) =>
            executeOrQueue<StockAdjustmentResponse>(
                "stock_adjustment",
                payload,
                "/api/inventory/adjustments",
                [
                    inventoryKeys.overview(),
                    inventoryKeys.movements(),
                    ['products'],
                    referenceDataKeys.all,
                ],
            ),
        onSuccess: () => {
            // An adjustment changes both current stock levels AND creates a
            // movement record, so invalidate both feature areas — plus the
            // Products list, since quantity/stock_status live on the product
            // response too.
            queryClient.invalidateQueries({ queryKey: inventoryKeys.overview() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: referenceDataKeys.all });
        },
    });
};
