import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ApiAuthResponse,
  User 
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Cargar usuario del localStorage si existe
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  /**
   * Obtener el valor actual del usuario
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtener el token almacenado
   */
  public get token(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verificar si el usuario está autenticado
   */
  public isAuthenticated(): boolean {
    return !!this.token && !!this.currentUserValue;
  }

  /**
   * Login de usuario
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<ApiAuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map(response => response.data),
        tap(authResponse => {
          // Guardar token y usuario en localStorage
          localStorage.setItem('token', authResponse.token);
          localStorage.setItem('currentUser', JSON.stringify(authResponse.user));
          // Guardar avatar para acceso rápido
          if (authResponse.user.avatar && authResponse.user.avatar.trim().length > 0) {
            localStorage.setItem('geststore.avatar', authResponse.user.avatar);
          } else {
            localStorage.removeItem('geststore.avatar');
          }
          this.currentUserSubject.next(authResponse.user);
        })
      );
  }

  /**
   * Registro de nuevo usuario
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<ApiAuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(
        map(response => response.data),
        tap(authResponse => {
          // Guardar token y usuario en localStorage
          localStorage.setItem('token', authResponse.token);
          localStorage.setItem('currentUser', JSON.stringify(authResponse.user));
          // Guardar avatar para acceso rápido (normalmente vacío al registrarse)
          if (authResponse.user.avatar && authResponse.user.avatar.trim().length > 0) {
            localStorage.setItem('geststore.avatar', authResponse.user.avatar);
          } else {
            localStorage.removeItem('geststore.avatar');
          }
          this.currentUserSubject.next(authResponse.user);
        })
      );
  }

  /**
   * Logout de usuario
   */
  logout(): void {
    // Eliminar datos del localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('geststore.avatar');
    this.currentUserSubject.next(null);
    
    // Redirigir al login
    this.router.navigate(['/login']);
  }

  /**
   * Actualiza el usuario actual (perfil editado) y persiste en localStorage.
   */
  setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Actualizar avatar para acceso rápido
    if (user.avatar && user.avatar.trim().length > 0) {
      localStorage.setItem('geststore.avatar', user.avatar);
    } else {
      localStorage.removeItem('geststore.avatar');
    }
    this.currentUserSubject.next(user);
  }
}
