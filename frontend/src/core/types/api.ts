/**
 * @type ApiResponse
 * @summary Standard API response structure
 * @category api
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * @type ApiError
 * @summary Standard API error structure
 * @category api
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

/**
 * @type PaginationParams
 * @summary Pagination parameters for list requests
 * @category api
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * @type PaginatedResponse
 * @summary Paginated API response structure
 * @category api
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
