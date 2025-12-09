import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

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

  constructor(private router: Router) {}

  onSubmit(event: any): void {
    event.preventDefault();
    this.errors = {};
    
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
      console.log('Registro:', { 
        nombre: this.nombre, 
        apellido: this.apellido, 
        usuario: this.usuario,
        email: this.email, 
        password: this.password 
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
