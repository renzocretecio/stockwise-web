import Dexie, { type Table } from "dexie";
import type {
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client";

export type OfflineOperationStatus =
  | "pending"
  | "syncing"
  | "failed"
  | "conflict"
  | "auth-required";

export type OfflineMutationType =
  | "sale"
  | "stock_adjustment"
  | "physical_count"
  | "purchase";

export type OfflineOperation = {
  id: string;
  idempotencyKey: string;
  type: OfflineMutationType;
  payload: unknown;
  occurredAt: string;
  invalidateQueryKeys: readonly (readonly unknown[])[];
  status: OfflineOperationStatus;
  createdAt: number;
  updatedAt: number;
  attempts: number;
  lastAttemptAt?: number;
  syncStartedAt?: number;
  error?: string;
};

export type ReferenceProduct = {
  key: string;
  business_id: string;
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  supplier_id: string | null;
  category_id: string | null;
  cost_price: number;
  selling_price: number;
  unit: string;
  reorder_point: number;
  safety_stock: number;
  lead_time_days: number;
  is_perishable: boolean;
  updated_at: string;
};

export type ReferenceSupplier = {
  key: string;
  business_id: string;
  id: string;
  name: string;
  lead_time_days: number;
  updated_at: string;
};

export type ReferenceSupplierProduct = {
  key: string;
  business_id: string;
  product_id: string;
  supplier_id: string;
  supplier_sku: string | null;
  unit_cost: number;
  lead_time_days: number;
  minimum_order_quantity: number;
  pack_size: number;
  is_preferred: boolean;
  updated_at: string;
};

export type ReferenceCategory = {
  key: string;
  business_id: string;
  id: string;
  name: string;
  updated_at: string;
};

export type ReferenceStockBalance = {
  key: string;
  business_id: string;
  product_id: string;
  quantity: number;
  reserved_quantity: number;
  average_cost: number;
  updated_at: string;
};

export type ReferenceMetadata = {
  business_id: string;
  generated_at: string;
};

export type ReferenceDataPayload = {
  success: boolean;
  business_id: string;
  generated_at: string;
  products: Omit<ReferenceProduct, "key" | "business_id">[];
  suppliers: Omit<ReferenceSupplier, "key" | "business_id">[];
  supplier_products: Omit<
    ReferenceSupplierProduct,
    "key" | "business_id"
  >[];
  categories: Omit<ReferenceCategory, "key" | "business_id">[];
  stock_balances: Omit<
    ReferenceStockBalance,
    "key" | "business_id"
  >[];
};

class StockwiseDatabase extends Dexie {
  queryCache!: Table<{ id: string; client: PersistedClient }, string>;
  outbox!: Table<OfflineOperation, string>;
  referenceProducts!: Table<ReferenceProduct, string>;
  referenceSuppliers!: Table<ReferenceSupplier, string>;
  referenceSupplierProducts!: Table<ReferenceSupplierProduct, string>;
  referenceCategories!: Table<ReferenceCategory, string>;
  referenceStockBalances!: Table<ReferenceStockBalance, string>;
  referenceMetadata!: Table<ReferenceMetadata, string>;

  constructor() {
    super("stockwise-offline");

    this.version(1).stores({
      queryCache: "id",
      outbox: "id, status, createdAt",
    });

    this.version(2)
      .stores({
        queryCache: "id",
        outbox: "id, type, status, createdAt",
      })
      .upgrade((transaction) =>
        transaction.table("outbox").toCollection().modify((record) => {
          if (record.type) return;

          const endpoint = String(record.endpoint ?? "");
          const type: OfflineMutationType = endpoint.includes("/sales")
            ? "sale"
            : endpoint.includes("/inventory")
              ? "stock_adjustment"
              : "purchase";

          let payload: unknown = {};
          try {
            payload = record.body ? JSON.parse(record.body) : {};
          } catch {
            payload = {};
          }

          record.type = type;
          record.payload = payload;
          record.occurredAt = new Date(record.createdAt).toISOString();
          delete record.endpoint;
          delete record.method;
          delete record.headers;
          delete record.body;
        }),
      );

    this.version(3)
      .stores({
        queryCache: "id",
        outbox: "id, type, status, createdAt, updatedAt, lastAttemptAt, syncStartedAt",
      })
      .upgrade((transaction) =>
        transaction.table("outbox").toCollection().modify((record) => {
          const createdAt =
            typeof record.createdAt === "number" ? record.createdAt : Date.now();

          record.createdAt = createdAt;
          record.updatedAt =
            typeof record.updatedAt === "number" ? record.updatedAt : createdAt;
          record.attempts =
            typeof record.attempts === "number" ? record.attempts : 0;
        }),
      );

    this.version(4).stores({
      queryCache: "id",
      outbox:
        "id, type, status, createdAt, updatedAt, lastAttemptAt, syncStartedAt",
      referenceProducts: "key, business_id, id, name, sku",
      referenceSuppliers: "key, business_id, id, name",
      referenceCategories: "key, business_id, id, name",
      referenceStockBalances: "key, business_id, product_id",
      referenceMetadata: "business_id, generated_at",
    });

    this.version(5).stores({
      queryCache: "id",
      outbox:
        "id, type, status, createdAt, updatedAt, lastAttemptAt, syncStartedAt",
      referenceProducts: "key, business_id, id, name, sku",
      referenceSuppliers: "key, business_id, id, name",
      referenceSupplierProducts:
        "key, business_id, supplier_id, product_id",
      referenceCategories: "key, business_id, id, name",
      referenceStockBalances: "key, business_id, product_id",
      referenceMetadata: "business_id, generated_at",
    });
  }
}

export const offlineDb = new StockwiseDatabase();

export const dexieQueryPersister: Persister = {
  persistClient: async (client) => {
    await offlineDb.queryCache.put({
      id: "query-client",
      client,
    });
  },
  restoreClient: async () => {
    const record = await offlineDb.queryCache.get("query-client");
    // Retain the last successful data, not a transient refetch error.
    record?.client.clientState.queries.forEach((query) => {
        if (query.state.data !== undefined) {
            query.state.status = "success";
            query.state.error = null;
            query.state.fetchStatus = "idle";
            query.state.fetchFailureCount = 0;
            query.state.fetchFailureReason = null;
        }
    });
    return record?.client;
  },
  removeClient: async () => {
    await offlineDb.queryCache.delete("query-client");
  },
};

const referenceKey = (businessId: string, id: string) =>
  `${businessId}:${id}`;

const supplierProductKey = (
  businessId: string,
  supplierId: string,
  productId: string,
) => `${businessId}:${supplierId}:${productId}`;

const toNumber = (value: number | string) => {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
};

export async function replaceReferenceData(
  payload: ReferenceDataPayload,
) {
  const businessId = payload.business_id;

  await offlineDb.transaction(
    "rw",
    [
      offlineDb.referenceProducts,
      offlineDb.referenceSuppliers,
      offlineDb.referenceSupplierProducts,
      offlineDb.referenceCategories,
      offlineDb.referenceStockBalances,
      offlineDb.referenceMetadata,
    ],
    async () => {
      await Promise.all([
        offlineDb.referenceProducts
          .where("business_id")
          .equals(businessId)
          .delete(),
        offlineDb.referenceSuppliers
          .where("business_id")
          .equals(businessId)
          .delete(),
        offlineDb.referenceSupplierProducts
          .where("business_id")
          .equals(businessId)
          .delete(),
        offlineDb.referenceCategories
          .where("business_id")
          .equals(businessId)
          .delete(),
        offlineDb.referenceStockBalances
          .where("business_id")
          .equals(businessId)
          .delete(),
      ]);

      await Promise.all([
        offlineDb.referenceProducts.bulkPut(
          payload.products.map((product) => ({
            ...product,
            key: referenceKey(businessId, product.id),
            business_id: businessId,
            cost_price: toNumber(product.cost_price),
            selling_price: toNumber(product.selling_price),
            reorder_point: toNumber(product.reorder_point),
            safety_stock: toNumber(product.safety_stock),
          })),
        ),
        offlineDb.referenceSuppliers.bulkPut(
          payload.suppliers.map((supplier) => ({
            ...supplier,
            key: referenceKey(businessId, supplier.id),
            business_id: businessId,
          })),
        ),
        offlineDb.referenceSupplierProducts.bulkPut(
          (payload.supplier_products ?? []).map((item) => ({
            ...item,
            key: supplierProductKey(
              businessId,
              item.supplier_id,
              item.product_id,
            ),
            business_id: businessId,
            unit_cost: toNumber(item.unit_cost),
            minimum_order_quantity: toNumber(
              item.minimum_order_quantity,
            ),
            pack_size: toNumber(item.pack_size),
          })),
        ),
        offlineDb.referenceCategories.bulkPut(
          payload.categories.map((category) => ({
            ...category,
            key: referenceKey(businessId, category.id),
            business_id: businessId,
          })),
        ),
        offlineDb.referenceStockBalances.bulkPut(
          payload.stock_balances.map((balance) => ({
            ...balance,
            key: referenceKey(businessId, balance.product_id),
            business_id: businessId,
            quantity: toNumber(balance.quantity),
            reserved_quantity: toNumber(balance.reserved_quantity),
            average_cost: toNumber(balance.average_cost),
          })),
        ),
        offlineDb.referenceMetadata.put({
          business_id: businessId,
          generated_at: payload.generated_at,
        }),
      ]);
    },
  );
}

export async function readReferenceData(
  businessId: string,
): Promise<ReferenceDataPayload | undefined> {
  const metadata = await offlineDb.referenceMetadata.get(businessId);
  if (!metadata) return undefined;

  const [
    products,
    suppliers,
    supplierProducts,
    categories,
    stockBalances,
  ] =
    await Promise.all([
      offlineDb.referenceProducts
        .where("business_id")
        .equals(businessId)
        .sortBy("name"),
      offlineDb.referenceSuppliers
        .where("business_id")
        .equals(businessId)
        .sortBy("name"),
      offlineDb.referenceSupplierProducts
        .where("business_id")
        .equals(businessId)
        .toArray(),
      offlineDb.referenceCategories
        .where("business_id")
        .equals(businessId)
        .sortBy("name"),
      offlineDb.referenceStockBalances
        .where("business_id")
        .equals(businessId)
        .toArray(),
    ]);

  return {
    success: true,
    business_id: businessId,
    generated_at: metadata.generated_at,
    products,
    suppliers,
    supplier_products: supplierProducts,
    categories,
    stock_balances: stockBalances,
  };
}

export async function clearReferenceData(businessId?: string) {
  if (!businessId) {
    await Promise.all([
      offlineDb.referenceProducts.clear(),
      offlineDb.referenceSuppliers.clear(),
      offlineDb.referenceSupplierProducts.clear(),
      offlineDb.referenceCategories.clear(),
      offlineDb.referenceStockBalances.clear(),
      offlineDb.referenceMetadata.clear(),
    ]);
    return;
  }

  await Promise.all([
    offlineDb.referenceProducts
      .where("business_id")
      .equals(businessId)
      .delete(),
    offlineDb.referenceSuppliers
      .where("business_id")
      .equals(businessId)
      .delete(),
    offlineDb.referenceSupplierProducts
      .where("business_id")
      .equals(businessId)
      .delete(),
    offlineDb.referenceCategories
      .where("business_id")
      .equals(businessId)
      .delete(),
    offlineDb.referenceStockBalances
      .where("business_id")
      .equals(businessId)
      .delete(),
    offlineDb.referenceMetadata.delete(businessId),
  ]);
}
