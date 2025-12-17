import { Injectable, signal, effect, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

/**
 * ThemeService - Servicio para gestionar el tema de la aplicación
 * 
 * Funcionalidades:
 * - Detecta la preferencia del sistema (prefers-color-scheme)
 * - Permite alternar entre tema claro y oscuro
 * - Persiste la preferencia del usuario en localStorage
 * - Aplica el tema al cargar la aplicación
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'geststore-theme';
  private readonly isBrowser: boolean;
  
  // Signal reactivo para el tema actual
  currentTheme = signal<Theme>('light');
  
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      // Inicializar tema al cargar el servicio
      this.initializeTheme();
      
      // Escuchar cambios en la preferencia del sistema
      this.listenToSystemPreference();
    }
    
    // Effect para aplicar el tema cuando cambie
    effect(() => {
      const theme = this.currentTheme();
      if (this.isBrowser) {
        this.applyTheme(theme);
        this.saveThemeToStorage(theme);
      }
    });
  }
  
  /**
   * Inicializa el tema basándose en:
   * 1. Preferencia guardada en localStorage
   * 2. Preferencia del sistema operativo
   * 3. Tema claro por defecto
   */
  private initializeTheme(): void {
    const savedTheme = this.getThemeFromStorage();
    
    if (savedTheme) {
      this.currentTheme.set(savedTheme);
    } else {
      const systemTheme = this.getSystemPreference();
      this.currentTheme.set(systemTheme);
    }
  }
  
  /**
   * Obtiene la preferencia del sistema usando prefers-color-scheme
   */
  private getSystemPreference(): Theme {
    if (this.isBrowser && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  
  /**
   * Escucha cambios en la preferencia del sistema
   * Solo aplica si el usuario no ha guardado una preferencia manual
   */
  private listenToSystemPreference(): void {
    if (this.isBrowser && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (event: MediaQueryListEvent) => {
        // Solo actualizar si no hay preferencia guardada
        if (!this.getThemeFromStorage()) {
          this.currentTheme.set(event.matches ? 'dark' : 'light');
        }
      });
    }
  }
  
  /**
   * Aplica el tema al documento HTML mediante data-theme
   */
  private applyTheme(theme: Theme): void {
    if (this.isBrowser) {
      document.documentElement.setAttribute('data-theme', theme);
      
      // También actualizar meta theme-color para móviles
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#353535' : '#E5D5FF');
      }
    }
  }
  
  /**
   * Guarda la preferencia del tema en localStorage
   */
  private saveThemeToStorage(theme: Theme): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.STORAGE_KEY, theme);
      } catch (error) {
        console.warn('No se pudo guardar el tema en localStorage:', error);
      }
    }
  }
  
  /**
   * Obtiene el tema guardado en localStorage
   */
  private getThemeFromStorage(): Theme | null {
    if (this.isBrowser) {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
          return stored;
        }
      } catch (error) {
        console.warn('No se pudo leer el tema de localStorage:', error);
      }
    }
    return null;
  }
  
  /**
   * Alterna entre tema claro y oscuro
   */
  toggleTheme(): void {
    this.currentTheme.update(current => current === 'light' ? 'dark' : 'light');
  }
  
  /**
   * Establece un tema específico
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }
  
  /**
   * Indica si el tema actual es oscuro
   */
  isDarkMode(): boolean {
    return this.currentTheme() === 'dark';
  }
  
  /**
   * Restablece a la preferencia del sistema
   */
  resetToSystemPreference(): void {
    if (this.isBrowser) {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch (error) {
        console.warn('No se pudo eliminar el tema de localStorage:', error);
      }
    }
    this.currentTheme.set(this.getSystemPreference());
  }
}
