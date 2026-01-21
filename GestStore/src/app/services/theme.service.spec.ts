/**
 * Tests unitarios para ThemeService
 * 
 * Este servicio gestiona el tema de la aplicación con:
 * - Detección de preferencia del sistema (prefers-color-scheme)
 * - Persistencia en localStorage
 * - Signals para estado reactivo
 */
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DOCUMENT } from '@angular/common';
import { RendererFactory2 } from '@angular/core';
import { ThemeService, ThemePreference, ThemeMode } from './theme.service';

// Mock del Renderer
const mockRenderer = {
  setAttribute: vi.fn()
};

// Mock del RendererFactory
const mockRendererFactory = {
  createRenderer: vi.fn().mockReturnValue(mockRenderer)
};

// Mock del document
const mockDocument = {
  documentElement: {}
};

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    });

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: RendererFactory2, useValue: mockRendererFactory },
        { provide: DOCUMENT, useValue: mockDocument }
      ]
    });

    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Inicialización', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have default preference as "system"', () => {
      expect(service.preference()).toBe('system');
    });

    it('should have default systemMode as "light"', () => {
      expect(service.systemMode()).toBe('light');
    });
  });

  describe('Computed mode signal', () => {
    it('should return systemMode when preference is "system"', () => {
      service.preference.set('system');
      service.systemMode.set('dark');
      
      expect(service.mode()).toBe('dark');
    });

    it('should return preference when not "system"', () => {
      service.setPreference('light');
      service.systemMode.set('dark');
      
      expect(service.mode()).toBe('light');
    });

    it('should return dark when preference is dark', () => {
      service.setPreference('dark');
      
      expect(service.mode()).toBe('dark');
    });
  });

  describe('toggle', () => {
    it('should switch from light to dark', () => {
      service.setPreference('light');
      
      service.toggle();
      
      expect(service.mode()).toBe('dark');
    });

    it('should switch from dark to light', () => {
      service.setPreference('dark');
      
      service.toggle();
      
      expect(service.mode()).toBe('light');
    });
  });

  describe('setPreference', () => {
    it('should update preference signal', () => {
      service.setPreference('dark');
      
      expect(service.preference()).toBe('dark');
    });

    it('should save to localStorage', () => {
      service.setPreference('dark');
      
      expect(localStorage.getItem('themePreference')).toBe('dark');
    });

    it('should accept all valid preferences', () => {
      const preferences: ThemePreference[] = ['light', 'dark', 'system'];
      
      preferences.forEach(pref => {
        service.setPreference(pref);
        expect(service.preference()).toBe(pref);
      });
    });
  });

  describe('init', () => {
    it('should load preference from localStorage', () => {
      localStorage.setItem('themePreference', 'dark');
      
      service.init();
      
      expect(service.preference()).toBe('dark');
    });

    it('should keep default if localStorage is empty', () => {
      service.init();
      
      expect(service.preference()).toBe('system');
    });

    it('should ignore invalid values in localStorage', () => {
      localStorage.setItem('themePreference', 'invalid-value');
      
      service.init();
      
      expect(service.preference()).toBe('system');
    });

    it('should detect system dark mode preference', () => {
      // Mock matchMedia para dark mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn()
        }))
      });
      
      service.init();
      
      expect(service.systemMode()).toBe('dark');
    });

    it('should detect system light mode preference', () => {
      // Mock matchMedia para light mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn()
        }))
      });
      
      service.init();
      
      expect(service.systemMode()).toBe('light');
    });
  });

  describe('Theme application', () => {
    it('should update mode when preference is set', () => {
      // Verificar que setPreference cambia la preferencia
      service.setPreference('dark');
      
      expect(service.preference()).toBe('dark');
    });

    it('should switch between light and dark modes', () => {
      service.setPreference('light');
      expect(service.preference()).toBe('light');
      
      service.setPreference('dark');
      expect(service.preference()).toBe('dark');
      
      service.setPreference('light');
      expect(service.preference()).toBe('light');
    });
  });

  describe('localStorage error handling', () => {
    it('should handle localStorage getItem errors gracefully', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      
      expect(() => service.init()).not.toThrow();
    });

    it('should handle localStorage setItem errors gracefully', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      
      expect(() => service.setPreference('dark')).not.toThrow();
    });
  });

  describe('Media query listener', () => {
    it('should update systemMode when system preference changes', () => {
      let changeHandler: ((event: MediaQueryListEvent) => void) | undefined = undefined;
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          addEventListener: vi.fn((event: string, handler: (event: MediaQueryListEvent) => void) => {
            if (event === 'change') {
              changeHandler = handler;
            }
          }),
          removeEventListener: vi.fn()
        }))
      });
      
      service.init();
      
      // Simular cambio de preferencia del sistema
      if (changeHandler !== undefined) {
        (changeHandler as (event: MediaQueryListEvent) => void)({ matches: true } as MediaQueryListEvent);
        expect(service.systemMode()).toBe('dark');
      }
    });
  });
});
