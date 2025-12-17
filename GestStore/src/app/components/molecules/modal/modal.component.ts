import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  HostListener,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ModalComponent - Componente modal reutilizable
 * 
 * Características de interactividad:
 * - Apertura/cierre con animación
 * - Cierre con tecla ESC
 * - Cierre al hacer click en el overlay (fuera del contenido)
 * - Focus trap para accesibilidad
 * - Prevención de scroll del body cuando está abierto
 * - ARIA attributes para lectores de pantalla
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div 
        class="modal"
        [class.modal--closing]="isClosing()"
        role="dialog"
        [attr.aria-modal]="true"
        [attr.aria-labelledby]="titleId"
        [attr.aria-describedby]="descriptionId">
        
        <!-- Overlay -->
        <div 
          class="modal__overlay" 
          (click)="onOverlayClick($event)"
          aria-hidden="true">
        </div>
        
        <!-- Modal Content -->
        <div 
          #modalContent
          class="modal__content"
          [class]="'modal__content modal__content--' + size"
          role="document"
          tabindex="-1">
          
          <!-- Header -->
          <header class="modal__header" *ngIf="title">
            <h2 [id]="titleId" class="modal__title">{{ title }}</h2>
            <button 
              type="button"
              class="modal__close"
              (click)="close()"
              aria-label="Cerrar modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" stroke-width="2" stroke-linecap="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </header>
          
          <!-- Body -->
          <div [id]="descriptionId" class="modal__body">
            <ng-content></ng-content>
          </div>
          
          <!-- Footer (optional) -->
          <footer class="modal__footer" *ngIf="showFooter">
            <ng-content select="[modal-footer]"></ng-content>
          </footer>
        </div>
      </div>
    }
  `,
  styleUrl: './modal.component.scss'
})
export class ModalComponent implements OnInit, OnDestroy {
  @ViewChild('modalContent') modalContent!: ElementRef<HTMLElement>;
  
  @Input() title: string = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showFooter: boolean = false;
  @Input() closeOnOverlayClick: boolean = true;
  @Input() closeOnEscape: boolean = true;
  
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  
  isOpen = signal(false);
  isClosing = signal(false);
  
  readonly titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  readonly descriptionId = `modal-desc-${Math.random().toString(36).substr(2, 9)}`;
  
  private previousFocusElement: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];

  ngOnInit(): void {
    // Configuración inicial
  }

  ngOnDestroy(): void {
    // Restaurar scroll del body si el modal se destruye mientras está abierto
    if (this.isOpen()) {
      this.enableBodyScroll();
    }
  }

  /**
   * HostListener para detectar tecla ESC
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen() && this.closeOnEscape) {
      this.close();
    }
  }

  /**
   * HostListener para gestionar navegación con teclado (Tab trap)
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    if (!this.isOpen() || !this.modalContent) return;
    
    this.updateFocusableElements();
    
    if (this.focusableElements.length === 0) return;
    
    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];
    
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  /**
   * Abre el modal
   */
  open(): void {
    this.previousFocusElement = document.activeElement as HTMLElement;
    this.isOpen.set(true);
    this.disableBodyScroll();
    this.opened.emit();
    
    // Focus al contenido del modal tras abrirlo
    setTimeout(() => {
      this.updateFocusableElements();
      if (this.focusableElements.length > 0) {
        this.focusableElements[0].focus();
      } else {
        this.modalContent?.nativeElement?.focus();
      }
    }, 100);
  }

  /**
   * Cierra el modal con animación
   */
  close(): void {
    this.isClosing.set(true);
    
    // Esperar a que termine la animación de cierre
    setTimeout(() => {
      this.isOpen.set(false);
      this.isClosing.set(false);
      this.enableBodyScroll();
      this.closed.emit();
      
      // Restaurar focus al elemento previo
      if (this.previousFocusElement) {
        this.previousFocusElement.focus();
        this.previousFocusElement = null;
      }
    }, 200);
  }

  /**
   * Maneja click en el overlay
   */
  onOverlayClick(event: MouseEvent): void {
    if (this.closeOnOverlayClick) {
      this.close();
    }
  }

  /**
   * Actualiza la lista de elementos focusables dentro del modal
   */
  private updateFocusableElements(): void {
    if (!this.modalContent) return;
    
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    
    this.focusableElements = Array.from(
      this.modalContent.nativeElement.querySelectorAll(focusableSelectors)
    );
  }

  /**
   * Deshabilita el scroll del body
   */
  private disableBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  /**
   * Habilita el scroll del body
   */
  private enableBodyScroll(): void {
    document.body.style.overflow = '';
  }
}
