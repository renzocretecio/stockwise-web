/**
 * Shared pagination shape — matches every paginated backend response
 * (Products, Purchases, Sales, Stock Movements, etc.)
 *
 * export interface XResponse {
 *   success: boolean;
 *   items: X[];
 *   pagination: PaginationMeta;
 * }
 */
export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

/** Generic wrapper for any paginated list response from the API */
export interface PaginatedResponse<T> {
  success: boolean;
  pagination: PaginationMeta;
  [key: string]: T[] | PaginationMeta | boolean;
}

/** Query params every paginated list hook accepts */
export interface PaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
}