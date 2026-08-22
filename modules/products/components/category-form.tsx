"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  useCreateCategory,
  useUpdateCategory,
} from "@/modules/products/services/category";
import { CategoryFormData } from "../types/category";
import { Button } from "@/components/ui/button";

type CategoryFormProps = {
  categoryId?: string;
  initialData?: Partial<CategoryFormData>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CategoryForm({
  categoryId,
  initialData,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const {
    mutateAsync: createCategory,
    isPending: isCreating,
    error: createError,
  } = useCreateCategory();

  const {
    mutateAsync: updateCategory,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateCategory(categoryId ?? "");

  const isEditMode = Boolean(categoryId);
  const isPending = isCreating || isUpdating;
  const error = createError || updateError;

  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
  });

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (isEditMode) {
        await updateCategory(formData);
      } else {
        await createCategory(formData);
      }

      onSuccess?.();
    } catch {
      // Mutation error is already available
      // through the error value above.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error instanceof Error
            ? error.message
            : isEditMode
            ? "An error occurred while updating the category."
            : "An error occurred while creating the category."}
        </div>
      )}

      <section className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Category name *
          </label>

          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            maxLength={100}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. Beverages"
          />
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
            placeholder="Drinks and beverage products"
          />
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

        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving..."
            : isEditMode
            ? "Update category"
            : "Create category"}
        </Button>
      </div>
    </form>
  );
}