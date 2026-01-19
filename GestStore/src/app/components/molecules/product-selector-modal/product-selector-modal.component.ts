import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ProductStatus, calculateProductStatus } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { IconComponent } from '../../atoms/icon/icon.component';
import { SpinnerComponent } from '../../atoms/spinner/spinner.component';

export interface SelectedProduct {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-product-selector-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, SpinnerComponent],
  templateUrl: './product-selector-modal.component.html',
  styleUrl: './product-selector-modal.component.scss'
})
export class ProductSelectorModalComponent implements OnInit {
  @Input() selectedProducts: SelectedProduct[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() productsSelected = new EventEmitter<SelectedProduct[]>();

  products: Product[] = [];
  filteredProducts: Product[] = [];
  search = '';
  isLoading = false;

  // Local selection state (using string id)
  localSelectedProducts: Map<string, SelectedProduct> = new Map();

  ProductStatus = ProductStatus;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
    // Initialize local selection from input
    this.selectedProducts.forEach(sp => {
      this.localSelectedProducts.set(sp.product.id, { ...sp });
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAvailableProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...products];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
  }

  onSearchChange(): void {
    if (this.search.trim() === '') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(this.search.toLowerCase()) ||
        this.getCategoryName(product.category).toLowerCase().includes(this.search.toLowerCase())
      );
    }
  }

  isProductSelected(product: Product): boolean {
    return this.localSelectedProducts.has(product.id);
  }

  getSelectedQuantity(product: Product): number {
    const selected = this.localSelectedProducts.get(product.id);
    return selected ? selected.quantity : 1;
  }

  toggleProductSelection(product: Product): void {
    if (this.localSelectedProducts.has(product.id)) {
      this.localSelectedProducts.delete(product.id);
    } else {
      this.localSelectedProducts.set(product.id, {
        product,
        quantity: 1
      });
    }
  }

  updateQuantity(product: Product, quantity: number): void {
    if (quantity < 1) quantity = 1;
    if (quantity > product.stockQuantity) quantity = product.stockQuantity;

    const selected = this.localSelectedProducts.get(product.id);
    if (selected) {
      selected.quantity = quantity;
    }
  }

  incrementQuantity(product: Product, event: Event): void {
    event.stopPropagation();
    const current = this.getSelectedQuantity(product);
    if (current < product.stockQuantity) {
      this.updateQuantity(product, current + 1);
    }
  }

  decrementQuantity(product: Product, event: Event): void {
    event.stopPropagation();
    const current = this.getSelectedQuantity(product);
    if (current > 1) {
      this.updateQuantity(product, current - 1);
    }
  }

  getCategoryName(category: string): string {
    return this.productService.getCategoryName(category);
  }

  getStatusName(status: ProductStatus): string {
    return this.productService.getStatusName(status);
  }

  getProductStatus(product: Product): ProductStatus {
    return calculateProductStatus(product);
  }

  getStatusClass(product: Product): string {
    const status = calculateProductStatus(product);
    switch (status) {
      case ProductStatus.AVAILABLE:
        return 'product-selector__status--available';
      case ProductStatus.LOW_STOCK:
        return 'product-selector__status--low';
      default:
        return '';
    }
  }

  onConfirm(): void {
    const selectedArray = Array.from(this.localSelectedProducts.values());
    this.productsSelected.emit(selectedArray);
  }

  onClose(): void {
    this.close.emit();
  }

  get selectedCount(): number {
    return this.localSelectedProducts.size;
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}
