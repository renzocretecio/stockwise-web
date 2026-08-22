"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  useCreateProduct,
  useSuppliers,
  useUpdateProduct,
  type FormData,
} from "@/modules/products/services";
import { useAllCategories } from "../services/category";
import { Button } from "@/components/ui/button";

type ProductFormProps = {
    productId?: string;
    initialData?: Partial<FormData>;
    onSuccess?: () => void;
    onCancel?: () => void;
};

export function ProductForm({
  productId,
  initialData,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  
    const {
        mutateAsync: createProduct,
        isPending: isCreating,
        error: createError,
    } = useCreateProduct();

    const {
        data: suppliersData,
        isLoading: suppliersLoading,
    } = useSuppliers();

    const suppliers = suppliersData?.suppliers ?? [];

    const { data: categoriesData, isLoading: isCategoriesLoading } = useAllCategories();
	  const categories = categoriesData?.categories ?? []

    const {
        mutateAsync: updateProduct,
        isPending: isUpdating,
        error: updateError,
    } = useUpdateProduct(productId ?? "");

    const isEditMode = Boolean(productId);
    const isPending = isCreating || isUpdating;
    const error = createError || updateError;
    const [formData, setFormData] = useState<FormData>({
        name: initialData?.name ?? "",
        sku: initialData?.sku ?? "",
        barcode: initialData?.barcode ?? "",
        supplier_id: initialData?.supplier_id ?? "",
        cost_price: initialData?.cost_price ?? 0,
        selling_price: initialData?.selling_price ?? 0,
        reorder_point: initialData?.reorder_point ?? 0,
        safety_stock: initialData?.safety_stock ?? 0,
        category_id: initialData?.category_id ?? "",
        brand: initialData?.brand ?? "",
        unit: initialData?.unit ?? "unit",
        lead_time_days: initialData?.lead_time_days ?? 3,
        is_perishable: initialData?.is_perishable ?? false,
        description: initialData?.description ?? "",
    });

    const handleChange = (
        event: ChangeEvent<
        HTMLInputElement |
            HTMLSelectElement |
            HTMLTextAreaElement
        >,
    ) => {
        const {
        name,
        value,
        type,
        } = event.target;

        setFormData((previous) => ({
        ...previous,
        [name]:
            type === "checkbox"
            ? (
                event.target as HTMLInputElement
                ).checked
            : type === "number"
                ? Number(value) || 0
                : value,
        }));
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        try {
            if (isEditMode) {
                await updateProduct(formData);
            } else {
                await createProduct(formData);
            }

            onSuccess?.();
        } catch {
            // Mutation error is already available
            // through the error value above.
        }
    };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error instanceof Error
                  ? error.message
                  : isEditMode
                      ? "An error occurred while updating the product."
                      : "An error occurred while creating the product."}
          </div>
      )}

      <section className="space-y-4">
        <h2 className="text-base font-semibold">
          Basic information
        </h2>

        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium"
          >
            Product name *
          </label>

          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. Laptop Dell XPS"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="sku"
              className="mb-1 block text-sm font-medium"
            >
              SKU
            </label>

            <input
              id="sku"
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="SKU001"
            />
          </div>

          <div>
            <label
              htmlFor="barcode"
              className="mb-1 block text-sm font-medium"
            >
              Barcode
            </label>

            <input
              id="barcode"
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="123456789"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="Product description..."
          />
        </div>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h2 className="text-base font-semibold">
          Pricing
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="cost_price"
              className="mb-1 block text-sm font-medium"
            >
              Cost price *
            </label>

            <input
              id="cost_price"
              type="number"
              name="cost_price"
              value={formData.cost_price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="selling_price"
              className="mb-1 block text-sm font-medium"
            >
              Selling price *
            </label>

            <input
              id="selling_price"
              type="number"
              name="selling_price"
              value={formData.selling_price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />

            {formData.selling_price > 0 &&
              formData.cost_price > 0 && (
                <p className="mt-1 text-xs text-emerald-600">
                  Margin:{" "}
                  {(
                    ((formData.selling_price -
                      formData.cost_price) /
                      formData.cost_price) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              )}
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h2 className="text-base font-semibold">
          Inventory settings
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="unit"
              className="mb-1 block text-sm font-medium"
            >
              Unit
            </label>

            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="unit">
                Unit
              </option>
              <option value="piece">
                Piece
              </option>
              <option value="box">
                Box
              </option>
              <option value="liter">
                Liter
              </option>
              <option value="kg">
                Kilogram
              </option>
              <option value="meter">
                Meter
              </option>
              <option value="loaf">
                Loaf
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="supplier_id"
              className="mb-1 block text-sm font-medium"
            >
              Supplier
            </label>

            <select
              id="supplier_id"
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleChange}
              disabled={suppliersLoading}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="">
                {suppliersLoading
                  ? "Loading suppliers..."
                  : "Select supplier (optional)"}
              </option>

                {suppliers.map((supplier) => (
                    <option
                        key={supplier.id}
                        value={supplier.id}
                    >
                        {supplier.name}
                    </option>
                ))}
            </select>
          </div>

          <NumberField
            id="reorder_point"
            label="Reorder point"
            name="reorder_point"
            value={formData.reorder_point || 0}
            onChange={handleChange}
          />

          <NumberField
            id="safety_stock"
            label="Safety stock"
            name="safety_stock"
            value={formData.safety_stock || 0}
            onChange={handleChange}
          />

          <NumberField
            id="lead_time_days"
            label="Lead time (days)"
            name="lead_time_days"
            value={formData.lead_time_days || 0}
            onChange={handleChange}
            min={1}
          />

          <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
            <input
              type="checkbox"
              name="is_perishable"
              checked={formData.is_perishable}
              onChange={handleChange}
              className="size-4 rounded border-input"
            />

            Perishable
          </label>
        </div>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h2 className="text-base font-semibold">
          Categorization
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          	<div>
				<label
					htmlFor="category"
					className="mb-1 block text-sm font-medium"
				>
					Category
				</label>

				<select
					id="category"
					name="category"
					value={formData.category_id}
					onChange={(e) =>
            setFormData({...formData, category_id: e.target.value})
          }
					disabled={isCategoriesLoading}
					className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
				>
					<option value="">
						{isCategoriesLoading ? "Loading categories..." : "Select a category"}
					</option>
						{categories.map((category) => (
					<option key={category.id} value={category.id}>
						{category.name}
					</option>
					))}
				</select>
			</div>

          <div>
            <label
              htmlFor="brand"
              className="mb-1 block text-sm font-medium"
            >
              Brand
            </label>

            <input
              id="brand"
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Dell"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isCreating}
        >
          Cancel
        </Button>

        <Button
            type="submit"
            disabled={isPending}
        >
            {isPending
                ? "Saving..."
                : isEditMode
                    ? "Update product"
                    : "Create product"}
        </Button>
      </div>
    </form>
  );
}

type NumberFieldProps = {
  id: string;
  label: string;
  name: string;
  value: number;
  min?: number;
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
};

function NumberField({
  id,
  label,
  name,
  value,
  min = 0,
  onChange,
}: NumberFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium"
      >
        {label}
      </label>

      <input
        id={id}
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        step="0.01"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}