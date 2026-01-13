import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
    private authService: AuthService
  ) {}

  onSubmit(event: any): void {
    event.preventDefault();
    this.errors = {};
    this.errorMessage = '';
    
    if (!this.email.trim()) {
      this.errors['email'] = 'El email es requerido';
    }

    if (!this.password) {
      this.errors['password'] = 'La contraseña es requerida';
    }

    if (Object.keys(this.errors).length === 0) {
      this.isLoading = true;
      
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
          this.errorMessage = error.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/']);
  }
}
