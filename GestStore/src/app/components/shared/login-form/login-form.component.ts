import { Component, Output, EventEmitter, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { getErrorMessage } from '../../../validators';

/**
 * LoginFormComponent - Formulario de inicio de sesión reactivo
 * 
 * Implementa:
 * - FormBuilder para construcción del formulario
 * - Validadores síncronos integrados (required, email, minLength)
 * - Gestión de estados (touched, dirty, invalid)
 * - Feedback visual de validación
 * - Loading state durante submit
 */
@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  @Output() backClicked = new EventEmitter<void>();
  
  private fb = inject(FormBuilder);
  private router = inject(Router);
  
  // Formulario reactivo
  loginForm!: FormGroup;
  
  // Estados
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  
  ngOnInit(): void {
    this.initForm();
  }
  
  /**
   * Inicializa el formulario con FormBuilder
   */
  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      rememberMe: [false]
    });
  }
  
  /**
   * Obtiene el mensaje de error para un campo
   */
  getFieldError(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (control && control.invalid && (control.dirty || control.touched)) {
      return getErrorMessage(control, this.getFieldLabel(fieldName));
    }
    return '';
  }
  
  /**
   * Verifica si un campo tiene error y debe mostrarse
   */
  hasFieldError(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  
  /**
   * Verifica si un campo es válido y ha sido tocado
   */
  isFieldValid(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return !!(control && control.valid && (control.dirty || control.touched));
  }
  
  /**
   * Obtiene la etiqueta legible para un campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'El email',
      password: 'La contraseña'
    };
    return labels[fieldName] || fieldName;
  }
  
  /**
   * Maneja el envío del formulario
   */
  async onSubmit(): Promise<void> {
    // Marcar todos los campos como touched para mostrar errores
    this.loginForm.markAllAsTouched();
    
    if (this.loginForm.invalid) {
      return;
    }
    
    this.isSubmitting.set(true);
    this.submitError.set(null);
    
    try {
      // Simular llamada al servidor
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const formValue = this.loginForm.value;
      console.log('Login exitoso:', {
        email: formValue.email,
        rememberMe: formValue.rememberMe
      });
      
      // Aquí iría la navegación al dashboard o página principal
      // this.router.navigate(['/dashboard']);
      
    } catch (error) {
      this.submitError.set('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
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
  
  /**
   * Resetea el formulario
   */
  resetForm(): void {
    this.loginForm.reset({
      email: '',
      password: '',
      rememberMe: false
    });
    this.submitError.set(null);
  }
}
