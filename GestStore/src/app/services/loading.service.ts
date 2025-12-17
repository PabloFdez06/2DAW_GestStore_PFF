import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Interfaz para el estado de carga
 */
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

/**
 * LoadingService - Servicio para gestionar estados de carga
 * 
 * Proporciona gestión centralizada de estados de carga tanto globales
 * como locales (por clave específica).
 * 
 * Características:
 * - Loading global para operaciones que afectan a toda la app
 * - Loading local por clave para componentes específicos
 * - Contador de operaciones para evitar parpadeos
 * - Mensaje personalizable durante la carga
 * - Exposición mediante Signals y Observables
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Estado de carga global
  private globalLoadingCount = signal(0);
  private globalMessage = signal<string | undefined>(undefined);
  
  // BehaviorSubject para compatibilidad con Observable
  private globalLoading$ = new BehaviorSubject<LoadingState>({ isLoading: false });
  
  // Map para estados de carga locales (por clave)
  private localLoadingMap = signal<Map<string, LoadingState>>(new Map());
  
  // Computed para el estado global
  readonly isGlobalLoading = computed(() => this.globalLoadingCount() > 0);
  readonly globalLoadingMessage = computed(() => this.globalMessage());
  
  // Observable para suscripciones
  readonly loading$: Observable<LoadingState> = this.globalLoading$.asObservable();

  /**
   * Inicia una operación de carga global
   * @param message Mensaje opcional a mostrar durante la carga
   * @returns Función para finalizar esta operación específica
   */
  startGlobalLoading(message?: string): () => void {
    this.globalLoadingCount.update(count => count + 1);
    if (message) {
      this.globalMessage.set(message);
    }
    this.updateGlobalSubject();
    
    // Retorna una función para finalizar esta operación específica
    let finished = false;
    return () => {
      if (!finished) {
        finished = true;
        this.stopGlobalLoading();
      }
    };
  }

  /**
   * Finaliza una operación de carga global
   */
  stopGlobalLoading(): void {
    this.globalLoadingCount.update(count => Math.max(0, count - 1));
    if (this.globalLoadingCount() === 0) {
      this.globalMessage.set(undefined);
    }
    this.updateGlobalSubject();
  }

  /**
   * Fuerza la finalización de todas las operaciones globales
   */
  forceStopAllGlobal(): void {
    this.globalLoadingCount.set(0);
    this.globalMessage.set(undefined);
    this.updateGlobalSubject();
  }

  /**
   * Actualiza el mensaje de carga global
   */
  setGlobalMessage(message: string | undefined): void {
    this.globalMessage.set(message);
    this.updateGlobalSubject();
  }

  /**
   * Inicia una operación de carga local
   * @param key Identificador único para esta operación
   * @param message Mensaje opcional
   */
  startLocalLoading(key: string, message?: string): void {
    this.localLoadingMap.update(map => {
      const newMap = new Map(map);
      newMap.set(key, { isLoading: true, message });
      return newMap;
    });
  }

  /**
   * Finaliza una operación de carga local
   * @param key Identificador de la operación
   */
  stopLocalLoading(key: string): void {
    this.localLoadingMap.update(map => {
      const newMap = new Map(map);
      newMap.delete(key);
      return newMap;
    });
  }

  /**
   * Verifica si una clave específica está cargando
   * @param key Identificador de la operación
   */
  isLocalLoading(key: string): boolean {
    return this.localLoadingMap().has(key);
  }

  /**
   * Obtiene el estado de carga de una clave específica
   * @param key Identificador de la operación
   */
  getLocalLoadingState(key: string): LoadingState | undefined {
    return this.localLoadingMap().get(key);
  }

  /**
   * Retorna un computed para una clave específica
   * Útil para componentes que necesitan reactividad
   */
  getLocalLoadingSignal(key: string) {
    return computed(() => this.localLoadingMap().get(key)?.isLoading ?? false);
  }

  /**
   * Wrapper para ejecutar una operación async con loading automático
   * @param operation Promesa o función que retorna una promesa
   * @param options Opciones de configuración
   */
  async withGlobalLoading<T>(
    operation: Promise<T> | (() => Promise<T>),
    options?: { message?: string } | string
  ): Promise<T> {
    const message = typeof options === 'string' ? options : options?.message;
    const stop = this.startGlobalLoading(message);
    try {
      const promise = typeof operation === 'function' ? operation() : operation;
      return await promise;
    } finally {
      stop();
    }
  }

  /**
   * Wrapper para ejecutar una operación async con loading local automático
   * @param key Identificador de la operación
   * @param operation Promesa o función que retorna una promesa
   * @param options Opciones de configuración
   */
  async withLocalLoading<T>(
    key: string,
    operation: Promise<T> | (() => Promise<T>),
    options?: { message?: string } | string
  ): Promise<T> {
    const message = typeof options === 'string' ? options : options?.message;
    this.startLocalLoading(key, message);
    try {
      const promise = typeof operation === 'function' ? operation() : operation;
      return await promise;
    } finally {
      this.stopLocalLoading(key);
    }
  }

  /**
   * Actualiza el BehaviorSubject global
   */
  private updateGlobalSubject(): void {
    this.globalLoading$.next({
      isLoading: this.globalLoadingCount() > 0,
      message: this.globalMessage()
    });
  }
}
