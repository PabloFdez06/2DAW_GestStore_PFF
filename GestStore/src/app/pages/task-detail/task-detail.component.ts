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
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { ThemeService } from '../../services/theme.service';
import { Task, TaskStatus, TaskPriority, TaskRequest } from '../../models/task.model';
import { User } from '../../models/auth.model';
import { AddTaskModalComponent, TaskFormData } from '../../components/molecules/add-task-modal/add-task-modal.component';
import { CalendarComponent } from '../../components/molecules/calendar/calendar.component';
import { IconComponent } from '../../components/atoms/icon/icon.component';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AddTaskModalComponent, CalendarComponent, IconComponent],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent implements OnInit, OnDestroy {
  task!: Task;
  isLoadingAction = false;

  search = '';
  currentDate = '';
  currentDayName = '';
  isCalendarOpen = false;
  isTaskModalOpen = false;
  isEditMode = false;
  taskToEdit: Task | null = null;
  currentUser: User | null = null;
  avatarUrl: string | null = null;
  isSidebarOpen = false;

  @ViewChild('calendarDialog', { read: ElementRef }) calendarDialog?: ElementRef<HTMLDialogElement>;
  @ViewChild('taskDialog', { read: ElementRef }) taskDialog?: ElementRef<HTMLDialogElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private taskService: TaskService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.task = this.route.snapshot.data['task'] as Task;

    this.setCurrentDate();
    this.loadAvatar();
    this.loadCurrentUser();

    this.route.queryParamMap.subscribe(params => {
      this.search = params.get('q') ?? '';
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

  private loadAvatar(): void {
    const stored = localStorage.getItem('geststore.avatar');
    this.avatarUrl = stored && stored.trim().length > 0 ? stored : null;
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

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.isSidebarOpen) {
      this.lockScroll();
    } else {
      this.unlockScroll();
    }
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
    this.unlockScroll();
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
    
    // Cerrar sidebar si está abierto cuando se abre un modal
    if ((this.isCalendarOpen || this.isTaskModalOpen) && this.isSidebarOpen) {
      this.isSidebarOpen = false;
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

  onLogout(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.authService.logout();
    }
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
      },
      error: () => {
        this.isLoadingAction = false;
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
        this.closeTaskModal();
      },
      error: () => {
        // Mantener el modal abierto para que el usuario pueda reintentar
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
}
