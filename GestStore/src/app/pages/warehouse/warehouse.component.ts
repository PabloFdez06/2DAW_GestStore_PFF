import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, Renderer2, Inject, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service';
import { StockAlertService } from '../../services/stock-alert.service';
import { Product, ProductStatus, ProductCategory, ProductStatistics, calculateProductStatus } from '../../models/product.model';
import { User } from '../../models/auth.model';
import { CalendarComponent } from '../../components/molecules/calendar/calendar.component';
import { IconComponent } from '../../components/atoms/icon/icon.component';
import { SpinnerComponent } from '../../components/atoms/spinner/spinner.component';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { AddProductModalComponent } from '../../components/molecules/add-product-modal/add-product-modal.component';
import { StockNotificationsComponent } from '../../components/molecules/stock-notifications/stock-notifications.component';
import { SidebarLayoutComponent } from '../../components/layout/sidebar-layout/sidebar-layout.component';
import { StatCardComponent } from '../../components/molecules/stat-card/stat-card.component';

@Component({
  selector: 'app-warehouse',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    CalendarComponent, 
    IconComponent,
    SpinnerComponent,
    ButtonComponent,
    AddProductModalComponent,
    StockNotificationsComponent,
    SidebarLayoutComponent,
    StatCardComponent
  ],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.scss'
})
export class WarehouseComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  statistics: ProductStatistics | null = null;
  isLoading = false;
  errorMessage = '';
  search = '';
  currentDate = '';
  currentDayName = '';
  isCalendarOpen = false;
  isProductModalOpen = false;
  isEditMode = false;
  productToEdit: Product | null = null;
  currentUser: User | null = null;
  isStockNotificationsOpen = false;

  // Enums para el template
  ProductStatus = ProductStatus;
  ProductCategory = ProductCategory;

  @ViewChild('calendarDialog', { read: ElementRef }) calendarDialog?: ElementRef<HTMLDialogElement>;
  @ViewChild('productDialog', { read: ElementRef }) productDialog?: ElementRef<HTMLDialogElement>;

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private themeService: ThemeService,
    private notificationService: NotificationService,
    protected stockAlertService: StockAlertService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.setCurrentDate();
    this.loadCurrentUser();
    this.loadProducts();
    this.loadStatistics();
    this.stockAlertService.loadAlerts();
  }

  // Stock notifications
  toggleStockNotifications(): void {
    this.isStockNotificationsOpen = !this.isStockNotificationsOpen;
  }

  closeStockNotifications(): void {
    this.isStockNotificationsOpen = false;
  }

  ngOnDestroy(): void {
    this.unlockScroll();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    
    if (this.isProductModalOpen) {
      keyboardEvent.preventDefault();
      this.closeProductModal();
      return;
    }

    if (this.isCalendarOpen) {
      keyboardEvent.preventDefault();
      this.closeCalendar();
      return;
    }
  }

  // ============================================================================
  // CARGA DE DATOS
  // ============================================================================
  private loadCurrentUser(): void {
    this.authService.currentUser.subscribe((user: User | null) => {
      this.currentUser = user;
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...products];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los productos';
        this.isLoading = false;
        this.notificationService.error('Error al cargar los productos');
        console.error('Error loading products:', error);
      }
    });
  }

  loadStatistics(): void {
    this.productService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  // ============================================================================
  // BÚSQUEDA Y FILTRADO
  // ============================================================================
  onSearchChange(): void {
    if (this.search.trim() === '') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(this.search.toLowerCase()) ||
        this.productService.getCategoryName(product.category).toLowerCase().includes(this.search.toLowerCase())
      );
    }
  }

  // ============================================================================
  // MODAL DE PRODUCTO
  // ============================================================================
  openAddProductModal(): void {
    this.isEditMode = false;
    this.productToEdit = null;
    this.isProductModalOpen = true;
    this.lockScroll();
  }

  openEditProductModal(product: Product): void {
    this.isEditMode = true;
    this.productToEdit = product;
    this.isProductModalOpen = true;
    this.lockScroll();
  }

  closeProductModal(): void {
    this.isProductModalOpen = false;
    this.productToEdit = null;
    this.isEditMode = false;
    this.unlockScroll();
  }

  handleProductAdded(product: Product): void {
    this.loadProducts();
    this.loadStatistics();
    this.closeProductModal();
    this.notificationService.success(`Producto "${product.name}" creado correctamente`);
  }

  handleProductUpdated(product: Product): void {
    this.loadProducts();
    this.loadStatistics();
    this.closeProductModal();
    this.notificationService.success(`Producto "${product.name}" actualizado correctamente`);
  }

  // ============================================================================
  // CALENDARIO
  // ============================================================================
  toggleCalendar(): void {
    this.isCalendarOpen = !this.isCalendarOpen;
    if (this.isCalendarOpen) {
      this.lockScroll();
    } else {
      this.unlockScroll();
    }
  }

  closeCalendar(): void {
    this.isCalendarOpen = false;
    this.unlockScroll();
  }

  // ============================================================================
  // TEMA
  // ============================================================================
  get themeIcon(): string {
    return this.themeService.mode() === 'dark' ? 'moon' : 'sun';
  }

  get themeAriaLabel(): string {
    return this.themeService.mode() === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================
  private setCurrentDate(): void {
    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    this.currentDayName = days[now.getDay()];
    this.currentDate = now.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  }

  private lockScroll(): void {
    this.renderer.addClass(this.document.body, 'no-scroll');
  }

  private unlockScroll(): void {
    this.renderer.removeClass(this.document.body, 'no-scroll');
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
        return 'warehouse__status--available';
      case ProductStatus.LOW_STOCK:
        return 'warehouse__status--low';
      case ProductStatus.OUT_OF_STOCK:
        return 'warehouse__status--out';
      default:
        return '';
    }
  }

  deleteProduct(product: Product): void {
    if (confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
          this.loadStatistics();
          this.notificationService.success(`Producto "${product.name}" eliminado correctamente`);
        },
        error: (error) => {
          this.notificationService.error('Error al eliminar el producto');
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}
