// Enums
export enum ProductStatus {
  AVAILABLE = 'AVAILABLE',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export enum ProductCategory {
  MACHINERY = 'MACHINERY',
  TOOLS = 'TOOLS',
  MATERIALS = 'MATERIALS',
  ELECTRONICS = 'ELECTRONICS',
  SUPPLIES = 'SUPPLIES',
  OTHER = 'OTHER'
}

// Interface principal de Product (sincronizada con backend)
export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  unitPrice: number;
  category: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  stockQuantity: number;
  minStockLevel: number;
  locationInWarehouse?: string;
}

// DTO para crear/actualizar productos (sincronizado con ProductRequestDto del backend)
export interface ProductRequest {
  name: string;
  sku: string;
  description?: string;
  unitPrice: number;
  category: string;
  active?: boolean;
  stockQuantity?: number;
  minStockLevel?: number;
}

// Para estadísticas de productos (sincronizado con ProductStatistics del backend)
export interface ProductStatistics {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

// Response wrapper de la API
export interface ProductApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

// Para la paginación de la API
export interface ProductPage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Helper para calcular estado basado en stock
export function calculateProductStatus(product: Product): ProductStatus {
  if (product.stockQuantity === 0) {
    return ProductStatus.OUT_OF_STOCK;
  }
  if (product.stockQuantity <= product.minStockLevel) {
    return ProductStatus.LOW_STOCK;
  }
  return ProductStatus.AVAILABLE;
}

// Helper para obtener nombre de categoría en español
export function getCategoryDisplayName(category: string): string {
  const categoryNames: Record<string, string> = {
    'MACHINERY': 'Maquinaria',
    'TOOLS': 'Herramientas',
    'MATERIALS': 'Materiales',
    'ELECTRONICS': 'Electrónica',
    'SUPPLIES': 'Suministros',
    'OTHER': 'Otros'
  };
  return categoryNames[category] || category;
}

// Helper para obtener nombre de estado en español
export function getStatusDisplayName(status: ProductStatus): string {
  const statusNames: Record<ProductStatus, string> = {
    [ProductStatus.AVAILABLE]: 'Disponible',
    [ProductStatus.LOW_STOCK]: 'Stock Bajo',
    [ProductStatus.OUT_OF_STOCK]: 'Sin Stock'
  };
  return statusNames[status] || status;
}
