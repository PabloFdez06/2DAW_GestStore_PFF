import { Component, OnDestroy, OnInit, HostListener, ChangeDetectorRef, NgZone, ElementRef, Renderer2, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { IconComponent } from '../../components/atoms/icon/icon.component';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { CalendarComponent } from '../../components/molecules/calendar/calendar.component';
import { AddTaskModalComponent, TaskFormData } from '../../components/molecules/add-task-modal/add-task-modal.component';
import { TaskMenuComponent, TaskMenuAction } from '../../components/molecules/task-menu/task-menu.component';
import { StockNotificationsComponent } from '../../components/molecules/stock-notifications/stock-notifications.component';
import { SidebarLayoutComponent } from '../../components/layout/sidebar-layout/sidebar-layout.component';
import { TaskService } from '../../services/task.service';
import { TaskProductService } from '../../services/task-product.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service';
import { StockAlertService } from '../../services/stock-alert.service';
import { Task, TaskStatus, TaskPriority, TaskRequest, TaskStatistics } from '../../models/task.model';
import { Product } from '../../models/product.model';
import { User } from '../../models/auth.model';
import { SpinnerComponent } from '../../components/atoms/spinner/spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    IconComponent,
    ButtonComponent,
    CalendarComponent,
    AddTaskModalComponent,
    TaskMenuComponent,
    SpinnerComponent,
    StockNotificationsComponent,
    SidebarLayoutComponent
  ],
  providers: [TaskService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // Fecha actual
  currentDayName: string = '';
  currentDate: string = '';
  
  // Control del calendario
  isCalendarOpen: boolean = false;
  
  // Control del modal de añadir/editar tarea
  isTaskModalOpen: boolean = false;
  isEditMode: boolean = false;
  taskToEdit: Task | null = null;
  
  // Control del menú de tarea (índice de la tarea con menú abierto, -1 si ninguno)
  openTaskMenuIndex: number = -1;
  
  // Tareas desde la API
  tasks: Task[] = [];
  completedTasksData: Task[] = [];
  
  // Búsqueda
  searchTerm: string = '';
  
  // Estados de carga
  isLoadingTasks: boolean = false;
  isLoadingStats: boolean = false;
  errorMessage: string = '';
  
  // Estadísticas
  statistics: TaskStatistics | null = null;
  
  // Usuario actual
  currentUser: User | null = null;

  // Getter para todas las tareas (para el calendario)
  get allTasksForCalendar(): Task[] {
    return [...this.tasks, ...this.completedTasksData];
  }

  // Stock notifications
  isStockNotificationsOpen: boolean = false;

  @ViewChild('calendarDialog', { read: ElementRef }) calendarDialog?: ElementRef<HTMLDialogElement>;
  @ViewChild('taskDialog', { read: ElementRef }) taskDialog?: ElementRef<HTMLDialogElement>;
  
  constructor(
    private taskService: TaskService,
    private taskProductService: TaskProductService,
    private productService: ProductService,
    private authService: AuthService,
    private themeService: ThemeService,
    private notificationService: NotificationService,
    protected stockAlertService: StockAlertService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  get themeIcon(): string {
    return this.themeService.mode() === 'dark' ? 'moon' : 'sun';
  }

  get themeAriaLabel(): string {
    return this.themeService.mode() === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }
  
  ngOnInit() {
    this.updateCurrentDate();
    this.loadCurrentUser(); // Esto cargará las tareas cuando el usuario esté disponible
    this.stockAlertService.loadAlerts();
  }
  
  toggleStockNotifications(): void {
    this.isStockNotificationsOpen = !this.isStockNotificationsOpen;
  }
  
  closeStockNotifications(): void {
    this.isStockNotificationsOpen = false;
  }

  ngOnDestroy(): void {
    this.unlockScroll();
  }
  
  /**
   * Getter para filtrar tareas por término de búsqueda
   */
  get filteredTasks(): Task[] {
    if (!this.searchTerm.trim()) {
      return this.tasks;
    }
    const term = this.searchTerm.toLowerCase().trim();
    return this.tasks.filter(task => 
      task.title.toLowerCase().includes(term) ||
      (task.description && task.description.toLowerCase().includes(term))
    );
  }
  
  /**
   * Getter para filtrar tareas completadas por término de búsqueda
   */
  get filteredCompletedTasks(): Task[] {
    if (!this.searchTerm.trim()) {
      return this.completedTasksData;
    }
    const term = this.searchTerm.toLowerCase().trim();
    return this.completedTasksData.filter(task => 
      task.title.toLowerCase().includes(term) ||
      (task.description && task.description.toLowerCase().includes(term))
    );
  }
  
  /**
   * Cargar información del usuario actual
   */
  loadCurrentUser() {
    this.authService.currentUser.subscribe(user => {
      this.ngZone.run(() => {
        this.currentUser = user;
        this.cdr.detectChanges();
        // Cuando cambie el usuario, recargar las tareas
        if (user) {
          this.loadTasks();
          this.loadStatistics();
        }
      });
    });
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Cerrar el menú de tarea cuando se hace clic fuera
    if (this.openTaskMenuIndex !== -1) {
      this.closeTaskMenu();
    }
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
      return;
    }

    if (this.openTaskMenuIndex !== -1) {
      keyboardEvent.preventDefault();
      this.closeTaskMenu();
    }
  }
  
  updateCurrentDate() {
    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    this.currentDayName = days[now.getDay()];
    this.currentDate = `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
  }
  
  toggleCalendar() {
    this.isCalendarOpen = !this.isCalendarOpen;
    this.syncModalSideEffects();
    if (this.isCalendarOpen) {
      queueMicrotask(() => this.calendarDialog?.nativeElement?.focus());
    }
  }
  
  closeCalendar() {
    this.isCalendarOpen = false;
    this.syncModalSideEffects();
  }
  
  toggleTaskModal() {
    this.isTaskModalOpen = !this.isTaskModalOpen;
    if (!this.isTaskModalOpen) {
      this.isEditMode = false;
      this.taskToEdit = null;
    }
    this.syncModalSideEffects();
    if (this.isTaskModalOpen) {
      queueMicrotask(() => this.taskDialog?.nativeElement?.focus());
    }
  }
  
  closeTaskModal() {
    this.isTaskModalOpen = false;
    this.isEditMode = false;
    this.taskToEdit = null;
    this.syncModalSideEffects();
  }

  openEditModal(task: Task) {
    this.taskToEdit = task;
    this.isEditMode = true;
    this.isTaskModalOpen = true;
    this.syncModalSideEffects();
    queueMicrotask(() => this.taskDialog?.nativeElement?.focus());
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
  
  /**
   * Cargar todas las tareas del usuario actual desde la API
   */
  loadTasks() {
    if (!this.currentUser || !this.currentUser.id) {
      console.log('No hay usuario logueado, no se cargarán tareas');
      return;
    }

    this.isLoadingTasks = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    
    // Cargar tareas creadas por el usuario y asignadas a él
    const createdTasks$ = this.taskService.getTasksCreatedByUser(this.currentUser.id);
    const assignedTasks$ = this.taskService.getTasksByAssignedUser(this.currentUser.id);
    
    // Combinar ambas listas eliminando duplicados usando forkJoin (mejor que Promise.all)
    forkJoin([createdTasks$, assignedTasks$]).subscribe({
      next: ([created, assigned]) => {
        // Combinar y eliminar duplicados por ID
        const allTasks = [...(created || []), ...(assigned || [])];
        const uniqueTasks = allTasks.filter((task, index, self) =>
          index === self.findIndex((t) => t.id === task.id)
        );
        
        this.tasks = uniqueTasks.filter(t => t.status !== TaskStatus.COMPLETED);
        this.completedTasksData = uniqueTasks.filter(t => t.status === TaskStatus.COMPLETED);
        this.isLoadingTasks = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar tareas:', error);
        this.errorMessage = 'Error al cargar las tareas. Por favor, intenta de nuevo.';
        this.isLoadingTasks = false;
        this.tasks = [];
        this.completedTasksData = [];
        this.cdr.detectChanges();
      }
    });
  }
  
  /**
   * Cargar estadísticas desde la API
   */
  loadStatistics() {
    if (!this.currentUser || !this.currentUser.id) {
      console.warn('No hay usuario actual para cargar estadísticas');
      return;
    }

    this.isLoadingStats = true;
    this.cdr.detectChanges();
    
    this.taskService.getTaskStatisticsByUser(this.currentUser.id).subscribe({
      next: (stats) => {
        this.statistics = stats;
        console.log('Estadísticas cargadas:', stats);
        this.isLoadingStats = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.isLoadingStats = false;
        // Establecer estadísticas vacías por defecto
        this.statistics = {
          totalTasks: 0,
          pendingTasks: 0,
          inProgressTasks: 0,
          completedTasks: 0,
          cancelledTasks: 0,
          overdueTasks: 0,
          completionRate: 0
        };
        this.cdr.detectChanges();
      }
    });
  }
  
  handleTaskAdded(task: any) {
    // Validar usuario desde localStorage directamente
    const userStr = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    console.log('=== DEBUG CREATE TASK ===');
    console.log('localStorage.currentUser:', userStr);
    console.log('localStorage.token exists:', !!token);
    
    if (!userStr) {
      console.error('No hay usuario en localStorage');
      this.errorMessage = 'Error: No se pudo identificar el usuario. Por favor, vuelve a iniciar sesión.';
      this.cdr.detectChanges();
      return;
    }

    if (!token) {
      console.error('No hay token en localStorage');
      this.errorMessage = 'Error: Sesión expirada. Por favor, vuelve a iniciar sesión.';
      this.cdr.detectChanges();
      return;
    }

    let userId: string | undefined;
    try {
      const user = JSON.parse(userStr);
      userId = user?.id ?? user?._id;
      console.log('User object:', user);
      console.log('UserId extraído:', userId);
      
      if (!userId) {
        console.error('El usuario no tiene ID');
        this.errorMessage = 'Error: Usuario inválido. Por favor, vuelve a iniciar sesión.';
        this.cdr.detectChanges();
        return;
      }
    } catch (e) {
      console.error('Error al parsear usuario:', e);
      this.errorMessage = 'Error al procesar datos de usuario';
      this.cdr.detectChanges();
      return;
    }

    // Convertir el formato del modal al formato de la API
    const taskRequest: TaskRequest = {
      title: task.title,
      description: task.description,
      priority: this.convertPriorityFromModal(task.priority),
      status: TaskStatus.PENDING,
      dueDate: task.date ? `${task.date}T23:59:59` : undefined,
      important: task.priority === 'absolute'
    };
    
    console.log('Creando tarea con:', taskRequest);
    console.log('Header X-User-Id debería ser:', userId);
    console.log('=== FIN DEBUG ===');
    
    this.taskService.createTask(taskRequest).subscribe({
      next: (newTask) => {
        console.log('Tarea creada exitosamente:', newTask);

        const taskId = String((newTask as any)?.id ?? (newTask as any)?._id ?? '');
        const selected = (task?.selectedProducts ?? [])
          .filter((sp: any) => sp?.product?.id && sp?.quantity > 0)
          .map((sp: any) => ({ productId: sp.product.id, quantity: sp.quantity }));

        if (!taskId || selected.length === 0) {
          this.loadTasks();
          this.loadStatistics();
          this.closeTaskModal();
          this.notificationService.success('Tarea creada correctamente');
          this.cdr.detectChanges();
          return;
        }

        this.taskProductService.assignMultipleProducts(taskId, selected).subscribe({
          next: () => {
            this.loadTasks();
            this.loadStatistics();
            this.stockAlertService.refresh();
            this.closeTaskModal();
            this.notificationService.success('Tarea creada correctamente');
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error al asignar productos:', error);
            this.errorMessage = 'La tarea se creó, pero no se pudieron asignar los productos.';
            this.notificationService.warning('La tarea se creó, pero no se pudieron asignar los productos');
            this.loadTasks();
            this.loadStatistics();
            this.stockAlertService.refresh();
            this.closeTaskModal();
            this.cdr.detectChanges();
          }
        });
      },
      error: (error) => {
        console.error('Error al crear tarea:', error);
        this.errorMessage = 'Error al crear la tarea: ' + (error.error?.message || error.message);
        this.notificationService.error('Error al crear la tarea');
        this.cdr.detectChanges();
      }
    });
  }

  get completionRateRounded(): number {
    return Math.round(this.statistics?.completionRate ?? 0);
  }

  handleTaskUpdated(taskData: TaskFormData) {
    if (!taskData.id) return;

    const taskRequest: TaskRequest = {
      title: taskData.title,
      description: taskData.description,
      priority: this.convertPriorityFromModal(taskData.priority),
      dueDate: taskData.date ? `${taskData.date}T23:59:59` : undefined,
      important: taskData.important
    };
    
    console.log('Actualizando tarea:', taskData.id, taskRequest);
    
    this.taskService.updateTask(taskData.id, taskRequest).subscribe({
      next: (updatedTask) => {
        console.log('Tarea actualizada exitosamente:', updatedTask);
        this.loadTasks();
        this.loadStatistics();
        this.closeTaskModal();
        this.notificationService.success('Tarea actualizada correctamente');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al actualizar tarea:', error);
        this.errorMessage = 'Error al actualizar la tarea: ' + (error.error?.message || error.message);
        this.notificationService.error('Error al actualizar la tarea');
        this.cdr.detectChanges();
      }
    });
  }
  
  /**
   * Convertir prioridad del modal al enum de la API
   */
  convertPriorityFromModal(priority: string): TaskPriority {
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
  
  toggleTaskMenu(index: number, event: Event) {
    event.stopPropagation();
    this.openTaskMenuIndex = this.openTaskMenuIndex === index ? -1 : index;
  }
  
  closeTaskMenu() {
    this.openTaskMenuIndex = -1;
  }

  goToTask(taskId: string | number): void {
    this.closeTaskMenu();
    this.router.navigate(['/tareas', taskId]);
  }
  
  handleTaskAction(action: TaskMenuAction, taskIndex: number) {
    const task = this.tasks[taskIndex];
    
    switch (action.type) {
      case 'important':
        const importantAction = task.important 
          ? this.taskService.removeImportant(task.id)
          : this.taskService.markAsImportant(task.id);
        
        importantAction.subscribe({
          next: (updatedTask) => {
            console.log('Tarea actualizada:', updatedTask);
            this.loadTasks();
            this.notificationService.success('Importancia actualizada');
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error al cambiar importancia:', error);
            this.errorMessage = 'Error al cambiar la importancia de la tarea.';
            this.notificationService.error('Error al cambiar la importancia');
            this.cdr.detectChanges();
          }
        });
        break;
        
      case 'edit':
        this.openEditModal(task);
        break;
        
      case 'delete':
        if (confirm(`¿Estás seguro de eliminar la tarea "${task.title}"?`)) {
          this.taskService.deleteTask(task.id).subscribe({
            next: () => {
              console.log('Tarea eliminada exitosamente');
              this.loadTasks();
              this.loadStatistics();
              this.notificationService.success('Tarea eliminada correctamente');
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Error al eliminar tarea:', error);
              this.errorMessage = 'Error al eliminar la tarea.';
              this.notificationService.error('Error al eliminar la tarea');
              this.cdr.detectChanges();
            }
          });
        }
        break;
        
      case 'complete':
        this.taskService.completeTask(task.id).subscribe({
          next: (completedTask) => {
            console.log('Tarea completada exitosamente:', completedTask);
            this.loadTasks();
            this.loadStatistics();
            this.notificationService.success('Tarea completada');
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error al completar tarea:', error);
            this.errorMessage = 'Error al completar la tarea: ' + (error.error?.message || error.message);
            this.notificationService.error('Error al completar la tarea');
            this.cdr.detectChanges();
          }
        });
        break;
        
      case 'start':
        this.taskService.startTask(task.id).subscribe({
          next: () => {
            console.log('Tarea iniciada exitosamente');
            this.loadTasks();
            this.loadStatistics();
            this.notificationService.success('Tarea iniciada');
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error al iniciar tarea:', error);
            this.errorMessage = 'Error al iniciar la tarea: ' + (error.error?.message || error.message);
            this.notificationService.error('Error al iniciar la tarea');
            this.cdr.detectChanges();
          }
        });
        break;
    }
    
    this.closeTaskMenu();
  }
  /**
   * Obtener el color de prioridad para la UI
   */
  getPriorityColor(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'high';
      case TaskPriority.MEDIUM:
        return 'moderate';
      case TaskPriority.LOW:
        return 'low';
      default:
        return 'moderate';
    }
  }
  
  /**
   * Obtener el texto de prioridad para la UI
   */
  getPriorityText(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'Alta';
      case TaskPriority.MEDIUM:
        return 'Moderada';
      case TaskPriority.LOW:
        return 'Baja';
      default:
        return 'Moderada';
    }
  }
  
  /**
   * Obtener el color de estado para la UI
   */
  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING:
        return 'notstarted';
      case TaskStatus.IN_PROGRESS:
        return 'inprogress';
      case TaskStatus.COMPLETED:
        return 'completed';
      case TaskStatus.CANCELLED:
        return 'cancelled';
      default:
        return 'notstarted';
    }
  }
  
  /**
   * Obtener el texto de estado para la UI
   */
  getStatusText(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING:
        return 'Sin Comenzar';
      case TaskStatus.IN_PROGRESS:
        return 'En Progreso';
      case TaskStatus.COMPLETED:
        return 'Completada';
      case TaskStatus.CANCELLED:
        return 'Cancelada';
      default:
        return 'Sin Comenzar';
    }
  }
  
  /**
   * Formatear fecha para la UI
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES');
  }
  
  /**
   * Calcular tiempo transcurrido desde completada
   */
  getCompletedAgo(completedDate: string): string {
    const now = new Date();
    const completed = new Date(completedDate);
    const diffMs = now.getTime() - completed.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hace un momento';
    if (diffDays === 1) return '1 día';
    return `${diffDays} días`;
  }
}
