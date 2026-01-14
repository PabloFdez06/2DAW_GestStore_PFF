import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, Renderer2, Inject, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { ThemeService } from '../../services/theme.service';
import { Task, TaskStatus, TaskPriority, TaskRequest } from '../../models/task.model';
import { User } from '../../models/auth.model';
import { AddTaskModalComponent, TaskFormData } from '../../components/molecules/add-task-modal/add-task-modal.component';
import { CalendarComponent } from '../../components/molecules/calendar/calendar.component';
import { IconComponent } from '../../components/atoms/icon/icon.component';
import { TaskMenuComponent, TaskMenuAction } from '../../components/molecules/task-menu/task-menu.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AddTaskModalComponent, CalendarComponent, IconComponent, TaskMenuComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  isLoading = false;
  errorMessage = '';
  search = '';
  currentDate = '';
  currentDayName = '';
  isTaskModalOpen = false;
  isEditMode = false;
  taskToEdit: Task | null = null;
  isCalendarOpen = false;
  currentUser: User | null = null;
  openTaskMenuIndex: number = -1;

  avatarUrl: string | null = null;

  @ViewChild('calendarDialog', { read: ElementRef }) calendarDialog?: ElementRef<HTMLDialogElement>;
  @ViewChild('taskDialog', { read: ElementRef }) taskDialog?: ElementRef<HTMLDialogElement>;

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private themeService: ThemeService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.setCurrentDate();
    this.loadAvatar();
    this.loadCurrentUser();

    this.route.queryParamMap.subscribe(params => {
      this.search = params.get('q') ?? '';
    });
  }

  private loadAvatar(): void {
    const stored = localStorage.getItem('geststore.avatar');
    this.avatarUrl = stored && stored.trim().length > 0 ? stored : null;
  }

  ngOnDestroy(): void {
    this.unlockScroll();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
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

  private setCurrentDate(): void {
    const now = new Date();
    const day = now.getDate();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    this.currentDayName = days[now.getDay()];
    this.currentDate = `${day} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
  }

  // Theme methods
  get themeIcon(): string {
    return this.themeService.mode() === 'dark' ? 'moon' : 'sun';
  }

  get themeAriaLabel(): string {
    return this.themeService.mode() === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  // User loading
  loadCurrentUser(): void {
    this.authService.currentUser.subscribe(user => {
      this.ngZone.run(() => {
        this.currentUser = user;
        this.cdr.detectChanges();
        if (user) {
          this.loadTasks();
        }
      });
    });
  }

  get filteredTasks(): Task[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.tasks;

    return this.tasks.filter(t =>
      t.title.toLowerCase().includes(term) ||
      (t.description ?? '').toLowerCase().includes(term)
    );
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

  // Calendar controls
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

  // Task modal controls
  openAddTaskModal(): void {
    this.isEditMode = false;
    this.taskToEdit = null;
    this.isTaskModalOpen = true;
    this.syncModalSideEffects();
    queueMicrotask(() => this.taskDialog?.nativeElement?.focus());
  }

  openEditModal(task: Task): void {
    this.taskToEdit = task;
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

  loadTasks(): void {
    if (!this.currentUser?.id) {
      this.errorMessage = 'No hay usuario autenticado.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const created$ = this.taskService.getTasksCreatedByUser(String(this.currentUser.id));
    const assigned$ = this.taskService.getTasksByAssignedUser(String(this.currentUser.id));

    forkJoin([created$, assigned$]).subscribe({
      next: ([created, assigned]) => {
        const mapById = new Map<string, Task>();
        for (const t of [...created, ...assigned]) {
          const key = String((t as any).id ?? (t as any)._id ?? '');
          if (!key) continue;
          mapById.set(key, t);
        }
        this.tasks = Array.from(mapById.values()).sort((a, b) => {
          const aTime = new Date(a.updatedAt ?? a.createdAt).getTime();
          const bTime = new Date(b.updatedAt ?? b.createdAt).getTime();
          return bTime - aTime;
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las tareas.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToTask(task: Task): void {
    const id = (task as any).id ?? (task as any)._id;
    if (!id) return;

    this.router.navigate(['/tareas', id], {
      queryParams: this.search ? { q: this.search } : {},
      fragment: 'detalle'
    });
  }

  handleTaskAdded(taskData: any): void {
    if (!this.currentUser?.id) return;

    const taskRequest: TaskRequest = {
      title: taskData.title,
      description: taskData.description,
      priority: this.convertPriorityFromModal(taskData.priority),
      status: TaskStatus.PENDING,
      dueDate: taskData.date ? `${taskData.date}T23:59:59` : undefined,
      important: taskData.priority === 'absolute'
    };

    this.taskService.createTask(taskRequest).subscribe({
      next: () => {
        this.closeTaskModal();
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error al crear tarea:', error);
        this.errorMessage = 'Error al crear la tarea: ' + (error.error?.message || error.message);
        this.cdr.detectChanges();
      }
    });
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
      next: () => {
        this.closeTaskModal();
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error al actualizar tarea:', error);
        this.errorMessage = 'Error al actualizar la tarea: ' + (error.error?.message || error.message);
        this.cdr.detectChanges();
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

  onLogout(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.authService.logout();
    }
  }

  onMenuClick(event: Event, task: Task): void {
    event.stopPropagation();
  }

  toggleTaskMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.openTaskMenuIndex = this.openTaskMenuIndex === index ? -1 : index;
  }

  closeTaskMenu(): void {
    this.openTaskMenuIndex = -1;
  }

  handleTaskAction(action: TaskMenuAction, taskIndex: number): void {
    const task = this.filteredTasks[taskIndex];
    
    switch (action.type) {
      case 'important':
        const importantAction = task.important 
          ? this.taskService.removeImportant(task.id)
          : this.taskService.markAsImportant(task.id);
        
        importantAction.subscribe({
          next: () => {
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
        this.openEditModal(task);
        break;
        
      case 'delete':
        if (confirm(`¿Estás seguro de eliminar la tarea "${task.title}"?`)) {
          this.taskService.deleteTask(task.id).subscribe({
            next: () => {
              this.loadTasks();
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
          next: () => {
            this.loadTasks();
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error al completar tarea:', error);
            this.errorMessage = 'Error al completar la tarea: ' + (error.error?.message || error.message);
            this.cdr.detectChanges();
          }
        });
        break;
        
      case 'start':
        this.taskService.startTask(task.id).subscribe({
          next: () => {
            this.loadTasks();
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error al iniciar tarea:', error);
            this.errorMessage = 'Error al iniciar la tarea: ' + (error.error?.message || error.message);
            this.cdr.detectChanges();
          }
        });
        break;
    }
    
    this.closeTaskMenu();
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
}
