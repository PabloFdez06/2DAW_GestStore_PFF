import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
  Renderer2,
  Inject,
  ViewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { TaskProductService } from '../../services/task-product.service';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service';
import { StockAlertService } from '../../services/stock-alert.service';
import { Task, TaskStatus, TaskPriority, TaskRequest } from '../../models/task.model';
import { TaskProduct } from '../../models/task-product.model';
import { User } from '../../models/auth.model';
import { AddTaskModalComponent, TaskFormData } from '../../components/molecules/add-task-modal/add-task-modal.component';
import { CalendarComponent } from '../../components/molecules/calendar/calendar.component';
import { IconComponent } from '../../components/atoms/icon/icon.component';
import { SpinnerComponent } from '../../components/atoms/spinner/spinner.component';
import { StockNotificationsComponent } from '../../components/molecules/stock-notifications/stock-notifications.component';
import { SidebarLayoutComponent } from '../../components/layout/sidebar-layout/sidebar-layout.component';
import { NavHeaderComponent } from '../../components/layout/nav-header/nav-header.component';
import { ModalWrapperComponent } from '../../components/molecules/modal-wrapper/modal-wrapper.component';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AddTaskModalComponent, CalendarComponent, IconComponent, SpinnerComponent, StockNotificationsComponent, SidebarLayoutComponent, NavHeaderComponent, ModalWrapperComponent],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent implements OnInit, OnDestroy {
  task!: Task;
  taskProducts: TaskProduct[] = [];
  isLoadingAction = false;
  isLoadingProducts = false;

  search = '';
  currentDate = '';
  currentDayName = '';
  isCalendarOpen = false;
  isTaskModalOpen = false;
  isEditMode = false;
  taskToEdit: Task | null = null;
  currentUser: User | null = null;
  isStockNotificationsOpen = false;

  @ViewChild('calendarDialog', { read: ElementRef }) calendarDialog?: ElementRef<HTMLDialogElement>;
  @ViewChild('taskDialog', { read: ElementRef }) taskDialog?: ElementRef<HTMLDialogElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private taskService: TaskService,
    private taskProductService: TaskProductService,
    private themeService: ThemeService,
    private notificationService: NotificationService,
    protected stockAlertService: StockAlertService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.task = this.route.snapshot.data['task'] as Task;

    this.setCurrentDate();
    this.loadCurrentUser();
    this.loadTaskProducts();
    this.stockAlertService.loadAlerts();

    this.route.queryParamMap.subscribe(params => {
      this.search = params.get('q') ?? '';
    });
  }

  loadTaskProducts(): void {
    const taskId = String(this.task.id || this.task._id);
    if (!taskId) return;

    this.isLoadingProducts = true;
    this.taskProductService.getProductsByTaskId(taskId).subscribe({
      next: (products) => {
        this.taskProducts = products;
        this.isLoadingProducts = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading task products:', error);
        this.isLoadingProducts = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.unlockScroll();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (this.isTaskModalOpen) {
      keyboardEvent.preventDefault();
      this.closeTaskModal();
      return;
    }

    if (this.isCalendarOpen) {
      keyboardEvent.preventDefault();
      this.closeCalendar();
    }
  }

  private setCurrentDate(): void {
    const now = new Date();
    const day = now.getDate();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ];
    this.currentDayName = days[now.getDay()];
    this.currentDate = `${day} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
  }

  loadCurrentUser(): void {
    this.authService.currentUser.subscribe(user => {
      this.ngZone.run(() => {
        this.currentUser = user;
        this.cdr.detectChanges();
      });
    });
  }

  get themeIcon(): string {
    return this.themeService.mode() === 'dark' ? 'moon' : 'sun';
  }

  get themeAriaLabel(): string {
    return this.themeService.mode() === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  onSearchChange(): void {
    const q = this.search.trim();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: q ? { q } : { q: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  // Stock notifications
  toggleStockNotifications(): void {
    this.isStockNotificationsOpen = !this.isStockNotificationsOpen;
  }

  closeStockNotifications(): void {
    this.isStockNotificationsOpen = false;
  }

  toggleCalendar(): void {
    this.isCalendarOpen = !this.isCalendarOpen;
    this.syncModalSideEffects();
    if (this.isCalendarOpen) {
      queueMicrotask(() => this.calendarDialog?.nativeElement?.focus());
    }
  }

  closeCalendar(): void {
    this.isCalendarOpen = false;
    this.syncModalSideEffects();
  }

  openEditModal(task: Task): void {
    // Añadir los productos cargados a la tarea para que el modal los muestre
    this.taskToEdit = {
      ...task,
      taskProducts: this.taskProducts as any
    };
    this.isEditMode = true;
    this.isTaskModalOpen = true;
    this.syncModalSideEffects();
    queueMicrotask(() => this.taskDialog?.nativeElement?.focus());
  }

  closeTaskModal(): void {
    this.isTaskModalOpen = false;
    this.isEditMode = false;
    this.taskToEdit = null;
    this.syncModalSideEffects();
  }

  private syncModalSideEffects(): void {
    if (this.isCalendarOpen || this.isTaskModalOpen) {
      this.lockScroll();
    } else {
      this.unlockScroll();
    }
  }

  private lockScroll(): void {
    const body = this.document?.body;
    if (!body) return;
    this.renderer.addClass(body, 'is-scroll-locked');
  }

  private unlockScroll(): void {
    const body = this.document?.body;
    if (!body) return;
    this.renderer.removeClass(body, 'is-scroll-locked');
  }

  backToList(): void {
    const q = this.route.snapshot.queryParamMap.get('q');
    this.router.navigate(['/tareas'], {
      queryParams: q ? { q } : {},
      fragment: 'lista'
    });
  }

  edit(): void {
    this.openEditModal(this.task);
  }

  complete(): void {
    this.runAction(() => this.taskService.completeTask(this.task.id));
  }

  toggleImportant(): void {
    const action = this.task.important
      ? this.taskService.removeImportant(this.task.id)
      : this.taskService.markAsImportant(this.task.id);

    this.runAction(() => action);
  }

  private runAction(request: () => any): void {
    if (this.isLoadingAction) return;

    this.isLoadingAction = true;

    request().subscribe({
      next: (updated: Task) => {
        this.task = updated;
        this.isLoadingAction = false;
        this.notificationService.success('Acción completada');
      },
      error: () => {
        this.isLoadingAction = false;
        this.notificationService.error('Error al realizar la acción');
      }
    });
  }

  getPriorityLabel(priority: TaskPriority | string): string {
    const labels: Record<string, string> = {
      LOW: 'Baja',
      MEDIUM: 'Moderada',
      HIGH: 'Alta'
    };
    return labels[priority] ?? priority;
  }

  getStatusLabel(status: TaskStatus | string): string {
    const labels: Record<string, string> = {
      PENDING: 'Sin Comenzar',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada'
    };
    return labels[status] ?? status;
  }

  handleTaskUpdated(taskData: TaskFormData): void {
    if (!taskData.id) return;

    const taskRequest: TaskRequest = {
      title: taskData.title,
      description: taskData.description,
      priority: this.convertPriorityFromModal(taskData.priority),
      dueDate: taskData.date ? `${taskData.date}T23:59:59` : undefined,
      important: taskData.important
    };

    this.taskService.updateTask(taskData.id, taskRequest).subscribe({
      next: (updated: Task) => {
        this.task = updated;
        
        // Actualizar productos si se han modificado
        if (taskData.selectedProducts !== undefined) {
          this.updateTaskProducts(String(taskData.id), taskData.selectedProducts);
        }
        
        this.closeTaskModal();
        this.notificationService.success('Tarea actualizada correctamente');
      },
      error: () => {
        this.notificationService.error('Error al actualizar la tarea');
        // Mantener el modal abierto para que el usuario pueda reintentar
      }
    });
  }

  private updateTaskProducts(taskId: string, newProducts: { product: any; quantity: number }[]): void {
    // Obtener IDs de productos actuales
    const currentProductIds = new Set(this.taskProducts.map(tp => tp.product.id));
    // Obtener IDs de productos nuevos
    const newProductIds = new Set(newProducts.map(sp => sp.product.id));

    // Productos a eliminar (están en current pero no en new)
    const productsToRemove = this.taskProducts.filter(tp => !newProductIds.has(tp.product.id));
    
    // Productos a añadir (están en new pero no en current)
    const productsToAdd = newProducts.filter(sp => !currentProductIds.has(sp.product.id));
    
    // Productos a actualizar (están en ambos pero pueden tener cantidad diferente)
    const productsToUpdate = newProducts.filter(sp => currentProductIds.has(sp.product.id));

    // Crear arrays de observables para cada operación
    const removeOperations = productsToRemove.map(tp => 
      this.taskProductService.removeProductFromTask(tp.id)
    );

    const addOperations = productsToAdd.map(sp => 
      this.taskProductService.assignProductToTask(taskId, {
        productId: sp.product.id,
        quantity: sp.quantity
      })
    );

    const updateOperations = productsToUpdate
      .filter(sp => {
        const existingProduct = this.taskProducts.find(tp => tp.product.id === sp.product.id);
        return existingProduct && existingProduct.quantity !== sp.quantity;
      })
      .map(sp => {
        const existingProduct = this.taskProducts.find(tp => tp.product.id === sp.product.id)!;
        return this.taskProductService.updateTaskProduct(existingProduct.id, {
          productId: sp.product.id,
          quantity: sp.quantity
        });
      });

    // Combinar todas las operaciones
    const allOperations = [...removeOperations, ...addOperations, ...updateOperations];

    if (allOperations.length === 0) {
      // No hay cambios en productos
      return;
    }

    // Ejecutar todas las operaciones y esperar a que terminen
    forkJoin(allOperations.length > 0 ? allOperations : [of(null)]).subscribe({
      next: () => {
        // Recargar productos después de que todas las operaciones terminen
        this.loadTaskProducts();
      },
      error: (err) => {
        console.error('Error updating task products:', err);
        this.notificationService.error('Error al actualizar algunos productos');
        // Recargar de todos modos para mostrar el estado actual
        this.loadTaskProducts();
      }
    });
  }

  private convertPriorityFromModal(priority: string): TaskPriority {
    switch (priority) {
      case 'absolute':
      case 'high':
        return TaskPriority.HIGH;
      case 'moderate':
      case 'medium':
        return TaskPriority.MEDIUM;
      case 'low':
      default:
        return TaskPriority.LOW;
    }
  }

  /**
   * Maneja la selección de imagen para la tarea
   */
  onTaskImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.notificationService.error('Formato no soportado. Usa SVG, JPG, PNG o WebP.');
      input.value = '';
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.notificationService.error('La imagen es demasiado grande (máx 2MB).');
      input.value = '';
      return;
    }

    this.isLoadingAction = true;
    this.cdr.detectChanges();

    const taskId = String(this.task.id || this.task._id);
    this.taskService.uploadTaskImage(taskId, file).subscribe({
      next: (updatedTask) => {
        this.task = updatedTask;
        this.isLoadingAction = false;
        this.notificationService.success('Imagen de tarea actualizada correctamente');
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingAction = false;
        this.notificationService.error('Error al subir la imagen');
        this.cdr.detectChanges();
      }
    });

    input.value = '';
  }
}
