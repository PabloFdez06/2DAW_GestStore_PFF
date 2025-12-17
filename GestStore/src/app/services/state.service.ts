import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, map } from 'rxjs';

/**
 * StateService - Servicio de gestión de estado global
 * 
 * Implementa un store centralizado para datos compartidos entre componentes.
 * Utiliza Signals de Angular para reactividad eficiente y BehaviorSubject
 * para compatibilidad con RxJS.
 * 
 * Características:
 * - Estado tipado con interfaz genérica
 * - Selectores para acceder a porciones del estado
 * - Historial de cambios (opcional)
 * - Persistencia en localStorage (opcional)
 * - Integración con Signals y Observables
 * 
 * Uso básico:
 * ```typescript
 * // Actualizar estado
 * stateService.setState({ user: { name: 'John' } });
 * 
 * // Leer estado
 * const user = stateService.select(state => state.user);
 * 
 * // Con Signals
 * const userName = computed(() => stateService.state().user?.name);
 * ```
 */

// Interfaz base del estado de la aplicación
export interface AppState {
  // Estado de usuario
  user: UserState | null;
  
  // Estado de UI
  ui: UIState;
  
  // Estado de datos (genérico, extender según necesidades)
  data: DataState;
  
  // Preferencias
  preferences: PreferencesState;
}

export interface UserState {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  roles: string[];
  isAuthenticated: boolean;
}

export interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeModal: string | null;
  breadcrumbs: BreadcrumbItem[];
  pageTitle: string;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

export interface DataState {
  // Cache de datos genérico
  cache: Record<string, unknown>;
  // Timestamps de última actualización
  lastUpdated: Record<string, number>;
}

export interface PreferencesState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  itemsPerPage: number;
  notifications: boolean;
}

// Estado inicial
const initialState: AppState = {
  user: null,
  ui: {
    sidebarOpen: true,
    sidebarCollapsed: false,
    activeModal: null,
    breadcrumbs: [],
    pageTitle: ''
  },
  data: {
    cache: {},
    lastUpdated: {}
  },
  preferences: {
    theme: 'system',
    language: 'es',
    itemsPerPage: 10,
    notifications: true
  }
};

@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Estado principal usando Signal
  private _state = signal<AppState>(this.loadInitialState());
  
  // BehaviorSubject para compatibilidad con RxJS
  private state$ = new BehaviorSubject<AppState>(this._state());
  
  // Historial de estados (para debugging/undo)
  private stateHistory: AppState[] = [];
  private readonly maxHistorySize = 50;
  private historyEnabled = false;
  
  // Clave para localStorage
  private readonly storageKey = 'geststore_app_state';
  private persistenceEnabled = false;
  
  // ============================================
  // Acceso al estado
  // ============================================
  
  /** Signal del estado completo */
  readonly state = this._state.asReadonly();
  
  /** Observable del estado completo */
  readonly stateObservable$: Observable<AppState> = this.state$.asObservable();
  
  // ============================================
  // Selectores con Signals (computados)
  // ============================================
  
  /** Usuario actual */
  readonly user = computed(() => this._state().user);
  
  /** Estado de autenticación */
  readonly isAuthenticated = computed(() => this._state().user?.isAuthenticated ?? false);
  
  /** Estado de UI */
  readonly ui = computed(() => this._state().ui);
  
  /** Sidebar abierto */
  readonly sidebarOpen = computed(() => this._state().ui.sidebarOpen);
  
  /** Modal activo */
  readonly activeModal = computed(() => this._state().ui.activeModal);
  
  /** Preferencias */
  readonly preferences = computed(() => this._state().preferences);
  
  /** Tema actual */
  readonly theme = computed(() => this._state().preferences.theme);
  
  // ============================================
  // Métodos de actualización del estado
  // ============================================
  
  /**
   * Actualiza el estado con un objeto parcial
   * @param partialState - Estado parcial a fusionar
   */
  setState(partialState: Partial<AppState>): void {
    const currentState = this._state();
    const newState = this.deepMerge(currentState, partialState);
    
    this.updateState(newState);
  }
  
  /**
   * Actualiza el estado usando una función
   * @param updateFn - Función que recibe el estado actual y retorna el nuevo
   */
  updateState(newStateOrFn: AppState | ((state: AppState) => AppState)): void {
    const currentState = this._state();
    const newState = typeof newStateOrFn === 'function' 
      ? newStateOrFn(currentState) 
      : newStateOrFn;
    
    if (this.historyEnabled) {
      this.addToHistory(currentState);
    }
    
    this._state.set(newState);
    this.state$.next(newState);
    
    if (this.persistenceEnabled) {
      this.saveToStorage(newState);
    }
  }
  
  /**
   * Resetea el estado a los valores iniciales
   */
  resetState(): void {
    this.updateState({ ...initialState });
  }
  
  /**
   * Resetea una sección específica del estado
   */
  resetSection<K extends keyof AppState>(section: K): void {
    this.setState({ [section]: initialState[section] } as Partial<AppState>);
  }
  
  // ============================================
  // Selectores con Observable
  // ============================================
  
  /**
   * Selecciona una porción del estado como Observable
   * @param selector - Función que selecciona la porción deseada
   */
  select<R>(selector: (state: AppState) => R): Observable<R> {
    return this.state$.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }
  
  /**
   * Obtiene el valor actual de una porción del estado
   * @param selector - Función selectora
   */
  selectSnapshot<R>(selector: (state: AppState) => R): R {
    return selector(this._state());
  }
  
  // ============================================
  // Métodos específicos de UI
  // ============================================
  
  toggleSidebar(): void {
    this.setState({
      ui: {
        ...this._state().ui,
        sidebarOpen: !this._state().ui.sidebarOpen
      }
    });
  }
  
  setSidebarCollapsed(collapsed: boolean): void {
    this.setState({
      ui: {
        ...this._state().ui,
        sidebarCollapsed: collapsed
      }
    });
  }
  
  setActiveModal(modalId: string | null): void {
    this.setState({
      ui: {
        ...this._state().ui,
        activeModal: modalId
      }
    });
  }
  
  setBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
    this.setState({
      ui: {
        ...this._state().ui,
        breadcrumbs
      }
    });
  }
  
  setPageTitle(title: string): void {
    this.setState({
      ui: {
        ...this._state().ui,
        pageTitle: title
      }
    });
  }
  
  // ============================================
  // Métodos específicos de Usuario
  // ============================================
  
  setUser(user: UserState): void {
    this.setState({ user });
  }
  
  clearUser(): void {
    this.setState({ user: null });
  }
  
  updateUserProfile(profile: Partial<UserState>): void {
    const currentUser = this._state().user;
    if (currentUser) {
      this.setState({
        user: { ...currentUser, ...profile }
      });
    }
  }
  
  // ============================================
  // Métodos de preferencias
  // ============================================
  
  setPreference<K extends keyof PreferencesState>(
    key: K, 
    value: PreferencesState[K]
  ): void {
    this.setState({
      preferences: {
        ...this._state().preferences,
        [key]: value
      }
    });
  }
  
  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.setPreference('theme', theme);
  }
  
  // ============================================
  // Métodos de caché de datos
  // ============================================
  
  /**
   * Guarda datos en el caché
   */
  setCacheData<T>(key: string, data: T): void {
    this.setState({
      data: {
        ...this._state().data,
        cache: {
          ...this._state().data.cache,
          [key]: data
        },
        lastUpdated: {
          ...this._state().data.lastUpdated,
          [key]: Date.now()
        }
      }
    });
  }
  
  /**
   * Obtiene datos del caché
   */
  getCacheData<T>(key: string): T | undefined {
    return this._state().data.cache[key] as T | undefined;
  }
  
  /**
   * Verifica si el caché está fresco
   * @param key - Clave del caché
   * @param maxAge - Edad máxima en milisegundos
   */
  isCacheFresh(key: string, maxAge: number): boolean {
    const lastUpdated = this._state().data.lastUpdated[key];
    if (!lastUpdated) return false;
    return Date.now() - lastUpdated < maxAge;
  }
  
  /**
   * Limpia el caché
   */
  clearCache(key?: string): void {
    if (key) {
      const { [key]: _, ...remainingCache } = this._state().data.cache;
      const { [key]: __, ...remainingTimestamps } = this._state().data.lastUpdated;
      this.setState({
        data: {
          cache: remainingCache,
          lastUpdated: remainingTimestamps
        }
      });
    } else {
      this.setState({
        data: {
          cache: {},
          lastUpdated: {}
        }
      });
    }
  }
  
  // ============================================
  // Persistencia
  // ============================================
  
  enablePersistence(): void {
    this.persistenceEnabled = true;
    this.saveToStorage(this._state());
  }
  
  disablePersistence(): void {
    this.persistenceEnabled = false;
  }
  
  private loadInitialState(): AppState {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return this.deepMerge(initialState, parsed);
      }
    } catch (e) {
      console.warn('Error loading state from localStorage:', e);
    }
    return { ...initialState };
  }
  
  private saveToStorage(state: AppState): void {
    try {
      // Solo persistir ciertas partes del estado
      const toPersist = {
        preferences: state.preferences,
        ui: {
          sidebarCollapsed: state.ui.sidebarCollapsed
        }
      };
      localStorage.setItem(this.storageKey, JSON.stringify(toPersist));
    } catch (e) {
      console.warn('Error saving state to localStorage:', e);
    }
  }
  
  // ============================================
  // Historial (para debugging/undo)
  // ============================================
  
  enableHistory(): void {
    this.historyEnabled = true;
  }
  
  disableHistory(): void {
    this.historyEnabled = false;
  }
  
  getHistory(): AppState[] {
    return [...this.stateHistory];
  }
  
  undo(): boolean {
    if (this.stateHistory.length > 0) {
      const previousState = this.stateHistory.pop()!;
      this._state.set(previousState);
      this.state$.next(previousState);
      return true;
    }
    return false;
  }
  
  private addToHistory(state: AppState): void {
    this.stateHistory.push(state);
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }
  
  // ============================================
  // Utilidades
  // ============================================
  
  private deepMerge<T extends object>(target: T, source: Partial<T>): T {
    const output = { ...target };
    
    for (const key of Object.keys(source) as (keyof T)[]) {
      const sourceValue = source[key];
      const targetValue = target[key];
      
      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        output[key] = this.deepMerge(
          targetValue as object, 
          sourceValue as object
        ) as T[keyof T];
      } else if (sourceValue !== undefined) {
        output[key] = sourceValue as T[keyof T];
      }
    }
    
    return output;
  }
}
