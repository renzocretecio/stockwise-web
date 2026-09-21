import { useMutation, useQuery, useQueryClient } from
    "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type {
    PublicOrderPayload,
    PublicOrderResponse,
    StoreCategoriesResponse,
    StoreOrder,
    StoreOrdersResponse,
    StoreOrderStatus,
    StoreProduct,
    StoreProductPayload,
    StoreProductsResponse,
    Storefront,
    StorefrontPayload,
} from "@/modules/storefront/types";

export const storefrontKeys = {
    all: ["storefront"] as const,
    detail: () => [...storefrontKeys.all, "detail"] as const,
    products: () => [...storefrontKeys.all, "products"] as const,
    productList: (page: number, pageSize: number, search: string) =>
        [
            ...storefrontKeys.products(),
            page,
            pageSize,
            search,
        ] as const,
    orders: () => [...storefrontKeys.all, "orders"] as const,
    orderList: (
        page: number,
        pageSize: number,
        status: string,
        search: string,
    ) =>
        [
            ...storefrontKeys.orders(),
            page,
            pageSize,
            status,
            search,
        ] as const,
    publicStore: (slug: string) =>
        ["public-store", slug] as const,
    publicProducts: (
        slug: string,
        page: number,
        search: string,
        categoryId: string,
    ) =>
        [
            "public-store",
            slug,
            "products",
            page,
            search,
            categoryId,
        ] as const,
    publicCategories: (slug: string) =>
        ["public-store", slug, "categories"] as const,
};

export function useStorefront() {
    return useQuery({
        queryKey: storefrontKeys.detail(),
        queryFn: () => apiClient<Storefront>("/api/storefront"),
        retry: false,
        staleTime: 5 * 60 * 1000,
    });
}

export function useSaveStorefront(exists: boolean) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: StorefrontPayload) =>
            apiClient<Storefront>("/api/storefront", {
                method: exists ? "PATCH" : "POST",
                body: JSON.stringify(payload),
            }),
        onSuccess: (store) => {
            queryClient.setQueryData(storefrontKeys.detail(), store);
            void queryClient.invalidateQueries({
                queryKey: storefrontKeys.all,
            });
        },
    });
}

export function useStoreProducts(
    page: number,
    pageSize: number,
    search: string,
    enabled = true,
) {
    return useQuery({
        queryKey: storefrontKeys.productList(
            page,
            pageSize,
            search,
        ),
        queryFn: () => {
            const query = new URLSearchParams({
                page: String(page),
                page_size: String(pageSize),
            });
            if (search) query.set("search", search);
            return apiClient<StoreProductsResponse>(
                `/api/storefront/products?${query}`,
            );
        },
        enabled,
        staleTime: 2 * 60 * 1000,
    });
}

export function useUpdateStoreProduct(productId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: StoreProductPayload) =>
            apiClient<StoreProduct>(
                `/api/storefront/products/${productId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(payload),
                },
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: storefrontKeys.products(),
            });
        },
    });
}

export function useBulkPublishStoreProducts() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: {
            product_ids: string[];
            is_public: boolean;
        }) =>
            apiClient<{ updated_count: number; is_public: boolean }>(
                "/api/storefront/products",
                {
                    method: "PUT",
                    body: JSON.stringify(payload),
                },
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: storefrontKeys.products(),
            });
        },
    });
}

export function useStoreOrders(
    page: number,
    pageSize: number,
    status: string,
    search: string,
    enabled = true,
) {
    return useQuery({
        queryKey: storefrontKeys.orderList(
            page,
            pageSize,
            status,
            search,
        ),
        queryFn: () => {
            const query = new URLSearchParams({
                page: String(page),
                page_size: String(pageSize),
            });
            if (status !== "all") query.set("status", status);
            if (search) query.set("search", search);
            return apiClient<StoreOrdersResponse>(
                `/api/storefront/orders?${query}`,
            );
        },
        enabled,
        staleTime: 30 * 1000,
    });
}

export function useUpdateStoreOrderStatus(orderId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: {
            status: StoreOrderStatus;
            cancellation_reason?: string;
        }) =>
            apiClient<StoreOrder>(
                `/api/storefront/orders/${orderId}/status`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
            ),
        onSuccess: () => {
            for (const queryKey of [
                storefrontKeys.orders(),
                ["inventory"],
                ["sales"],
                ["dashboard"],
            ]) {
                void queryClient.invalidateQueries({ queryKey });
            }
        },
    });
}

export function usePublicStore(slug: string) {
    return useQuery({
        queryKey: storefrontKeys.publicStore(slug),
        queryFn: () =>
            apiClient<Storefront>(`/api/public/stores/${slug}`),
        enabled: Boolean(slug),
        staleTime: 5 * 60 * 1000,
    });
}

export function usePublicProducts(
    slug: string,
    page: number,
    search: string,
    categoryId: string,
) {
    return useQuery({
        queryKey: storefrontKeys.publicProducts(
            slug,
            page,
            search,
            categoryId,
        ),
        queryFn: () => {
            const query = new URLSearchParams({
                page: String(page),
                page_size: "24",
            });
            if (search) query.set("search", search);
            if (categoryId) query.set("category_id", categoryId);
            return apiClient<StoreProductsResponse>(
                `/api/public/stores/${slug}/products?${query}`,
            );
        },
        enabled: Boolean(slug),
        staleTime: 2 * 60 * 1000,
    });
}

export function usePublicCategories(slug: string) {
    return useQuery({
        queryKey: storefrontKeys.publicCategories(slug),
        queryFn: () =>
            apiClient<StoreCategoriesResponse>(
                `/api/public/stores/${slug}/categories`,
            ),
        enabled: Boolean(slug),
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreatePublicOrder(slug: string) {
    return useMutation({
        mutationFn: (payload: PublicOrderPayload) =>
            apiClient<PublicOrderResponse>(
                `/api/public/stores/${slug}/orders`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
            ),
    });
}

export function usePublicOrder(reference: string, token: string) {
    return useQuery({
        queryKey: ["public-order", reference, token],
        queryFn: () =>
            apiClient<StoreOrder>(
                `/api/public/orders/${reference}?token=` +
                    encodeURIComponent(token),
            ),
        enabled: Boolean(reference && token),
        staleTime: 30 * 1000,
    });
}
