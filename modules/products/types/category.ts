export type Category = {
    id: string;
    name: string;
    description: string | null;
    product_count: number;
    is_active: boolean;
    created_at: string;
};

export type CreateCategoryRequest = {
    name: string;
    description?: string;
};

export interface CategoryFormData {
    name: string;
    description: string;
}

export interface CategoryCreateResponse {
    success: boolean,
    category_id: string,
    message: string
}