import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ProductRequest, ProductCategory } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { NotificationService } from '../../../services/notification.service';
import { IconComponent } from '../../atoms/icon/icon.component';
import { SpinnerComponent } from '../../atoms/spinner/spinner.component';

@Component({
  selector: 'app-add-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, SpinnerComponent],
  templateUrl: './add-product-modal.component.html',
  styleUrl: './add-product-modal.component.scss'
})
export class AddProductModalComponent implements OnInit {
  @Input() product: Product | null = null;
  @Input() isEditMode = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() productAdded = new EventEmitter<Product>();
  @Output() productUpdated = new EventEmitter<Product>();

  // Form fields (aligned with backend ProductRequestDto)
  name = '';
  sku = '';
  category = 'OTHER';
  description = '';
  unitPrice = 0;
  stockQuantity = 0;
  minStockLevel = 10;

  // Categories for select
  categories = Object.values(ProductCategory);
  ProductCategory = ProductCategory;

  // Validation errors
  errors: { [key: string]: string } = {};
  isSubmitting = false;

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (this.isEditMode && this.product) {
      this.name = this.product.name;
      this.sku = this.product.sku;
      this.category = this.product.category;
      this.description = this.product.description || '';
      this.unitPrice = this.product.unitPrice;
      this.stockQuantity = this.product.stockQuantity;
      this.minStockLevel = this.product.minStockLevel;
    }
  }

  getCategoryName(category: string): string {
    return this.productService.getCategoryName(category);
  }

  validateForm(): boolean {
    this.errors = {};

    if (!this.name.trim()) {
      this.errors['name'] = 'El nombre es requerido';
    }

    if (!this.sku.trim()) {
      this.errors['sku'] = 'El SKU es requerido';
    }

    if (this.unitPrice < 0) {
      this.errors['unitPrice'] = 'El precio no puede ser negativo';
    }

    if (this.stockQuantity < 0) {
      this.errors['stockQuantity'] = 'El stock no puede ser negativo';
    }

    if (this.minStockLevel < 0) {
      this.errors['minStockLevel'] = 'El stock mínimo no puede ser negativo';
    }

    return Object.keys(this.errors).length === 0;
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    const productRequest: ProductRequest = {
      name: this.name.trim(),
      sku: this.sku.trim(),
      category: this.category,
      description: this.description.trim() || undefined,
      unitPrice: this.unitPrice,
      stockQuantity: this.stockQuantity,
      minStockLevel: this.minStockLevel,
      active: true
    };

    if (this.isEditMode && this.product) {
      this.productService.updateProduct(this.product.id, productRequest).subscribe({
        next: (updatedProduct) => {
          if (updatedProduct) {
            this.productUpdated.emit(updatedProduct);
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.errors['submit'] = 'Error al actualizar el producto';
          this.notificationService.error('Error al actualizar el producto');
          this.isSubmitting = false;
        }
      });
    } else {
      this.productService.createProduct(productRequest).subscribe({
        next: (newProduct) => {
          this.productAdded.emit(newProduct);
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.errors['submit'] = 'Error al crear el producto';
          this.notificationService.error('Error al crear el producto');
          this.isSubmitting = false;
        }
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
