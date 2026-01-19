import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap, retry } from 'rxjs/operators';
import { 
  Product, 
  ProductRequest, 
  ProductStatus, 
  ProductStatistics,
  ProductApiResponse,
  ProductPage,
  calculateProductStatus,
  getCategoryDisplayName,
  getStatusDisplayName
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = '/api/products';
  
  // BehaviorSubject para mantener el estado de productos
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private handleError(operation: string) {
    return (error: unknown) => {
      console.error(`${operation} failed:`, error);
      return throwError(() => error);
    };
  }

  /**
   * Obtener todos los productos con paginación
   */
  getProducts(page: number = 0, size: number = 20): Observable<ProductPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ProductApiResponse<ProductPage>>(this.API_URL, { params }).pipe(
      retry(1),
      map(response => response.data),
      tap(pageData => this.productsSubject.next(pageData.content)),
      catchError(this.handleError('getProducts'))
    );
  }

  /**
   * Obtener todos los productos sin paginación (para listados simples)
   */
  getAllProducts(): Observable<Product[]> {
    return this.getProducts(0, 1000).pipe(
      map(page => page.content)
    );
  }

  /**
   * Obtener un producto por ID
   */
  getProductById(id: string): Observable<Product> {
    return this.http.get<ProductApiResponse<Product>>(`${this.API_URL}/${id}`).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError('getProductById'))
    );
  }

  /**
   * Obtener un producto por SKU
   */
  getProductBySku(sku: string): Observable<Product> {
    return this.http.get<ProductApiResponse<Product>>(`${this.API_URL}/sku/${sku}`).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError('getProductBySku'))
    );
  }

  /**
   * Buscar productos por nombre
   */
  searchProducts(query: string): Observable<Product[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ProductApiResponse<Product[]>>(`${this.API_URL}/search`, { params }).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError('searchProducts'))
    );
  }

  /**
   * Obtener productos con bajo stock
   */
  getLowStockProducts(): Observable<Product[]> {
    return this.http.get<ProductApiResponse<Product[]>>(`${this.API_URL}/low-stock`).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError('getLowStockProducts'))
    );
  }

  /**
   * Obtener productos sin stock
   */
  getOutOfStockProducts(): Observable<Product[]> {
    return this.http.get<ProductApiResponse<Product[]>>(`${this.API_URL}/out-of-stock`).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError('getOutOfStockProducts'))
    );
  }

  /**
   * Obtener productos por categoría
   */
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<ProductApiResponse<Product[]>>(`${this.API_URL}/category/${category}`).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError('getProductsByCategory'))
    );
  }

  /**
   * Crear un nuevo producto
   */
  createProduct(productRequest: ProductRequest): Observable<Product> {
    return this.http.post<ProductApiResponse<Product>>(this.API_URL, productRequest).pipe(
      retry(1),
      map(response => response.data),
      tap(product => {
        const currentProducts = this.productsSubject.getValue();
        this.productsSubject.next([...currentProducts, product]);
      }),
      catchError(this.handleError('createProduct'))
    );
  }

  /**
   * Actualizar un producto existente
   */
  updateProduct(id: string, productRequest: ProductRequest): Observable<Product> {
    return this.http.put<ProductApiResponse<Product>>(`${this.API_URL}/${id}`, productRequest).pipe(
      retry(1),
      map(response => response.data),
      tap(updatedProduct => {
        const currentProducts = this.productsSubject.getValue();
        const index = currentProducts.findIndex(p => p.id === id);
        if (index !== -1) {
          currentProducts[index] = updatedProduct;
          this.productsSubject.next([...currentProducts]);
        }
      }),
      catchError(this.handleError('updateProduct'))
    );
  }

  /**
   * Eliminar (desactivar) un producto
   */
  deleteProduct(id: string): Observable<Product> {
    return this.http.delete<ProductApiResponse<Product>>(`${this.API_URL}/${id}`).pipe(
      retry(1),
      map(response => response.data),
      tap(() => {
        const currentProducts = this.productsSubject.getValue();
        this.productsSubject.next(currentProducts.filter(p => p.id !== id));
      }),
      catchError(this.handleError('deleteProduct'))
    );
  }

  /**
   * Obtener estadísticas de productos
   */
  getStatistics(): Observable<ProductStatistics> {
    return this.http.get<ProductApiResponse<ProductStatistics>>(`${this.API_URL}/statistics`).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError('getStatistics'))
    );
  }

  /**
   * Obtener productos disponibles (para el modal de tareas)
   */
  getAvailableProducts(): Observable<Product[]> {
    return this.getAllProducts().pipe(
      map(products => products.filter(p => 
        p.active && p.stockQuantity > 0
      ))
    );
  }

  /**
   * Calcular estado basado en stock
   */
  calculateStatus(product: Product): ProductStatus {
    return calculateProductStatus(product);
  }

  /**
   * Obtener nombre de categoría en español
   */
  getCategoryName(category: string): string {
    return getCategoryDisplayName(category);
  }

  /**
   * Obtener nombre de estado en español
   */
  getStatusName(status: ProductStatus): string {
    return getStatusDisplayName(status);
  }
}
