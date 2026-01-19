import { Injectable, signal, computed } from '@angular/core';
import { forkJoin, tap } from 'rxjs';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class StockAlertService {
  private lowStockProducts = signal<Product[]>([]);
  private outOfStockProducts = signal<Product[]>([]);
  private isLoaded = signal(false);
  
  readonly lowStock = computed(() => this.lowStockProducts());
  readonly outOfStock = computed(() => this.outOfStockProducts());
  readonly hasAlerts = computed(() => this.lowStockProducts().length > 0 || this.outOfStockProducts().length > 0);
  readonly alertsCount = computed(() => this.lowStockProducts().length + this.outOfStockProducts().length);
  
  constructor(private productService: ProductService) {}
  
  loadAlerts(): void {
    if (this.isLoaded()) return;
    
    forkJoin({
      lowStock: this.productService.getLowStockProducts(),
      outOfStock: this.productService.getOutOfStockProducts()
    }).subscribe({
      next: ({ lowStock, outOfStock }) => {
        this.lowStockProducts.set(lowStock);
        this.outOfStockProducts.set(outOfStock);
        this.isLoaded.set(true);
      },
      error: () => {
        this.lowStockProducts.set([]);
        this.outOfStockProducts.set([]);
        this.isLoaded.set(true);
      }
    });
  }
  
  refresh(): void {
    this.isLoaded.set(false);
    this.loadAlerts();
  }
}
