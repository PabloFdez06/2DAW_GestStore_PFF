import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormInputComponent } from '../form-input/form-input.component';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FormInputComponent],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  email: string = '';
  password: string = '';
  errors: { [key: string]: string } = {};

  onSubmit(event: any): void {
    event.preventDefault();
    this.errors = {};
    
    // Validación básica
    if (!this.email) {
      this.errors['email'] = 'El correo es requerido';
    } else if (!this.isValidEmail(this.email)) {
      this.errors['email'] = 'El correo no es válido';
    }

    if (!this.password) {
      this.errors['password'] = 'La contraseña es requerida';
    }

    if (Object.keys(this.errors).length === 0) {
      console.log('Formulario válido:', { email: this.email, password: this.password });
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
