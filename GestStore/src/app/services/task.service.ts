import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  /**
   * Obtener headers con autenticación y userId
   */
  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('currentUser');
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const userId = user.id || user._id;
        if (userId) {
          headers = headers.set('X-User-Id', String(userId));
        }
      } catch (e) {
      }
    }
    return headers;
  }

  /**
   * Obtener todas las tareas (sin paginación)
   */
  getAllTasks(): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/all`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener una tarea por ID
   */
  getTaskById(id: number): Observable<Task> {
    return this.http.get<ApiResponse<Task>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener tareas asignadas a un usuario
   */
  getTasksByAssignedUser(userId: string): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/user/${userId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener tareas creadas por un usuario
   */
  getTasksCreatedByUser(userId: string): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/created-by/${userId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener tareas sin asignar
   */
  getUnassignedTasks(): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/unassigned`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener tareas en progreso
   */
  getTasksInProgress(): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/in-progress`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener tareas vencidas
   */
  getOverdueTasks(): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/overdue`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener tareas de alta prioridad
   */
  getHighPriorityTasks(): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/high-priority`)
      .pipe(map(response => response.data));
  }

  /**
   * Buscar tareas por texto
   */
  searchTasks(query: string): Observable<Task[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/search`, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Crear una nueva tarea
   */
  createTask(task: TaskRequest): Observable<Task> {
    const headers = this.getAuthHeaders();
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}`, task, { headers })
      .pipe(map(response => response.data));
  }

  /**
   * Actualizar una tarea existente
   */
  updateTask(id: number, task: TaskRequest): Observable<Task> {
    const headers = this.getAuthHeaders();
    return this.http.put<ApiResponse<Task>>(`${this.apiUrl}/${id}`, task, { headers })
      .pipe(map(response => response.data));
  }

  /**
   * Iniciar una tarea (cambiar a IN_PROGRESS)
   */
  startTask(id: number): Observable<Task> {
    const headers = this.getAuthHeaders();
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/${id}/start`, {}, { headers })
      .pipe(map(response => response.data));
  }

  /**
   * Completar una tarea
   */
  completeTask(id: number): Observable<Task> {
    const headers = this.getAuthHeaders();
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/${id}/complete`, {}, { headers })
      .pipe(map(response => response.data));
  }

  /**
   * Cancelar una tarea
   */
  cancelTask(id: number): Observable<Task> {
    const headers = this.getAuthHeaders();
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/${id}/cancel`, {}, { headers })
      .pipe(map(response => response.data));
  }

  /**
   * Marcar una tarea como importante
   */
  markAsImportant(id: number): Observable<Task> {
    const headers = this.getAuthHeaders();
    return this.http.patch<ApiResponse<Task>>(`${this.apiUrl}/${id}`, { important: true }, { headers })
      .pipe(map(response => response.data));
  }

  /**
   * Desmarcar una tarea como importante
   */
  removeImportant(id: number): Observable<Task> {
    const headers = this.getAuthHeaders();
    return this.http.patch<ApiResponse<Task>>(`${this.apiUrl}/${id}`, { important: false }, { headers })
      .pipe(map(response => response.data));
  }

  /**
   * Eliminar una tarea
   */
  deleteTask(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Obtener estadísticas de tareas
   */
  getTaskStatistics(): Observable<TaskStatistics> {
    return this.http.get<ApiResponse<TaskStatistics>>(`${this.apiUrl}/statistics`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener estadísticas de tareas de un usuario
   */
  getTaskStatisticsByUser(userId: string): Observable<TaskStatistics> {
    return this.http.get<ApiResponse<TaskStatistics>>(`${this.apiUrl}/statistics/user/${userId}`)
      .pipe(map(response => response.data));
  }
}
