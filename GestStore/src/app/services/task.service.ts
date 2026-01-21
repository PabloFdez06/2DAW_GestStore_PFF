import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, retry, tap } from 'rxjs/operators';
import { 
  Task, 
  TaskRequest, 
  ApiResponse, 
  TaskStatistics 
} from '../models/task.model';

export interface TaskPage {
  content: Task[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = '/api/tasks'; // Nginx hará proxy a backend:8080

  // ============================================================================
  // GESTIÓN DE ESTADO CON SIGNALS
  // ============================================================================
  
  // Estado principal de tareas
  private tasksSignal = signal<Task[]>([]);
  private statisticsSignal = signal<TaskStatistics | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  
  // Paginación
  private currentPageSignal = signal<number>(0);
  private totalPagesSignal = signal<number>(0);
  private totalElementsSignal = signal<number>(0);
  private pageSizeSignal = signal<number>(10);
  
  // Señales computadas (derivadas)
  readonly tasks = computed(() => this.tasksSignal());
  readonly statistics = computed(() => this.statisticsSignal());
  readonly isLoading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly currentPage = computed(() => this.currentPageSignal());
  readonly totalPages = computed(() => this.totalPagesSignal());
  readonly totalElements = computed(() => this.totalElementsSignal());
  readonly hasMorePages = computed(() => this.currentPageSignal() < this.totalPagesSignal() - 1);
  
  // Estadísticas computadas
  readonly pendingCount = computed(() => 
    this.tasksSignal().filter(t => t.status === 'PENDING').length
  );
  readonly inProgressCount = computed(() => 
    this.tasksSignal().filter(t => t.status === 'IN_PROGRESS').length
  );
  readonly completedCount = computed(() => 
    this.tasksSignal().filter(t => t.status === 'COMPLETED').length
  );
  readonly importantCount = computed(() => 
    this.tasksSignal().filter(t => t.important).length
  );

  // BehaviorSubject para compatibilidad con componentes que usan Observable
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor(private http: HttpClient) {}

  private handleError(_operation: string) {
    return (error: unknown) => {
      this.errorSignal.set(error instanceof Error ? error.message : 'Error desconocido');
      this.loadingSignal.set(false);
      return throwError(() => error);
    };
  }

  // ============================================================================
  // MÉTODOS DE ACTUALIZACIÓN DE ESTADO
  // ============================================================================
  
  /**
   * Actualiza el estado interno después de crear una tarea
   */
  private addTaskToState(task: Task): void {
    const current = this.tasksSignal();
    this.tasksSignal.set([task, ...current]);
    this.tasksSubject.next(this.tasksSignal());
  }

  /**
   * Actualiza el estado interno después de modificar una tarea
   */
  private updateTaskInState(updatedTask: Task): void {
    const current = this.tasksSignal();
    const index = current.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      const updated = [...current];
      updated[index] = updatedTask;
      this.tasksSignal.set(updated);
      this.tasksSubject.next(updated);
    }
  }

  /**
   * Elimina una tarea del estado interno
   */
  private removeTaskFromState(taskId: string | number): void {
    const current = this.tasksSignal();
    const filtered = current.filter(t => t.id !== taskId);
    this.tasksSignal.set(filtered);
    this.tasksSubject.next(filtered);
  }

  /**
   * Establece las tareas en el estado (para carga inicial o refresh)
   */
  setTasks(tasks: Task[]): void {
    this.tasksSignal.set(tasks);
    this.tasksSubject.next(tasks);
  }

  /**
   * Limpia el estado de error
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  // ============================================================================
  // MÉTODOS DE OBTENCIÓN DE DATOS
  // ============================================================================

  /**
   * Obtener tareas con paginación (para infinite scroll)
   */
  getTasksPaginated(page: number = 0, size: number = 10): Observable<TaskPage> {
    this.loadingSignal.set(true);
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<TaskPage>>(`${this.apiUrl}`, { params })
      .pipe(
        retry(1),
        map(response => response.data),
        tap(pageData => {
          this.currentPageSignal.set(pageData.number);
          this.totalPagesSignal.set(pageData.totalPages);
          this.totalElementsSignal.set(pageData.totalElements);
          this.pageSizeSignal.set(pageData.size);
          
          if (page === 0) {
            // Primera página: reemplazar
            this.tasksSignal.set(pageData.content);
          } else {
            // Páginas siguientes: agregar (infinite scroll)
            const current = this.tasksSignal();
            const newTasks = pageData.content.filter(
              t => !current.some(existing => existing.id === t.id)
            );
            this.tasksSignal.set([...current, ...newTasks]);
          }
          this.tasksSubject.next(this.tasksSignal());
          this.loadingSignal.set(false);
        }),
        catchError(this.handleError('getTasksPaginated'))
      );
  }

  /**
   * Cargar más tareas (infinite scroll)
   */
  loadMoreTasks(): Observable<TaskPage> | null {
    if (!this.hasMorePages()) return null;
    return this.getTasksPaginated(this.currentPageSignal() + 1, this.pageSizeSignal());
  }

  /**
   * Refrescar tareas (vuelve a la primera página)
   */
  refreshTasks(): Observable<TaskPage> {
    return this.getTasksPaginated(0, this.pageSizeSignal());
  }

  /**
   * Obtener todas las tareas (sin paginación)
   */
  getAllTasks(): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/all`)
      .pipe(
        retry(1),
        map(response => response.data),
        catchError(this.handleError('getAllTasks'))
      );
  }

  /**
   * Obtener una tarea por ID
   */
  getTaskById(id: string | number): Observable<Task> {
    return this.http.get<ApiResponse<Task>>(`${this.apiUrl}/${id}`)
      .pipe(
        retry(1),
        map(response => response.data),
        catchError(this.handleError('getTaskById'))
      );
  }

  /**
   * Obtener tareas asignadas a un usuario
   */
  getTasksByAssignedUser(userId: string): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/user/${userId}`)
      .pipe(
        retry(1),
        map(response => response.data),
        catchError(this.handleError('getTasksByAssignedUser'))
      );
  }

  /**
   * Obtener tareas creadas por un usuario
   */
  getTasksCreatedByUser(userId: string): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/created-by/${userId}`)
      .pipe(
        retry(1),
        map(response => response.data),
        catchError(this.handleError('getTasksCreatedByUser'))
      );
  }

  /**
   * Obtener tareas sin asignar
   */
  getUnassignedTasks(): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/unassigned`)
      .pipe(
        retry(1),
        map(response => response.data),
        catchError(this.handleError('getUnassignedTasks'))
      );
  }

  /**
   * Obtener tareas en progreso
   */
  getTasksInProgress(): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/in-progress`)
      .pipe(
        retry(1),
        map(response => response.data),
        catchError(this.handleError('getTasksInProgress'))
      );
  }

  /**
   * Obtener tareas vencidas
   */
  getOverdueTasks(): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/overdue`)
      .pipe(
        retry(1),
        map(response => response.data),
        catchError(this.handleError('getOverdueTasks'))
      );
  }

  /**
   * Obtener tareas de alta prioridad
   */
  getHighPriorityTasks(): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/high-priority`)
      .pipe(
        retry(1),
        map(response => response.data),
        catchError(this.handleError('getHighPriorityTasks'))
      );
  }

  /**
   * Buscar tareas por texto
   */
  searchTasks(query: string): Observable<Task[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/search`, { params })
      .pipe(
        retry(1),
        map(response => response.data),
        catchError(this.handleError('searchTasks'))
      );
  }

  /**
   * Crear una nueva tarea
   */
  createTask(task: TaskRequest): Observable<Task> {
    // Obtener userId de localStorage como fallback si el interceptor no funciona
    const currentUserStr = localStorage.getItem('currentUser');
    let headers = new HttpHeaders();
    
    if (currentUserStr) {
      try {
        const user = JSON.parse(currentUserStr);
        const userId = user?.id ?? user?._id;
        if (userId) {
          headers = headers.set('X-User-Id', String(userId));
          console.log('[TaskService] X-User-Id header añadido manualmente:', String(userId));
        }
      } catch (e) {
        console.error('[TaskService] Error parsing currentUser:', e);
      }
    }

    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}`, task, { headers })
      .pipe(
        map(response => response.data),
        tap(createdTask => this.addTaskToState(createdTask)),
        catchError(this.handleError('createTask'))
      );
  }

  /**
   * Actualizar una tarea existente
   */
  updateTask(id: string | number, task: TaskRequest): Observable<Task> {
    return this.http.put<ApiResponse<Task>>(`${this.apiUrl}/${id}`, task)
      .pipe(
        map(response => response.data),
        tap(updatedTask => this.updateTaskInState(updatedTask)),
        catchError(this.handleError('updateTask'))
      );
  }

  /**
   * Iniciar una tarea (cambiar a IN_PROGRESS)
   */
  startTask(id: string | number): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/${id}/start`, {})
      .pipe(
        map(response => response.data),
        tap(updatedTask => this.updateTaskInState(updatedTask)),
        catchError(this.handleError('startTask'))
      );
  }

  /**
   * Completar una tarea
   */
  completeTask(id: string | number): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/${id}/complete`, {})
      .pipe(
        map(response => response.data),
        tap(updatedTask => this.updateTaskInState(updatedTask)),
        catchError(this.handleError('completeTask'))
      );
  }

  /**
   * Cancelar una tarea
   */
  cancelTask(id: string | number): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/${id}/cancel`, {})
      .pipe(
        map(response => response.data),
        tap(updatedTask => this.updateTaskInState(updatedTask)),
        catchError(this.handleError('cancelTask'))
      );
  }

  /**
   * Marcar una tarea como importante
   */
  markAsImportant(id: string | number): Observable<Task> {
    return this.http.patch<ApiResponse<Task>>(`${this.apiUrl}/${id}`, { important: true })
      .pipe(
        map(response => response.data),
        tap(updatedTask => this.updateTaskInState(updatedTask)),
        catchError(this.handleError('markAsImportant'))
      );
  }

  /**
   * Desmarcar una tarea como importante
   */
  removeImportant(id: string | number): Observable<Task> {
    return this.http.patch<ApiResponse<Task>>(`${this.apiUrl}/${id}`, { important: false })
      .pipe(
        map(response => response.data),
        tap(updatedTask => this.updateTaskInState(updatedTask)),
        catchError(this.handleError('removeImportant'))
      );
  }

  /**
   * Eliminar una tarea
   */
  deleteTask(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => this.removeTaskFromState(id)),
        catchError(this.handleError('deleteTask'))
      );
  }

  /**
   * Subir imagen para una tarea
   */
  uploadTaskImage(taskId: string | number, file: File): Observable<Task> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http
      .put<ApiResponse<Task>>(`${this.apiUrl}/${taskId}/image`, formData)
      .pipe(
        map(response => response.data),
        tap(updatedTask => this.updateTaskInState(updatedTask)),
        catchError(this.handleError('uploadTaskImage'))
      );
  }

  /**
   * Obtener estadísticas de tareas
   */
  getTaskStatistics(): Observable<TaskStatistics> {
    return this.http.get<ApiResponse<TaskStatistics>>(`${this.apiUrl}/statistics`)
      .pipe(
        retry(1),
        map(response => response.data),
        tap(stats => this.statisticsSignal.set(stats)),
        catchError(this.handleError('getTaskStatistics'))
      );
  }

  /**
   * Obtener estadísticas de tareas de un usuario
   */
  getTaskStatisticsByUser(userId: string): Observable<TaskStatistics> {
    return this.http.get<ApiResponse<TaskStatistics>>(`${this.apiUrl}/statistics/user/${userId}`)
      .pipe(
        retry(1),
        map(response => response.data),
        tap(stats => this.statisticsSignal.set(stats)),
        catchError(this.handleError('getTaskStatisticsByUser'))
      );
  }

  /**
   * Actualizar estadísticas (fuerza recarga)
   */
  refreshStatistics(): void {
    this.getTaskStatistics().subscribe();
  }
}
