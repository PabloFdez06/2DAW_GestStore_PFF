import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import {
  strongPasswordValidator,
  passwordMatchValidator,
  usernameFormatValidator,
  onlyLettersValidator,
  getErrorMessage,
  createUniqueEmailValidator,
  createUniqueUsernameValidator,
  ValidationApiService
} from '../../../validators';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss'],
  providers: [ValidationApiService]
})
export class RegisterFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private validationApi = inject(ValidationApiService);

  // Signals para estados del formulario
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal(false);

  // Formulario reactivo con validadores síncronos y asíncronos
  registerForm: FormGroup = this.fb.group({
    nombre: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
      onlyLettersValidator()
    ]],
    apellido: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
      onlyLettersValidator()
    ]],
    usuario: ['', {
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        usernameFormatValidator()
      ],
      asyncValidators: [createUniqueUsernameValidator(this.validationApi)],
      updateOn: 'blur'
    }],
    email: ['', {
      validators: [
        Validators.required,
        Validators.email
      ],
      asyncValidators: [createUniqueEmailValidator(this.validationApi)],
      updateOn: 'blur'
    }],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      strongPasswordValidator()
    ]],
    confirmPassword: ['', [
      Validators.required
    ]],
    agreeTerms: [false, [Validators.requiredTrue]]
  }, {
    validators: [passwordMatchValidator('password', 'confirmPassword')]
  });

  /**
   * Verifica si un campo tiene errores y ha sido tocado
   */
  hasFieldError(fieldName: string): boolean {
    const control = this.registerForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getFieldError(fieldName: string): string {
    const control = this.registerForm.get(fieldName);
    if (control && control.errors) {
      return getErrorMessage(control.errors);
    }
    return '';
  }

  /**
   * Verifica si un campo es válido y ha sido tocado
   */
  isFieldValid(fieldName: string): boolean {
    const control = this.registerForm.get(fieldName);
    return !!(control && control.valid && (control.dirty || control.touched));
  }

  /**
   * Verifica si el campo está validando asíncronamente
   */
  isFieldValidating(fieldName: string): boolean {
    const control = this.registerForm.get(fieldName);
    return !!(control && control.pending);
  }

  /**
   * Obtiene el error de cross-field validation (passwordMatch)
   */
  getFormError(): string | null {
    if (this.registerForm.errors?.['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  }

  /**
   * Calcula la fortaleza de la contraseña para mostrar feedback visual
   */
  getPasswordStrength(): { level: string; percentage: number; color: string } {
    const password = this.registerForm.get('password')?.value || '';
    
    if (!password) {
      return { level: '', percentage: 0, color: '' };
    }

    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    const levels = [
      { level: 'Muy débil', percentage: 20, color: '#dc3545' },
      { level: 'Débil', percentage: 40, color: '#fd7e14' },
      { level: 'Regular', percentage: 60, color: '#ffc107' },
      { level: 'Fuerte', percentage: 80, color: '#20c997' },
      { level: 'Muy fuerte', percentage: 100, color: '#28a745' }
    ];

    return levels[Math.min(score, 4)];
  }

  /**
   * Maneja el envío del formulario
   */
  async onSubmit(): Promise<void> {
    // Marcar todos los campos como touched para mostrar errores
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      this.submitError.set('Por favor, corrige los errores del formulario');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(false);

    try {
      // Simular llamada al servidor
      await new Promise(resolve => setTimeout(resolve, 1500));

      const formData = {
        nombre: this.registerForm.value.nombre,
        apellido: this.registerForm.value.apellido,
        usuario: this.registerForm.value.usuario,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      console.log('Registro exitoso:', formData);
      this.submitSuccess.set(true);
      
      // Resetear formulario después de éxito
      setTimeout(() => {
        this.registerForm.reset();
        this.submitSuccess.set(false);
      }, 2000);

    } catch (error) {
      this.submitError.set('Error al registrar. Por favor, inténtalo de nuevo.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Navega hacia atrás
   */
  onBack(): void {
    this.router.navigate(['/']);
  }
}
