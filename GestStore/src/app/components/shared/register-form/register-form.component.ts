import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {
  @Output() backClicked = new EventEmitter<void>();
  
  nombre: string = '';
  apellido: string = '';
  usuario: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  agreeTerms: boolean = false;
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
    
    if (!this.nombre.trim()) {
      this.errors['nombre'] = 'El nombre es requerido';
    }

    if (!this.apellido.trim()) {
      this.errors['apellido'] = 'El apellido es requerido';
    }

    if (!this.usuario.trim()) {
      this.errors['usuario'] = 'El nombre de usuario es requerido';
    }

    if (!this.email) {
      this.errors['email'] = 'El email es requerido';
    } else if (!this.isValidEmail(this.email)) {
      this.errors['email'] = 'El email no es válido';
    }

    if (!this.password) {
      this.errors['password'] = 'La contraseña es requerida';
    } else if (this.password.length < 6) {
      this.errors['password'] = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (this.password !== this.confirmPassword) {
      this.errors['confirmPassword'] = 'Las contraseñas no coinciden';
    }

    if (!this.agreeTerms) {
      this.errors['agreeTerms'] = 'Debes aceptar los términos y condiciones';
    }

    if (Object.keys(this.errors).length === 0) {
      this.isLoading = true;
      
      const fullName = `${this.nombre} ${this.apellido}`;
      
      this.authService.register({
        name: fullName,
        email: this.email,
        password: this.password
      }).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error en registro:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al registrarse. El email puede estar ya registrado.';
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
