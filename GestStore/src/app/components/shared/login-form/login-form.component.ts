import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

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

  constructor(private router: Router) {}

  onSubmit(event: any): void {
    event.preventDefault();
    this.errors = {};
    
    if (!this.email.trim()) {
      this.errors['email'] = 'El nombre es requerido';
    }

    if (!this.password) {
      this.errors['password'] = 'La contraseña es requerida';
    }

    if (Object.keys(this.errors).length === 0) {
      console.log('Login:', { email: this.email, password: this.password, rememberMe: this.rememberMe });
    }
  }

  onBack(): void {
    this.router.navigate(['/']);
  }
}
