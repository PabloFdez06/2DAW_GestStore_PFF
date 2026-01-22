import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SpinnerComponent } from '../../atoms/spinner/spinner.component';
import { AlertComponent } from '../../molecules/alert/alert.component';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SpinnerComponent, AlertComponent],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  @Output() backClicked = new EventEmitter<void>();
  
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  errors: { [key: string]: string } = {};
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(event: any): void {
    event.preventDefault();
    this.errors = {};
    this.errorMessage = '';
    
    if (!this.email.trim()) {
      this.errors['email'] = 'El email es requerido';
    } else if (!this.isValidEmail(this.email)) {
      this.errors['email'] = 'El formato del email no es válido';
    }

    if (!this.password) {
      this.errors['password'] = 'La contraseña es requerida';
    }

    if (Object.keys(this.errors).length === 0) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.login({
        email: this.email,
        password: this.password
      }).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.isLoading = false;
          
          // Manejar diferentes tipos de errores HTTP
          if (error.status === 401 || error.status === 403) {
            this.errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
          } else if (error.status === 404) {
            this.errorMessage = 'No existe una cuenta con este email.';
          } else if (error.status === 0) {
            this.errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
          } else if (error.status >= 500) {
            this.errorMessage = 'Error del servidor. Inténtalo más tarde.';
          } else {
            this.errorMessage = error.error?.message || error.message || 'Error al iniciar sesión. Inténtalo de nuevo.';
          }
          this.cdr.detectChanges();
        }
      });
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  onBack(): void {
    this.router.navigate(['/']);
  }
}
