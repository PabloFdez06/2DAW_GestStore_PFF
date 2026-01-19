import { Product } from './product.model';

/**
 * DTO para la relación entre tarea y producto
 */
export interface TaskProduct {
  id: string;
  quantity: number;
  quantityUsed: number;
  notes?: string;
  createdAt?: string;
  product: Product;
}

/**
 * DTO para crear/actualizar la relación entre tarea y producto
 */
export interface TaskProductRequest {
  quantity: number;
  quantityUsed?: number;
  notes?: string;
  productId: string;
}

/**
 * Response wrapper de la API para TaskProduct
 */
export interface TaskProductApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}
