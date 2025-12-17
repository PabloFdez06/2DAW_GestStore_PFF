import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { inject, Injectable } from '@angular/core';

/**
 * Validadores Asíncronos Personalizados
 * 
 * Colección de validadores asíncronos para formularios reactivos
 * que simulan consultas a API con debounce para evitar llamadas excesivas.
 */

// ============================================
// SERVICIO DE VALIDACIÓN (Simulación de API)
// ============================================

@Injectable({
  providedIn: 'root'
})
export class ValidationApiService {
  // Emails "registrados" para simulación
  private registeredEmails = [
    'admin@geststore.com',
    'user@geststore.com',
    'test@test.com',
    'ejemplo@ejemplo.com',
    'demo@demo.com'
  ];

  // Usernames "registrados" para simulación
  private registeredUsernames = [
    'admin',
    'usuario',
    'test',
    'demo',
    'geststore',
    'root',
    'superadmin'
  ];

  /**
   * Simula verificación de email en el servidor
   * @param email - Email a verificar
   * @returns Observable que indica si el email existe
   */
  checkEmailExists(email: string): Observable<boolean> {
    // Simular delay de red (300-800ms)
    const delay = 300 + Math.random() * 500;
    
    return timer(delay).pipe(
      map(() => {
        const normalizedEmail = email.toLowerCase().trim();
        return this.registeredEmails.includes(normalizedEmail);
      })
    );
  }

  /**
   * Simula verificación de username en el servidor
   * @param username - Username a verificar
   * @returns Observable que indica si el username existe
   */
  checkUsernameExists(username: string): Observable<boolean> {
    // Simular delay de red (300-800ms)
    const delay = 300 + Math.random() * 500;
    
    return timer(delay).pipe(
      map(() => {
        const normalizedUsername = username.toLowerCase().trim();
        return this.registeredUsernames.includes(normalizedUsername);
      })
    );
  }

  /**
   * Simula verificación de NIF en el servidor (para verificar duplicados)
   * @param nif - NIF a verificar
   * @returns Observable que indica si el NIF existe
   */
  checkNifExists(nif: string): Observable<boolean> {
    const delay = 400 + Math.random() * 400;
    
    return timer(delay).pipe(
      map(() => {
        // Simular que algunos NIFs ya existen
        const registeredNifs = ['12345678Z', '87654321X', '11111111H'];
        return registeredNifs.includes(nif.toUpperCase());
      })
    );
  }
}

// ============================================
// VALIDADORES ASÍNCRONOS
// ============================================

/**
 * Validador asíncrono de email único
 * 
 * Verifica que el email no esté ya registrado en el sistema.
 * Incluye debounce para evitar llamadas excesivas durante la escritura.
 * 
 * @param validationService - Servicio de validación
 * @param debounceMs - Tiempo de debounce en ms (default: 500)
 * @returns AsyncValidatorFn
 */
export function uniqueEmailValidator(
  validationService: ValidationApiService,
  debounceMs: number = 500
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value;

    // No validar si está vacío o no es un email válido
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return of(null);
    }

    return timer(debounceMs).pipe(
      switchMap(() => validationService.checkEmailExists(value)),
      map(exists => exists ? { emailTaken: true } : null),
      catchError(() => of(null)) // En caso de error, no mostrar error de validación
    );
  };
}

/**
 * Validador asíncrono de username disponible
 * 
 * Verifica que el nombre de usuario no esté ocupado.
 * Incluye debounce para evitar llamadas excesivas.
 * 
 * @param validationService - Servicio de validación
 * @param debounceMs - Tiempo de debounce en ms (default: 500)
 * @returns AsyncValidatorFn
 */
export function uniqueUsernameValidator(
  validationService: ValidationApiService,
  debounceMs: number = 500
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value;

    // No validar si está vacío o muy corto
    if (!value || value.length < 3) {
      return of(null);
    }

    return timer(debounceMs).pipe(
      switchMap(() => validationService.checkUsernameExists(value)),
      map(exists => exists ? { usernameTaken: true } : null),
      catchError(() => of(null))
    );
  };
}

/**
 * Validador asíncrono de NIF único
 * 
 * @param validationService - Servicio de validación
 * @param debounceMs - Tiempo de debounce en ms (default: 500)
 * @returns AsyncValidatorFn
 */
export function uniqueNifValidator(
  validationService: ValidationApiService,
  debounceMs: number = 500
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value;

    if (!value || value.length < 9) {
      return of(null);
    }

    return timer(debounceMs).pipe(
      switchMap(() => validationService.checkNifExists(value)),
      map(exists => exists ? { nifTaken: true } : null),
      catchError(() => of(null))
    );
  };
}

// ============================================
// FACTORY FUNCTIONS PARA INYECCIÓN
// ============================================

/**
 * Crea un validador de email único usando el servicio de validación
 * Para usar en componentes standalone con inyección de dependencias
 * 
 * @param validationService - Servicio de validación inyectado
 * @param debounceMs - Tiempo de debounce en ms (default: 500)
 */
export function createUniqueEmailValidator(
  validationService: ValidationApiService,
  debounceMs: number = 500
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value;

    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return of(null);
    }

    return timer(debounceMs).pipe(
      switchMap(() => validationService.checkEmailExists(value)),
      map(exists => exists ? { emailTaken: true } : null),
      catchError(() => of(null))
    );
  };
}

/**
 * Crea un validador de username único usando el servicio de validación
 * Para usar en componentes standalone con inyección de dependencias
 * 
 * @param validationService - Servicio de validación inyectado
 * @param debounceMs - Tiempo de debounce en ms (default: 500)
 */
export function createUniqueUsernameValidator(
  validationService: ValidationApiService,
  debounceMs: number = 500
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value;

    if (!value || value.length < 3) {
      return of(null);
    }

    return timer(debounceMs).pipe(
      switchMap(() => validationService.checkUsernameExists(value)),
      map(exists => exists ? { usernameTaken: true } : null),
      catchError(() => of(null))
    );
  };
}

/**
 * Crea un validador de NIF único usando el servicio de validación
 * 
 * @param validationService - Servicio de validación inyectado
 * @param debounceMs - Tiempo de debounce en ms (default: 500)
 */
export function createUniqueNifValidator(
  validationService: ValidationApiService,
  debounceMs: number = 500
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value;

    if (!value || value.length < 9) {
      return of(null);
    }

    return timer(debounceMs).pipe(
      switchMap(() => validationService.checkNifExists(value)),
      map(exists => exists ? { nifTaken: true } : null),
      catchError(() => of(null))
    );
  };
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Verifica si un control está en proceso de validación asíncrona
 * @param control - Control de formulario
 * @returns true si está validando
 */
export function isValidating(control: AbstractControl): boolean {
  return control.status === 'PENDING';
}

/**
 * Verifica si un control tiene un error específico después de validación
 * @param control - Control de formulario
 * @param errorKey - Clave del error
 * @returns true si tiene el error
 */
export function hasAsyncError(control: AbstractControl, errorKey: string): boolean {
  return control.hasError(errorKey) && !isValidating(control);
}
