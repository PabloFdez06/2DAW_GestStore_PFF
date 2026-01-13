import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IconComponent } from '../../components/atoms/icon/icon.component';
import { CalendarComponent } from '../../components/molecules/calendar/calendar.component';
import { AddTaskModalComponent } from '../../components/molecules/add-task-modal/add-task-modal.component';
import { TaskMenuComponent, TaskMenuAction } from '../../components/molecules/task-menu/task-menu.component';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus, TaskPriority, TaskRequest, TaskStatistics } from '../../models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
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
  
  // Estados de carga
  isLoadingTasks: boolean = false;
  isLoadingStats: boolean = false;
  errorMessage: string = '';
  
  // Estadísticas
  statistics: TaskStatistics | null = null;
  
  constructor(private taskService: TaskService) {}
  
  ngOnInit() {
    this.updateCurrentDate();
    this.loadTasks();
    this.loadStatistics();
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
   * Cargar todas las tareas desde la API
   */
  loadTasks() {
    this.isLoadingTasks = true;
    this.errorMessage = '';
    
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED);
        this.completedTasksData = tasks.filter(t => t.status === TaskStatus.COMPLETED);
        this.isLoadingTasks = false;
      },
      error: (error) => {
        console.error('Error al cargar tareas:', error);
        this.errorMessage = 'Error al cargar las tareas. Por favor, intenta de nuevo.';
        this.isLoadingTasks = false;
        // Usar datos de respaldo si falla la API
        this.tasks = [];
        this.completedTasksData = [];
      }
    });
  }
  
  /**
   * Cargar estadísticas desde la API
   */
  loadStatistics() {
    this.isLoadingStats = true;
    
    this.taskService.getTaskStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.isLoadingStats = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.isLoadingStats = false;
      }
    });
  }
  
  handleTaskAdded(task: any) {
    // Convertir el formato del modal al formato de la API
    const taskRequest: TaskRequest = {
      title: task.title,
      description: task.description,
      priority: this.convertPriorityFromModal(task.priority),
      status: TaskStatus.PENDING
    };
    
    this.taskService.createTask(taskRequest).subscribe({
      next: (newTask) => {
        // Recargar las tareas después de crear una nueva
        this.loadTasks();
        this.loadStatistics();
        this.closeTaskModal();
      },
      error: (error) => {
        console.error('Error al crear tarea:', error);
        this.errorMessage = 'Error al crear la tarea. Por favor, intenta de nuevo.';
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
        console.log('Quitar de importante:', task.title);
        // TODO: Implementar funcionalidad de importante
        break;
      case 'edit':
        console.log('Editar tarea:', task.title);
        // TODO: Implementar edición de tarea
        break;
      case 'delete':
        // Cancelar tarea en lugar de eliminar
        this.taskService.cancelTask(task.id).subscribe({
          next: () => {
            this.loadTasks();
            this.loadStatistics();
          },
          error: (error) => {
            console.error('Error al cancelar tarea:', error);
            this.errorMessage = 'Error al cancelar la tarea.';
          }
        });
        break;
      case 'complete':
        this.taskService.completeTask(task.id).subscribe({
          next: () => {
            this.loadTasks();
            this.loadStatistics();
          },
          error: (error) => {
            console.error('Error al completar tarea:', error);
            this.errorMessage = 'Error al completar la tarea.';
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
