import { 
  Component, 
  signal, 
  HostListener, 
  ElementRef, 
  ViewChild, 
  inject,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeSwitcherComponent } from '../../atoms/theme-switcher/theme-switcher.component';

/**
 * HeaderComponent - Componente de cabecera con navegación
 * 
 * Características de interactividad:
 * - Menú hamburguesa para móvil con animación
 * - Cierre automático al hacer click fuera del menú
 * - Cierre con tecla ESC
 * - Gestión de focus para accesibilidad
 * - Prevención de scroll cuando el menú está abierto
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeSwitcherComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  @ViewChild('hamburgerButton') hamburgerButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('mobileMenu') mobileMenuRef!: ElementRef<HTMLElement>;
  
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  
  isMenuOpen = signal(false);
  private previousFocusElement: HTMLElement | null = null;

  ngAfterViewInit(): void {
    // Configuración inicial del componente
  }

  ngOnDestroy(): void {
    // Limpiar estilos del body al destruir el componente
    this.enableBodyScroll();
  }

  /**
   * HostListener para detectar clicks fuera del menú
   * Cierra el menú si se hace click fuera de él
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isMenuOpen()) return;
    
    const target = event.target as HTMLElement;
    const clickedInsideMenu = this.elementRef.nativeElement.contains(target);
    
    // Si el click fue fuera del header completo, cerrar menú
    if (!clickedInsideMenu) {
      this.closeMenu();
    }
  }

  /**
   * HostListener para detectar tecla ESC
   * Cierra el menú y devuelve el focus al botón hamburguesa
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isMenuOpen()) {
      this.closeMenu();
      // Devolver focus al botón hamburguesa
      this.hamburgerButton?.nativeElement?.focus();
    }
  }

  /**
   * HostListener para gestionar navegación con teclado dentro del menú
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isMenuOpen()) return;
    
    // Tab trap dentro del menú móvil
    if (event.key === 'Tab' && this.mobileMenuRef) {
      const focusableElements = this.mobileMenuRef.nativeElement.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Alterna el estado del menú móvil
   * Guarda el elemento con focus previo para restaurarlo al cerrar
   */
  toggleMenu(): void {
    if (!this.isMenuOpen()) {
      this.previousFocusElement = document.activeElement as HTMLElement;
      this.isMenuOpen.set(true);
      this.disableBodyScroll();
      
      // Focus al primer elemento del menú tras abrirlo
      setTimeout(() => {
        const firstLink = this.mobileMenuRef?.nativeElement?.querySelector('a');
        firstLink?.focus();
      }, 100);
    } else {
      this.closeMenu();
    }
  }

  /**
   * Cierra el menú y restaura el estado anterior
   */
  closeMenu(): void {
    this.isMenuOpen.set(false);
    this.enableBodyScroll();
    
    // Restaurar focus al elemento previo
    if (this.previousFocusElement) {
      this.previousFocusElement.focus();
      this.previousFocusElement = null;
    }
  }

  /**
   * Navega a la página de login
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
    this.closeMenu();
  }

  /**
   * Deshabilita el scroll del body cuando el menú está abierto
   */
  private disableBodyScroll(): void {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  }

  /**
   * Habilita el scroll del body cuando el menú se cierra
   */
  private enableBodyScroll(): void {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }
}
