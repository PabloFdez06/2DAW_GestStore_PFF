import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

/**
 * Validadores Síncronos Personalizados
 * 
 * Colección de validadores síncronos para formularios reactivos
 * que verifican datos de forma instantánea sin necesidad de consultas externas.
 */

// ============================================
// VALIDADORES DE CONTRASEÑA
// ============================================

/**
 * Validador de contraseña fuerte
 * 
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Al menos una letra mayúscula
 * - Al menos una letra minúscula
 * - Al menos un número
 * - Al menos un carácter especial (!@#$%^&*(),.?":{}|<>)
 * 
 * @returns ValidatorFn que retorna los errores específicos o null
 */
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null; // No validar si está vacío (usar required para eso)
    }

    const errors: ValidationErrors = {};

    // Mínimo 8 caracteres
    if (value.length < 8) {
      errors['minLength'] = { requiredLength: 8, actualLength: value.length };
    }

    // Al menos una mayúscula
    if (!/[A-Z]/.test(value)) {
      errors['uppercase'] = true;
    }

    // Al menos una minúscula
    if (!/[a-z]/.test(value)) {
      errors['lowercase'] = true;
    }

    // Al menos un número
    if (!/[0-9]/.test(value)) {
      errors['number'] = true;
    }

    // Al menos un carácter especial
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(value)) {
      errors['specialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? { strongPassword: errors } : null;
  };
}

/**
 * Validador de confirmación de contraseña
 * Valida que dos campos de contraseña coincidan
 * 
 * @param passwordField - Nombre del campo de contraseña original
 * @param confirmPasswordField - Nombre del campo de confirmación
 * @returns ValidatorFn para usar a nivel de FormGroup
 */
export function passwordMatchValidator(
  passwordField: string = 'password',
  confirmPasswordField: string = 'confirmPassword'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const password = formGroup.get(passwordField);
    const confirmPassword = formGroup.get(confirmPasswordField);

    if (!password || !confirmPassword) {
      return null;
    }

    if (confirmPassword.value && password.value !== confirmPassword.value) {
      // Establecer el error en el campo de confirmación
      confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Limpiar el error de mismatch si existe
      if (confirmPassword.errors) {
        const { passwordMismatch, ...otherErrors } = confirmPassword.errors;
        confirmPassword.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
      }
    }

    return null;
  };
}

// ============================================
// VALIDADORES DE DOCUMENTOS ESPAÑOLES
// ============================================

/**
 * Validador de NIF/NIE español
 * 
 * Valida el formato y la letra de control del NIF/NIE
 * - NIF: 8 dígitos + letra
 * - NIE: X/Y/Z + 7 dígitos + letra
 * 
 * @returns ValidatorFn
 */
export function nifNieValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const nifNie = value.toUpperCase().replace(/\s/g, '');
    
    // Patrón para NIF y NIE
    const nifPattern = /^[0-9]{8}[A-Z]$/;
    const niePattern = /^[XYZ][0-9]{7}[A-Z]$/;

    if (!nifPattern.test(nifNie) && !niePattern.test(nifNie)) {
      return { nifNie: { message: 'Formato inválido. Debe ser NIF (12345678A) o NIE (X1234567A)' } };
    }

    // Calcular letra de control
    let numericPart: string;
    if (niePattern.test(nifNie)) {
      // Convertir primera letra del NIE a número
      const nieFirstLetter = nifNie.charAt(0);
      const nieMapping: { [key: string]: string } = { 'X': '0', 'Y': '1', 'Z': '2' };
      numericPart = nieMapping[nieFirstLetter] + nifNie.substring(1, 8);
    } else {
      numericPart = nifNie.substring(0, 8);
    }

    const controlLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const expectedLetter = controlLetters[parseInt(numericPart, 10) % 23];
    const actualLetter = nifNie.charAt(nifNie.length - 1);

    if (expectedLetter !== actualLetter) {
      return { nifNie: { message: 'La letra de control no es correcta' } };
    }

    return null;
  };
}

/**
 * Validador de teléfono español
 * 
 * Acepta formatos:
 * - 9 dígitos (612345678)
 * - Con espacios (612 345 678)
 * - Con prefijo +34 (+34 612345678)
 * - Fijos y móviles (6xx, 7xx, 8xx, 9xx)
 * 
 * @returns ValidatorFn
 */
export function spanishPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    // Limpiar espacios, guiones y paréntesis
    const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
    
    // Patrón con o sin prefijo +34
    const phonePattern = /^(\+34)?[6789]\d{8}$/;

    if (!phonePattern.test(cleanPhone)) {
      return { 
        phone: { 
          message: 'Formato inválido. Debe ser un teléfono español válido (ej: 612345678 o +34612345678)' 
        } 
      };
    }

    return null;
  };
}

/**
 * Validador de código postal español
 * 
 * Valida que sea un código postal español válido (5 dígitos, 01000-52999)
 * 
 * @returns ValidatorFn
 */
export function spanishPostalCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const postalCode = value.toString().trim();
    
    // Debe ser exactamente 5 dígitos
    if (!/^\d{5}$/.test(postalCode)) {
      return { postalCode: { message: 'El código postal debe tener 5 dígitos' } };
    }

    // Las provincias españolas van de 01 a 52
    const province = parseInt(postalCode.substring(0, 2), 10);
    if (province < 1 || province > 52) {
      return { postalCode: { message: 'El código de provincia no es válido (01-52)' } };
    }

    return null;
  };
}

// ============================================
// VALIDADORES DE TEXTO
// ============================================

/**
 * Validador de solo letras (con espacios y acentos permitidos)
 * Útil para nombres y apellidos
 * 
 * @returns ValidatorFn
 */
export function onlyLettersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    // Permite letras, espacios, acentos y caracteres especiales de nombres
    const lettersPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;

    if (!lettersPattern.test(value)) {
      return { onlyLetters: { message: 'Solo se permiten letras' } };
    }

    return null;
  };
}

/**
 * Validador de nombre de usuario
 * 
 * Requisitos:
 * - 3-20 caracteres
 * - Solo letras, números y guiones bajos
 * - Debe comenzar con letra
 * 
 * @returns ValidatorFn
 */
export function usernameFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const errors: ValidationErrors = {};

    if (value.length < 3) {
      errors['minLength'] = { required: 3, actual: value.length };
    }

    if (value.length > 20) {
      errors['maxLength'] = { required: 20, actual: value.length };
    }

    if (!/^[a-zA-Z]/.test(value)) {
      errors['startWithLetter'] = true;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      errors['invalidChars'] = true;
    }

    return Object.keys(errors).length > 0 ? { username: errors } : null;
  };
}

// ============================================
// VALIDADORES NUMÉRICOS
// ============================================

/**
 * Validador de rango numérico
 * 
 * @param min - Valor mínimo permitido
 * @param max - Valor máximo permitido
 * @returns ValidatorFn
 */
export function rangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numValue = Number(value);

    if (isNaN(numValue)) {
      return { range: { message: 'Debe ser un número válido' } };
    }

    if (numValue < min || numValue > max) {
      return { range: { min, max, actual: numValue } };
    }

    return null;
  };
}

/**
 * Validador de precio/cantidad positiva
 * 
 * @param allowZero - Si se permite el valor 0
 * @param decimals - Número de decimales permitidos
 * @returns ValidatorFn
 */
export function positiveNumberValidator(allowZero: boolean = false, decimals: number = 2): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numValue = Number(value);

    if (isNaN(numValue)) {
      return { positiveNumber: { message: 'Debe ser un número válido' } };
    }

    if (allowZero ? numValue < 0 : numValue <= 0) {
      return { positiveNumber: { message: allowZero ? 'No puede ser negativo' : 'Debe ser mayor que 0' } };
    }

    // Validar decimales
    const decimalPart = value.toString().split('.')[1];
    if (decimalPart && decimalPart.length > decimals) {
      return { positiveNumber: { message: `Máximo ${decimals} decimales permitidos` } };
    }

    return null;
  };
}

// ============================================
// VALIDADORES DE FECHA
// ============================================

/**
 * Validador de fecha mínima
 * 
 * @param minDate - Fecha mínima permitida
 * @returns ValidatorFn
 */
export function minDateValidator(minDate: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const inputDate = new Date(value);
    
    if (isNaN(inputDate.getTime())) {
      return { minDate: { message: 'Fecha inválida' } };
    }

    if (inputDate < minDate) {
      return { 
        minDate: { 
          required: minDate.toISOString().split('T')[0], 
          actual: inputDate.toISOString().split('T')[0] 
        } 
      };
    }

    return null;
  };
}

/**
 * Validador de fecha máxima
 * 
 * @param maxDate - Fecha máxima permitida
 * @returns ValidatorFn
 */
export function maxDateValidator(maxDate: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const inputDate = new Date(value);
    
    if (isNaN(inputDate.getTime())) {
      return { maxDate: { message: 'Fecha inválida' } };
    }

    if (inputDate > maxDate) {
      return { 
        maxDate: { 
          required: maxDate.toISOString().split('T')[0], 
          actual: inputDate.toISOString().split('T')[0] 
        } 
      };
    }

    return null;
  };
}

/**
 * Validador de mayor de edad (18 años)
 * 
 * @returns ValidatorFn
 */
export function adultAgeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const birthDate = new Date(value);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) {
      return { adultAge: { message: 'Fecha inválida' } };
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return { adultAge: { message: 'Debes ser mayor de 18 años', age } };
    }

    return null;
  };
}

// ============================================
// VALIDADORES DE IBAN Y TARJETA
// ============================================

/**
 * Validador de IBAN español
 * 
 * @returns ValidatorFn
 */
export function spanishIbanValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    // Limpiar espacios
    const iban = value.replace(/\s/g, '').toUpperCase();
    
    // IBAN español: ES + 2 dígitos de control + 20 dígitos
    if (!/^ES\d{22}$/.test(iban)) {
      return { iban: { message: 'Formato inválido. IBAN español: ES + 22 dígitos' } };
    }

    // Validar dígitos de control (algoritmo mod 97)
    const rearranged = iban.substring(4) + '1428' + iban.substring(2, 4); // ES = 14 28
    let remainder = '';
    
    for (const char of rearranged) {
      remainder += char;
      remainder = (parseInt(remainder, 10) % 97).toString();
    }

    if (parseInt(remainder, 10) !== 1) {
      return { iban: { message: 'Los dígitos de control no son válidos' } };
    }

    return null;
  };
}

// ============================================
// VALIDADORES DE URL Y EMAIL
// ============================================

/**
 * Validador de URL
 * 
 * @param requireHttps - Si se requiere HTTPS
 * @returns ValidatorFn
 */
export function urlValidator(requireHttps: boolean = false): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    try {
      const url = new URL(value);
      
      if (requireHttps && url.protocol !== 'https:') {
        return { url: { message: 'La URL debe usar HTTPS' } };
      }
      
      if (!['http:', 'https:'].includes(url.protocol)) {
        return { url: { message: 'Protocolo inválido. Debe ser HTTP o HTTPS' } };
      }
      
      return null;
    } catch {
      return { url: { message: 'URL inválida' } };
    }
  };
}

// ============================================
// VALIDADOR CONDICIONAL
// ============================================

/**
 * Validador condicional - aplica validación solo si una condición se cumple
 * 
 * @param condition - Función que determina si aplicar la validación
 * @param validator - Validador a aplicar si la condición es true
 * @returns ValidatorFn
 */
export function conditionalValidator(
  condition: (control: AbstractControl) => boolean,
  validator: ValidatorFn
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (condition(control)) {
      return validator(control);
    }
    return null;
  };
}

// ============================================
// MENSAJES DE ERROR PREDEFINIDOS
// ============================================

/**
 * Obtiene el mensaje de error para un objeto de errores de validación
 * 
 * @param errors - Objeto ValidationErrors con los errores
 * @param fieldName - Nombre del campo para mensajes personalizados
 * @returns Mensaje de error o cadena vacía
 */
export function getErrorMessage(errors: ValidationErrors | null, fieldName: string = 'Este campo'): string {
  if (!errors) {
    return '';
  }

  // Validadores integrados de Angular
  if (errors['required']) {
    return `${fieldName} es obligatorio`;
  }
  if (errors['email']) {
    return 'El email no tiene un formato válido';
  }
  if (errors['minlength']) {
    return `${fieldName} debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
  }
  if (errors['maxlength']) {
    return `${fieldName} no puede tener más de ${errors['maxlength'].requiredLength} caracteres`;
  }
  if (errors['min']) {
    return `El valor mínimo es ${errors['min'].min}`;
  }
  if (errors['max']) {
    return `El valor máximo es ${errors['max'].max}`;
  }
  if (errors['pattern']) {
    return `${fieldName} tiene un formato inválido`;
  }

  // Validadores personalizados
  if (errors['strongPassword']) {
    const pwErrors = errors['strongPassword'];
    if (pwErrors['minLength']) return 'La contraseña debe tener al menos 8 caracteres';
    if (pwErrors['uppercase']) return 'La contraseña debe contener al menos una mayúscula';
    if (pwErrors['lowercase']) return 'La contraseña debe contener al menos una minúscula';
    if (pwErrors['number']) return 'La contraseña debe contener al menos un número';
    if (pwErrors['specialChar']) return 'La contraseña debe contener al menos un carácter especial';
  }
  if (errors['passwordMismatch']) {
    return 'Las contraseñas no coinciden';
  }
  if (errors['nifNie']) {
    return errors['nifNie'].message;
  }
  if (errors['phone']) {
    return errors['phone'].message;
  }
  if (errors['postalCode']) {
    return errors['postalCode'].message;
  }
  if (errors['onlyLetters']) {
    return errors['onlyLetters'].message;
  }
  if (errors['username']) {
    const usrErrors = errors['username'];
    if (usrErrors['minLength']) return 'El usuario debe tener al menos 3 caracteres';
    if (usrErrors['maxLength']) return 'El usuario no puede tener más de 20 caracteres';
    if (usrErrors['startWithLetter']) return 'El usuario debe comenzar con una letra';
    if (usrErrors['invalidChars']) return 'El usuario solo puede contener letras, números y guiones bajos';
  }
  if (errors['range']) {
    if (errors['range'].message) return errors['range'].message;
    return `El valor debe estar entre ${errors['range'].min} y ${errors['range'].max}`;
  }
  if (errors['positiveNumber']) {
    return errors['positiveNumber'].message;
  }
  if (errors['minDate']) {
    if (errors['minDate'].message) return errors['minDate'].message;
    return `La fecha debe ser posterior a ${errors['minDate'].required}`;
  }
  if (errors['maxDate']) {
    if (errors['maxDate'].message) return errors['maxDate'].message;
    return `La fecha debe ser anterior a ${errors['maxDate'].required}`;
  }
  if (errors['adultAge']) {
    return errors['adultAge'].message;
  }
  if (errors['iban']) {
    return errors['iban'].message;
  }
  if (errors['url']) {
    return errors['url'].message;
  }

  // Validadores asíncronos
  if (errors['emailTaken']) {
    return 'Este email ya está registrado';
  }
  if (errors['usernameTaken']) {
    return 'Este nombre de usuario no está disponible';
  }
  if (errors['nifTaken']) {
    return 'Este NIF ya está registrado';
  }

  return 'Valor inválido';
}

/**
 * Obtiene el mensaje de error para un control de formulario
 * 
 * @param control - Control de formulario
 * @param fieldName - Nombre del campo para mensajes personalizados
 * @returns Mensaje de error o cadena vacía
 */
export function getControlErrorMessage(control: AbstractControl | null, fieldName: string = 'Este campo'): string {
  if (!control || !control.errors) {
    return '';
  }
  return getErrorMessage(control.errors, fieldName);
}
