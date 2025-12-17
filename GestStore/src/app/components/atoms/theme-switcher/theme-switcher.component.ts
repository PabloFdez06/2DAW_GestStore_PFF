import { Component, inject, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';

/**
 * ThemeSwitcherComponent - Componente para cambiar entre tema claro y oscuro
 * 
 * Características:
 * - Toggle visual con iconos de sol/luna
 * - Animación suave en la transición
 * - Accesible con teclado (Enter/Space)
 * - ARIA labels para lectores de pantalla
 */
@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      #toggleButton
      type="button"
      class="theme-switcher"
      [class.theme-switcher--dark]="themeService.isDarkMode()"
      (click)="toggleTheme()"
      (keydown.enter)="toggleTheme()"
      (keydown.space)="toggleTheme(); $event.preventDefault()"
      [attr.aria-label]="themeService.isDarkMode() ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
      [attr.aria-pressed]="themeService.isDarkMode()"
      role="switch">
      
      <span class="theme-switcher__track">
        <span class="theme-switcher__thumb" aria-hidden="true">
          <!-- Icono Sol -->
          <svg 
            class="theme-switcher__icon theme-switcher__icon--sun" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            aria-hidden="true">
            <circle cx="12" cy="12" r="5" stroke-width="2"/>
            <line x1="12" y1="1" x2="12" y2="3" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="21" x2="12" y2="23" stroke-width="2" stroke-linecap="round"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke-width="2" stroke-linecap="round"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke-width="2" stroke-linecap="round"/>
            <line x1="1" y1="12" x2="3" y2="12" stroke-width="2" stroke-linecap="round"/>
            <line x1="21" y1="12" x2="23" y2="12" stroke-width="2" stroke-linecap="round"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke-width="2" stroke-linecap="round"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke-width="2" stroke-linecap="round"/>
          </svg>
          
          <!-- Icono Luna -->
          <svg 
            class="theme-switcher__icon theme-switcher__icon--moon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </span>
      
      <span class="visually-hidden">
        {{ themeService.isDarkMode() ? 'Modo oscuro activado' : 'Modo claro activado' }}
      </span>
    </button>
  `,
  styleUrl: './theme-switcher.component.scss'
})
export class ThemeSwitcherComponent {
  @ViewChild('toggleButton', { static: true }) toggleButton!: ElementRef<HTMLButtonElement>;
  
  themeService = inject(ThemeService);
  
  /**
   * Alterna el tema y proporciona feedback visual
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
    
    // Añadir clase de animación temporal
    this.toggleButton.nativeElement.classList.add('theme-switcher--animating');
    setTimeout(() => {
      this.toggleButton.nativeElement.classList.remove('theme-switcher--animating');
    }, 300);
  }
}
