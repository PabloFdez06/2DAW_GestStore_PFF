import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { 
  Task, 
  TaskRequest, 
  ApiResponse, 
  TaskStatistics 
} from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = '/api/tasks'; // Nginx hará proxy a backend:8080

  constructor(private http: HttpClient) {}

  private handleError(_operation: string) {
    return (error: unknown) => {
      return throwError(() => error);
    };
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
        catchError(this.handleError('removeImportant'))
      );
  }

  /**
   * Eliminar una tarea
   */
  deleteTask(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError('deleteTask')));
  }

  /**
   * Obtener estadísticas de tareas
   */
  getTaskStatistics(): Observable<TaskStatistics> {
    return this.http.get<ApiResponse<TaskStatistics>>(`${this.apiUrl}/statistics`)
      .pipe(
        retry(1),
        map(response => response.data),
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
        catchError(this.handleError('getTaskStatisticsByUser'))
      );
  }
}
