import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Issue, IssueRequest, IssueApiResponse } from '../models/issue.model';

/**
 * Servicio para gestionar las incidencias de inventario
 * 
 * He implementado este servicio siguiendo el patrón de signals que uso en el resto
 * del proyecto. Mantengo un signal con la lista de incidencias que se actualiza
 * automáticamente cuando creo o consulto incidencias.
 * 
 * La comunicación con el backend va a través de /api/issues donde nginx hace proxy
 * al backend en el puerto 8080.
 */
@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private apiUrl = '/api/issues'; // Nginx hace proxy a backend:8080

  // ============================================================================
  // GESTIÓN DE ESTADO CON SIGNALS
  // ============================================================================
  
  // Signal principal que contiene todas las incidencias
  private issuesSignal = signal<Issue[]>([]);
  
  // Signals para el estado de la UI
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  
  // Exponemos los signals como computed para que sean de solo lectura
  readonly issues = computed(() => this.issuesSignal());
  readonly isLoading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  
  // Estadísticas computadas basadas en el estado actual
  readonly highSeverityCount = computed(() => 
    this.issuesSignal().filter(i => i.severity === 'HIGH').length
  );
  
  readonly mediumSeverityCount = computed(() => 
    this.issuesSignal().filter(i => i.severity === 'MEDIUM').length
  );
  
  readonly lowSeverityCount = computed(() => 
    this.issuesSignal().filter(i => i.severity === 'LOW').length
  );

  constructor(private http: HttpClient) {}

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Crea una nueva incidencia
   * Actualiza automáticamente el signal para que los componentes se enteren
   */
  createIssue(issue: IssueRequest): Observable<Issue> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<IssueApiResponse>(`${this.apiUrl}`, issue).pipe(
      tap((response) => {
        // Añado la nueva incidencia al signal
        const newIssue = response.data as Issue;
        const current = this.issuesSignal();
        this.issuesSignal.set([newIssue, ...current]);
        this.loadingSignal.set(false);
      }),
      catchError((error) => this.handleError('createIssue', error)),
      // Extraigo solo el data de la respuesta
      map((response) => response.data as Issue)
    );
  }

  /**
   * Obtiene todas las incidencias del sistema
   * Solo accesible para ADMIN y MANAGER
   */
  getIssues(): Observable<Issue[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<IssueApiResponse>(`${this.apiUrl}`).pipe(
      tap((response) => {
        // Actualizo el signal con todas las incidencias
        const issues = response.data as Issue[];
        this.issuesSignal.set(issues);
        this.loadingSignal.set(false);
      }),
      catchError((error) => this.handleError('getIssues', error)),
      // Extraigo solo el array de issues
      map((response) => response.data as Issue[])
    );
  }

  /**
   * Obtiene una incidencia específica por ID
   */
  getIssueById(id: string): Observable<Issue> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<IssueApiResponse>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadingSignal.set(false)),
      catchError((error) => this.handleError('getIssueById', error)),
      map((response) => response.data as Issue)
    );
  }

  /**
   * Obtiene las incidencias reportadas por el usuario actual
   */
  getMyIssues(): Observable<Issue[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<IssueApiResponse>(`${this.apiUrl}/my-issues`).pipe(
      tap((response) => {
        // Actualizo el signal con mis incidencias
        const myIssues = response.data as Issue[];
        this.issuesSignal.set(myIssues);
        this.loadingSignal.set(false);
      }),
      catchError((error) => this.handleError('getMyIssues', error)),
      map((response) => response.data as Issue[])
    );
  }

  /**
   * Limpia el estado del servicio
   * Útil cuando el usuario hace logout o cambia de vista
   */
  clearState(): void {
    this.issuesSignal.set([]);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
  }

  // ============================================================================
  // MANEJO DE ERRORES
  // ============================================================================

  private handleError(operation: string, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    this.errorSignal.set(errorMessage);
    this.loadingSignal.set(false);
    
    console.error(`Error en ${operation}:`, error);
    return throwError(() => error);
  }
}
