import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './components/molecules/toast/toast.component';
import { SpinnerComponent } from './components/atoms/spinner/spinner.component';
import { ThemeService } from './services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    ToastContainerComponent,
    SpinnerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'GestStore';
  
  // Inyectar ThemeService para inicializar el tema
  private themeService = inject(ThemeService);
  
  ngOnInit(): void {
    // El tema se inicializa automáticamente en el constructor del ThemeService
    // pero podemos verificar que está activo
    console.log('Tema actual:', this.themeService.currentTheme());
  }
}

