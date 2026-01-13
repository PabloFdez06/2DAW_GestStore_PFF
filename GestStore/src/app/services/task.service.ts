import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  getTasksByAssignedUser(userId: number): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/user/${userId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener tareas creadas por un usuario
   */
  getTasksCreatedByUser(userId: number): Observable<Task[]> {
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
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}`, task)
      .pipe(map(response => response.data));
  }

  /**
   * Actualizar una tarea existente
   */
  updateTask(id: number, task: TaskRequest): Observable<Task> {
    return this.http.put<ApiResponse<Task>>(`${this.apiUrl}/${id}`, task)
      .pipe(map(response => response.data));
  }

  /**
   * Iniciar una tarea (cambiar a IN_PROGRESS)
   */
  startTask(id: number): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/${id}/start`, {})
      .pipe(map(response => response.data));
  }

  /**
   * Completar una tarea
   */
  completeTask(id: number): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/${id}/complete`, {})
      .pipe(map(response => response.data));
  }

  /**
   * Cancelar una tarea
   */
  cancelTask(id: number): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/${id}/cancel`, {})
      .pipe(map(response => response.data));
  }

  /**
   * Obtener estadísticas de tareas
   */
  getTaskStatistics(): Observable<TaskStatistics> {
    return this.http.get<ApiResponse<TaskStatistics>>(`${this.apiUrl}/statistics`)
      .pipe(map(response => response.data));
  }
}
