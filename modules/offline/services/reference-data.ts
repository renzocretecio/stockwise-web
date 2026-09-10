"use client";

import { useQuery } from "@tanstack/react-query";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { apiClient } from "@/lib/api-client";
import {
    readReferenceData,
    replaceReferenceData,
    type ReferenceDataPayload,
} from "@/lib/offline-db";
import { useSession } from "@/modules/auth/services/session";
import { useOfflineEntitlement } from
    "@/modules/billing/services/billing";

export type FormReferenceProduct =
    ReferenceDataPayload["products"][number] & {
        quantity: number;
        stock_quantity: number;
    };

export type FormReferenceCatalog = Omit<
    ReferenceDataPayload,
    "products"
> & {
    available: boolean;
    source: "server" | "offline";
    products: FormReferenceProduct[];
};

export const referenceDataKeys = {
    all: ["reference-data", "supplier-products-v1"] as const,
    catalog: (
        businessId?: string,
        connection?: "online" | "offline",
    ) => [
        ...referenceDataKeys.all,
        businessId,
        connection,
    ] as const,
};

function emptyCatalog(
    businessId: string,
): FormReferenceCatalog {
    return {
        success: true,
        available: false,
        source: "offline",
        business_id: businessId,
        generated_at: "",
        products: [],
        suppliers: [],
        supplier_products: [],
        categories: [],
        stock_balances: [],
    };
}

function buildCatalog(
    payload: ReferenceDataPayload,
    source: FormReferenceCatalog["source"],
): FormReferenceCatalog {
    const supplierProducts =
        payload.supplier_products?.length > 0
            ? payload.supplier_products
            : payload.products.flatMap((product) =>
                  product.supplier_id
                      ? [
                            {
                                product_id: product.id,
                                supplier_id: product.supplier_id,
                                supplier_sku: product.sku,
                                unit_cost: Number(product.cost_price),
                                lead_time_days: product.lead_time_days,
                                minimum_order_quantity: 1,
                                pack_size: 1,
                                is_preferred: true,
                                updated_at: product.updated_at,
                            },
                        ]
                      : [],
              );
    const stockByProduct = new Map(
        payload.stock_balances.map((balance) => [
            balance.product_id,
            Number(balance.quantity),
        ]),
    );

    return {
        ...payload,
        supplier_products: supplierProducts,
        available: true,
        source,
        products: payload.products.map((product) => {
            const quantity = stockByProduct.get(product.id) ?? 0;
            return {
                ...product,
                cost_price: Number(product.cost_price),
                selling_price: Number(product.selling_price),
                reorder_point: Number(product.reorder_point),
                safety_stock: Number(product.safety_stock),
                quantity,
                stock_quantity: quantity,
            };
        }),
    };
}

export function useReferenceCatalog() {
    const session = useSession();
    const entitlement = useOfflineEntitlement();
    const isOnline = useOnlineStatus();
    const businessId = session.data?.active_business?.id;
    const connection = isOnline ? "online" : "offline";

    return useQuery({
        queryKey: referenceDataKeys.catalog(
            businessId,
            connection,
        ),
        queryFn: async () => {
            if (!businessId) {
                throw new Error("No active business selected");
            }

            if (!isOnline) {
                const saved = await readReferenceData(businessId);
                return saved
                    ? buildCatalog(saved, "offline")
                    : emptyCatalog(businessId);
            }

            const payload = await apiClient<ReferenceDataPayload>(
                "/api/sync/reference-data",
            );

            if (entitlement.enabled) {
                await replaceReferenceData(payload);
            }

            return buildCatalog(payload, "server");
        },
        enabled: Boolean(
            businessId &&
            entitlement.resolved &&
            (isOnline || entitlement.enabled),
        ),
        networkMode: "always",
        staleTime: 5 * 60 * 1000,
        refetchOnMount: isOnline,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: false,
    });
}
