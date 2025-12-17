// Validadores Síncronos
export {
  // Contraseña
  strongPasswordValidator,
  passwordMatchValidator,
  
  // Documentos españoles
  nifNieValidator,
  spanishPhoneValidator,
  spanishPostalCodeValidator,
  spanishIbanValidator,
  
  // Texto
  onlyLettersValidator,
  usernameFormatValidator,
  
  // Numéricos
  rangeValidator,
  positiveNumberValidator,
  
  // Fechas
  minDateValidator,
  maxDateValidator,
  adultAgeValidator,
  
  // URL
  urlValidator,
  
  // Condicional
  conditionalValidator,
  
  // Utilidades
  getErrorMessage,
  getControlErrorMessage
} from './sync-validators';

// Validadores Asíncronos
export {
  ValidationApiService,
  uniqueEmailValidator,
  uniqueUsernameValidator,
  uniqueNifValidator,
  createUniqueEmailValidator,
  createUniqueUsernameValidator,
  createUniqueNifValidator,
  isValidating,
  hasAsyncError
} from './async-validators';
