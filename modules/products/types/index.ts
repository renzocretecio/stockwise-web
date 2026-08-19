export interface Product {
  id: string;
  business_id?: string;
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  category?: string;
  category_name?: string;
  category_id?: string;
  price?: number;
  cost_price?: number;
  selling_price?: number;
  quantity?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  reorder_point?: number;
  unit?: string;
  status?: "in_stock" | "low_stock" | "out_of_stock" | "active" | "inactive" | string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: PaginationMeta;
}
