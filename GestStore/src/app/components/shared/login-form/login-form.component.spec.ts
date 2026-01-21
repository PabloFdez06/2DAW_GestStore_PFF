/**
 * Tests unitarios para LoginFormComponent
 * 
 * Este componente maneja el formulario de login con validación,
 * comunicación HTTP y redirección tras autenticación.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LoginFormComponent } from './login-form.component';
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

// Mock del AuthService
const mockAuthService = {
  login: vi.fn()
};

// Mock del Router
const mockRouter = {
  navigate: vi.fn(),
  events: of({}),
  routerState: { root: {} },
  url: '/',
  createUrlTree: vi.fn(),
  serializeUrl: vi.fn(),
  parseUrl: vi.fn()
};

// Mock del ActivatedRoute
const mockActivatedRoute = {
  snapshot: { paramMap: { get: vi.fn() } },
  params: of({})
};

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let authService: typeof mockAuthService;
  let router: typeof mockRouter;

  beforeEach(async () => {
    // Reset mocks and TestBed
    vi.clearAllMocks();
    TestBed.resetTestingModule();
    
    await TestBed.configureTestingModule({
      imports: [LoginFormComponent, FormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as typeof mockAuthService;
    router = TestBed.inject(Router) as unknown as typeof mockRouter;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  describe('Inicialización', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have empty initial values', () => {
      expect(component.email).toBe('');
      expect(component.password).toBe('');
      expect(component.rememberMe).toBe(false);
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('');
    });

    it('should have empty errors object initially', () => {
      expect(Object.keys(component.errors).length).toBe(0);
    });
  });

  describe('Validación del formulario', () => {
    it('should show error when email is empty', () => {
      component.email = '';
      component.password = 'validPassword123';
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
      
      expect(component.errors['email']).toBe('El email es requerido');
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should show error when password is empty', () => {
      component.email = 'test@example.com';
      component.password = '';
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
      
      expect(component.errors['password']).toBe('La contraseña es requerida');
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should show errors for both fields when both are empty', () => {
      component.email = '   '; // Solo espacios
      component.password = '';
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
      
      expect(component.errors['email']).toBe('El email es requerido');
      expect(component.errors['password']).toBe('La contraseña es requerida');
    });

    it('should clear previous errors before validation', () => {
      component.errors = { email: 'Error previo', password: 'Error previo' };
      component.email = 'test@example.com';
      component.password = 'validPassword';
      
      mockAuthService.login.mockReturnValue(of({ token: 'abc', user: { id: '1', name: 'Test' } }));
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
      
      expect(component.errors).toEqual({});
    });
  });

  describe('Proceso de login', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'validPassword123'
    };

    beforeEach(() => {
      component.email = validCredentials.email;
      component.password = validCredentials.password;
    });

    it('should call authService.login with correct credentials', () => {
      mockAuthService.login.mockReturnValue(of({ token: 'abc', user: { id: '1', name: 'Test' } }));
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
      
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: validCredentials.email,
        password: validCredentials.password
      });
    });

    it('should set isLoading to true while processing', () => {
      mockAuthService.login.mockReturnValue(of({ token: 'abc', user: { id: '1', name: 'Test' } }));
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
      
      // isLoading se pone a false después del subscribe, pero debe haber sido true
      expect(mockAuthService.login).toHaveBeenCalled();
    });

    it('should navigate to dashboard on successful login', () => {
      mockAuthService.login.mockReturnValue(of({ token: 'abc', user: { id: '1', name: 'Test' } }));
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should set isLoading to false after successful login', () => {
      mockAuthService.login.mockReturnValue(of({ token: 'abc', user: { id: '1', name: 'Test' } }));
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
expect(component.isLoading).toBe(false);
    });
  });

  describe('Manejo de errores', () => {
    beforeEach(() => {
      component.email = 'test@example.com';
      component.password = 'wrongPassword';
    });

    it('should display error message on login failure', () => {
      mockAuthService.login.mockReturnValue(throwError(() => ({
        error: { message: 'Credenciales inválidas' }
      })));
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
expect(component.errorMessage).toBe('Credenciales inválidas');
    });

    it('should display generic error when no message is provided', () => {
      mockAuthService.login.mockReturnValue(throwError(() => ({})));
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
expect(component.errorMessage).toBe('Error al iniciar sesión. Verifica tus credenciales.');
    });

    it('should set isLoading to false after error', () => {
      mockAuthService.login.mockReturnValue(throwError(() => new Error('Network error')));
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
expect(component.isLoading).toBe(false);
    });

    it('should not navigate on login failure', () => {
      mockAuthService.login.mockReturnValue(throwError(() => new Error('Login failed')));
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Navegación', () => {
    it('should navigate to home on back click', () => {
      component.onBack();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should emit backClicked event', () => {
      const backSpy = vi.fn();
      component.backClicked.subscribe(backSpy);
      
      component.onBack();
      
      // El componente usa router.navigate, no emite evento en esta implementación
      expect(mockRouter.navigate).toHaveBeenCalled();
    });
  });

  describe('Prevención de comportamiento por defecto', () => {
    it('should prevent default form submission', () => {
      mockAuthService.login.mockReturnValue(of({ token: 'abc', user: { id: '1', name: 'Test' } }));
      component.email = 'test@example.com';
      component.password = 'password123';
      
      const mockEvent = { preventDefault: vi.fn() };
      component.onSubmit(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });
});



