import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { TaskProduct, TaskProductRequest, TaskProductApiResponse } from '../models/task-product.model';

@Injectable({
  providedIn: 'root'
})
export class TaskProductService {
  private readonly API_URL = '/api/task-products';

  constructor(private http: HttpClient) {}

  private handleError(operation: string) {
    return (error: unknown) => {
      console.error(`${operation} failed:`, error);
      return throwError(() => error);
    };
  }

  /**
   * Obtener productos asociados a una tarea
   */
  getProductsByTaskId(taskId: string): Observable<TaskProduct[]> {
    return this.http.get<TaskProductApiResponse<TaskProduct[]>>(`${this.API_URL}/task/${taskId}`).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError('getProductsByTaskId'))
    );
  }

  /**
   * Obtener tareas asociadas a un producto
   */
  getTasksByProductId(productId: string): Observable<TaskProduct[]> {
    return this.http.get<TaskProductApiResponse<TaskProduct[]>>(`${this.API_URL}/product/${productId}`).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError('getTasksByProductId'))
    );
  }

  /**
   * Asignar un producto a una tarea
   */
  assignProductToTask(taskId: string, request: TaskProductRequest): Observable<TaskProduct> {
    return this.http.post<TaskProductApiResponse<TaskProduct>>(
      `${this.API_URL}/assign?taskId=${taskId}`, 
      request
    ).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError('assignProductToTask'))
    );
  }

  /**
   * Actualizar la asignación de un producto a una tarea
   */
  updateTaskProduct(id: string, request: TaskProductRequest): Observable<TaskProduct> {
    return this.http.put<TaskProductApiResponse<TaskProduct>>(`${this.API_URL}/${id}`, request).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError('updateTaskProduct'))
    );
  }

  /**
   * Registrar uso de producto en una tarea
   */
  useProduct(id: string, quantity: number): Observable<TaskProduct> {
    return this.http.post<TaskProductApiResponse<TaskProduct>>(
      `${this.API_URL}/${id}/use?quantity=${quantity}`, 
      {}
    ).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError('useProduct'))
    );
  }

  /**
   * Eliminar la asignación de un producto de una tarea
   */
  removeProductFromTask(id: string): Observable<void> {
    return this.http.delete<TaskProductApiResponse<void>>(`${this.API_URL}/${id}`).pipe(
      retry(1),
      map(() => undefined),
      catchError(this.handleError('removeProductFromTask'))
    );
  }

  /**
   * Asignar múltiples productos a una tarea
   */
  assignMultipleProducts(taskId: string, products: { productId: string; quantity: number }[]): Observable<TaskProduct[]> {
    const requests = products.map(p => 
      this.assignProductToTask(taskId, { 
        productId: p.productId, 
        quantity: p.quantity 
      })
    );
    
    // Ejecutar todas las peticiones secuencialmente
    return new Observable(subscriber => {
      const results: TaskProduct[] = [];
      let index = 0;

      const processNext = () => {
        if (index >= requests.length) {
          subscriber.next(results);
          subscriber.complete();
          return;
        }

        requests[index].subscribe({
          next: (result) => {
            results.push(result);
            index++;
            processNext();
          },
          error: (error) => {
            subscriber.error(error);
          }
        });
      };

      processNext();
    });
  }
}
