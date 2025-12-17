import { 
  Component, 
  Input, 
  inject,
  computed,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../services/loading.service';

/**
 * SpinnerComponent - Componente de spinner de carga
 * 
 * Puede funcionar en dos modos:
 * 1. Global: Se muestra automáticamente cuando hay operaciones globales de carga
 * 2. Local: Se controla mediante una clave específica o manualmente
 * 
 * Características:
 * - Overlay opcional para bloquear interacción
 * - Diferentes tamaños (small, medium, large)
 * - Mensaje personalizable
 * - Integración automática con LoadingService
 */
@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (shouldShow()) {
      <div 
        class="spinner-wrapper"
        [class.spinner-wrapper--overlay]="overlay"
        [class.spinner-wrapper--fullscreen]="fullscreen"
        role="status"
        aria-live="polite">
        
        <div class="spinner" [class]="'spinner--' + size">
          <svg class="spinner__svg" viewBox="0 0 50 50" aria-hidden="true">
            <circle
              class="spinner__track"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke-width="4"
            />
            <circle
              class="spinner__circle"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke-width="4"
              stroke-linecap="round"
            />
          </svg>
          
          @if (displayMessage()) {
            <span class="spinner__message">{{ displayMessage() }}</span>
          }
        </div>
        
        <span class="visually-hidden">Cargando...</span>
      </div>
    }
  `,
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent implements OnInit {
  private loadingService = inject(LoadingService);
  
  /** Modo del spinner: 'global' para sincronizar con LoadingService, 'local' para control manual */
  @Input() mode: 'global' | 'local' = 'local';
  
  /** Clave para loading local (solo en modo local) */
  @Input() loadingKey?: string;
  
  /** Control manual de visibilidad (solo en modo local sin loadingKey) */
  @Input() show: boolean = false;
  
  /** Mostrar overlay que bloquea la interacción */
  @Input() overlay: boolean = false;
  
  /** Mostrar en pantalla completa */
  @Input() fullscreen: boolean = false;
  
  /** Tamaño del spinner */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  
  /** Mensaje a mostrar debajo del spinner */
  @Input() message?: string;
  
  // Computed para determinar si debe mostrarse
  shouldShow = computed(() => {
    if (this.mode === 'global') {
      return this.loadingService.isGlobalLoading();
    }
    
    if (this.loadingKey) {
      return this.loadingService.isLocalLoading(this.loadingKey);
    }
    
    return this.show;
  });
  
  // Computed para el mensaje a mostrar
  displayMessage = computed(() => {
    if (this.message) {
      return this.message;
    }
    
    if (this.mode === 'global') {
      return this.loadingService.globalLoadingMessage();
    }
    
    if (this.loadingKey) {
      return this.loadingService.getLocalLoadingState(this.loadingKey)?.message;
    }
    
    return undefined;
  });
  
  ngOnInit(): void {
    // Si es modo global y fullscreen, configurar overlay automáticamente
    if (this.mode === 'global' && this.fullscreen) {
      this.overlay = true;
    }
  }
}

/**
 * ButtonSpinnerComponent - Spinner pequeño para usar dentro de botones
 */
@Component({
  selector: 'app-button-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="button-spinner" [class.button-spinner--light]="light" role="status">
      <svg class="button-spinner__svg" viewBox="0 0 24 24" aria-hidden="true">
        <circle
          class="button-spinner__circle"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
      <span class="visually-hidden">Cargando...</span>
    </span>
  `,
  styles: [`
    .button-spinner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1em;
      height: 1em;
      
      &__svg {
        width: 100%;
        height: 100%;
        animation: buttonSpinnerRotate 1s linear infinite;
      }
      
      &__circle {
        stroke: currentColor;
        stroke-dasharray: 45, 100;
        animation: buttonSpinnerDash 1.5s ease-in-out infinite;
      }
      
      &--light &__circle {
        stroke: white;
      }
    }
    
    @keyframes buttonSpinnerRotate {
      100% {
        transform: rotate(360deg);
      }
    }
    
    @keyframes buttonSpinnerDash {
      0% {
        stroke-dasharray: 1, 100;
        stroke-dashoffset: 0;
      }
      50% {
        stroke-dasharray: 45, 100;
        stroke-dashoffset: -20;
      }
      100% {
        stroke-dasharray: 45, 100;
        stroke-dashoffset: -60;
      }
    }
    
    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `]
})
export class ButtonSpinnerComponent {
  /** Usar color claro (para botones oscuros) */
  @Input() light: boolean = false;
}
