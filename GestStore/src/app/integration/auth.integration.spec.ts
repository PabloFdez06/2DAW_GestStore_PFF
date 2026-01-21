/**
 * Tests de integración para el flujo de autenticación
 * 
 * Estos tests verifican el flujo completo de:
 * - Login con validación de formulario
 * - Registro de nuevo usuario
 * - Redirección post-autenticación
 * - Manejo de errores
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { LoginFormComponent } from '../components/shared/login-form/login-form.component';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

describe('Auth Integration Tests', () => {
  let fixture: ComponentFixture<LoginFormComponent>;
  let component: LoginFormComponent;
  let httpMock: HttpTestingController;
  let router: Router;
  let authService: AuthService;

  const mockAuthResponse = {
    data: {
      token: 'jwt-token-integration-test',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: ''
      }
    }
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LoginFormComponent, FormsModule],
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'dashboard', component: LoginFormComponent },
          { path: 'login', component: LoginFormComponent },
          { path: '', component: LoginFormComponent }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Login Flow Integration', () => {
    it('should complete full login flow successfully', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      
      // Rellenar formulario
      component.email = 'test@example.com';
      component.password = 'password123';
      fixture.detectChanges();
      
      // Enviar formulario
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
      
      // Verificar estado de carga
      expect(component.isLoading).toBe(true);
      
      // Responder petición HTTP
      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'test@example.com',
        password: 'password123'
      });
      req.flush(mockAuthResponse);
// Verificar resultado
      expect(component.isLoading).toBe(false);
      expect(localStorage.getItem('token')).toBe('jwt-token-integration-test');
      expect(authService.isAuthenticated()).toBe(true);
      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should handle login error and display message', () => {
      component.email = 'wrong@example.com';
      component.password = 'wrongpassword';
      fixture.detectChanges();
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
      
      const req = httpMock.expectOne('/api/auth/login');
      req.flush(
        { message: 'Credenciales incorrectas' },
        { status: 401, statusText: 'Unauthorized' }
      );
      
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toContain('Credenciales incorrectas');
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should prevent form submission with empty fields', () => {
      component.email = '';
      component.password = '';
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
      
      expect(component.errors['email']).toBe('El email es requerido');
      expect(component.errors['password']).toBe('La contraseña es requerida');
      
      // No debe hacer petición HTTP
      httpMock.expectNone('/api/auth/login');
    });

    it('should validate email field is not just whitespace', () => {
      component.email = '   ';
      component.password = 'password123';
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
      
      expect(component.errors['email']).toBe('El email es requerido');
      httpMock.expectNone('/api/auth/login');
    });
  });

  describe('Auth State Integration', () => {
    it('should persist auth state across service instances', () => {
      // Login
      component.email = 'test@example.com';
      component.password = 'password123';
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
      
      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockAuthResponse);
// Verificar persistencia
      expect(localStorage.getItem('token')).toBe('jwt-token-integration-test');
      expect(localStorage.getItem('currentUser')).toBeTruthy();
      
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      expect(storedUser.email).toBe('test@example.com');
    });

    it('should update currentUser observable on login', () => {
      let emittedUser: unknown = null;
      authService.currentUser.subscribe(user => {
        emittedUser = user;
      });
      
      component.email = 'test@example.com';
      component.password = 'password123';
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
      
      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockAuthResponse);
expect(emittedUser).toBeTruthy();
      expect((emittedUser as { email: string }).email).toBe('test@example.com');
    });
  });

  describe('Form Validation Integration', () => {
    it('should clear errors before new validation attempt', () => {
      // Primera validación fallida
      component.email = '';
      component.password = '';
      component.onSubmit({ preventDefault: vi.fn() });
      
      expect(Object.keys(component.errors).length).toBe(2);
      
      // Segunda validación con datos válidos
      component.email = 'valid@example.com';
      component.password = 'validpassword';
      component.onSubmit({ preventDefault: vi.fn() });
      
      // Los errores deben haberse limpiado
      expect(component.errors['email']).toBeUndefined();
      expect(component.errors['password']).toBeUndefined();
      
      // Completar la petición para evitar error de verify
      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockAuthResponse);
    });

    it('should clear error message on new submission', () => {
      component.errorMessage = 'Previous error';
      component.email = 'test@example.com';
      component.password = 'password123';
      
      component.onSubmit({ preventDefault: vi.fn() });
      
      expect(component.errorMessage).toBe('');
      
      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockAuthResponse);
});
  });

  describe('Navigation Integration', () => {
    it('should navigate to home on back click', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      
      component.onBack();
      
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });
});


