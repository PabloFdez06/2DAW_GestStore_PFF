import { Component, OnInit, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { IconComponent } from '../../components/atoms/icon/icon.component';
import { CalendarComponent } from '../../components/molecules/calendar/calendar.component';
import { AddTaskModalComponent } from '../../components/molecules/add-task-modal/add-task-modal.component';
import { TaskMenuComponent, TaskMenuAction } from '../../components/molecules/task-menu/task-menu.component';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task, TaskStatus, TaskPriority, TaskRequest, TaskStatistics } from '../../models/task.model';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IconComponent,
    CalendarComponent,
    AddTaskModalComponent,
    TaskMenuComponent
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
  
  // Control del modal de añadir tarea
  isTaskModalOpen: boolean = false;
  
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
  
  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}
  
  ngOnInit() {
    this.updateCurrentDate();
    this.loadCurrentUser(); // Esto cargará las tareas cuando el usuario esté disponible
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
  
  /**
   * Cerrar sesión
   */
  onLogout(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.authService.logout();
    }
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Cerrar el menú de tarea cuando se hace clic fuera
    if (this.openTaskMenuIndex !== -1) {
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
  }
  
  closeCalendar() {
    this.isCalendarOpen = false;
  }
  
  toggleTaskModal() {
    this.isTaskModalOpen = !this.isTaskModalOpen;
  }
  
  closeTaskModal() {
    this.isTaskModalOpen = false;
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
    // Convertir el formato del modal al formato de la API
    const taskRequest: TaskRequest = {
      title: task.title,
      description: task.description,
      priority: this.convertPriorityFromModal(task.priority),
      status: TaskStatus.PENDING,
      dueDate: task.date ? `${task.date}T23:59:59` : undefined,
      important: false
    };
    
    console.log('Creando tarea:', taskRequest);
    
    this.taskService.createTask(taskRequest).subscribe({
      next: (newTask) => {
        console.log('Tarea creada exitosamente:', newTask);
        // Recargar las tareas después de crear una nueva
        this.loadTasks();
        this.loadStatistics();
        this.closeTaskModal();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al crear tarea:', error);
        this.errorMessage = 'Error al crear la tarea: ' + (error.error?.message || error.message);
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
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error al cambiar importancia:', error);
            this.errorMessage = 'Error al cambiar la importancia de la tarea.';
            this.cdr.detectChanges();
          }
        });
        break;
        
      case 'edit':
        console.log('Editar tarea:', task.title);
        // TODO: Implementar modal de edición
        alert('La funcionalidad de edición estará disponible próximamente');
        break;
        
      case 'delete':
        if (confirm(`¿Estás seguro de eliminar la tarea "${task.title}"?`)) {
          this.taskService.deleteTask(task.id).subscribe({
            next: () => {
              console.log('Tarea eliminada exitosamente');
              this.loadTasks();
              this.loadStatistics();
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Error al eliminar tarea:', error);
              this.errorMessage = 'Error al eliminar la tarea.';
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
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error al completar tarea:', error);
            this.errorMessage = 'Error al completar la tarea: ' + (error.error?.message || error.message);
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
