/**
 * Tests unitarios para AuthService
 * 
 * Este servicio gestiona la autenticación con:
 * - Login y registro
 * - Almacenamiento de token y usuario en localStorage
 * - BehaviorSubject para estado reactivo
 */
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../models/auth.model';

// Mock del Router
const mockRouter = {
  navigate: vi.fn()
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: typeof mockRouter;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    role: 'USER',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockAuthResponse: AuthResponse = {
    token: 'jwt-token-abc123',
    type: 'Bearer',
    user: mockUser
  };

  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as unknown as typeof mockRouter;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Inicialización', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have null user initially when localStorage is empty', () => {
      expect(service.currentUserValue).toBeNull();
    });

    it('should load user from localStorage if present', () => {
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      
      // Recrear el servicio para que lea del localStorage
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: Router, useValue: mockRouter }
        ]
      });
      
      const newService = TestBed.inject(AuthService);
      expect(newService.currentUserValue).toEqual(mockUser);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token or user', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when only token exists', () => {
      localStorage.setItem('token', 'some-token');
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when both token and user exist', () => {
      localStorage.setItem('token', 'some-token');
      service.setCurrentUser(mockUser);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('token getter', () => {
    it('should return null when no token', () => {
      expect(service.token).toBeNull();
    });

    it('should return token from localStorage', () => {
      localStorage.setItem('token', 'my-jwt-token');
      expect(service.token).toBe('my-jwt-token');
    });
  });

  describe('login', () => {
    it('should call API with credentials', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush({ data: mockAuthResponse });
      });

    it('should store token in localStorage on success', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({ data: mockAuthResponse });
      expect(localStorage.getItem('token')).toBe('jwt-token-abc123');
    });

    it('should store user in localStorage on success', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({ data: mockAuthResponse });
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      expect(storedUser.email).toBe('test@example.com');
    });

    it('should update currentUser observable on success', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({ data: mockAuthResponse });
      expect(service.currentUserValue).toEqual(mockUser);
    });

    it('should store avatar separately for quick access', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({ data: mockAuthResponse });
      expect(localStorage.getItem('geststore.avatar')).toBe(mockUser.avatar);
    });

    it('should not store avatar if empty', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      const responseNoAvatar = {
        token: 'jwt-token',
        user: { ...mockUser, avatar: '' }
      };

      service.login(credentials).subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({ data: responseNoAvatar });
      expect(localStorage.getItem('geststore.avatar')).toBeNull();
    });
  });

  describe('register', () => {
    it('should call API with registration data', () => {
      const registerData: RegisterRequest = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User'
      };

      service.register(registerData).subscribe();

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush({ data: mockAuthResponse });
      });

    it('should store token and user on successful registration', () => {
      const registerData: RegisterRequest = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User'
      };

      service.register(registerData).subscribe();

      const req = httpMock.expectOne('/api/auth/register');
      req.flush({ data: mockAuthResponse });
      expect(localStorage.getItem('token')).toBe('jwt-token-abc123');
      expect(service.currentUserValue).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      // Simular usuario logueado
      localStorage.setItem('token', 'some-token');
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      localStorage.setItem('geststore.avatar', 'avatar.jpg');
      service.setCurrentUser(mockUser);
    });

    it('should remove token from localStorage', () => {
      service.logout();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should remove currentUser from localStorage', () => {
      service.logout();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    it('should remove avatar from localStorage', () => {
      service.logout();
      expect(localStorage.getItem('geststore.avatar')).toBeNull();
    });

    it('should set currentUserValue to null', () => {
      service.logout();
      expect(service.currentUserValue).toBeNull();
    });

    it('should navigate to login page', () => {
      service.logout();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('setCurrentUser', () => {
    it('should update currentUser observable', () => {
      service.setCurrentUser(mockUser);
      expect(service.currentUserValue).toEqual(mockUser);
    });

    it('should persist user to localStorage', () => {
      service.setCurrentUser(mockUser);
      const stored = JSON.parse(localStorage.getItem('currentUser') || '{}');
      expect(stored).toEqual(mockUser);
    });

    it('should update avatar in localStorage when present', () => {
      service.setCurrentUser(mockUser);
      expect(localStorage.getItem('geststore.avatar')).toBe(mockUser.avatar);
    });

    it('should remove avatar from localStorage when empty', () => {
      localStorage.setItem('geststore.avatar', 'old-avatar.jpg');
      service.setCurrentUser({ ...mockUser, avatar: '' });
      expect(localStorage.getItem('geststore.avatar')).toBeNull();
    });
  });

  describe('currentUser observable', () => {
    it('should emit user changes to subscribers', () => {
      return new Promise<void>((resolve) => {
        const emissions: (User | null)[] = [];
        
        service.currentUser.subscribe(user => {
          emissions.push(user);
          if (emissions.length === 2) {
            expect(emissions[0]).toBeNull();
            expect(emissions[1]).toEqual(mockUser);
            resolve();
          }
        });

        service.setCurrentUser(mockUser);
      });
    });
  });
});


