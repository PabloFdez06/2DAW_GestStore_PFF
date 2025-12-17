import { 
  Directive, 
  Input, 
  ElementRef, 
  HostListener,
  OnDestroy,
  Renderer2,
  inject
} from '@angular/core';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * TooltipDirective - Directiva para mostrar tooltips al hover
 * 
 * Uso: <button appTooltip="Texto del tooltip" tooltipPosition="top">Hover me</button>
 * 
 * Características:
 * - Mostrar/ocultar al hover y focus
 * - Posicionamiento automático (top, bottom, left, right)
 * - Animación de entrada/salida
 * - Accesible con teclado
 * - Delay configurable
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipText: string = '';
  @Input() tooltipPosition: TooltipPosition = 'top';
  @Input() tooltipDelay: number = 200;
  @Input() tooltipDisabled: boolean = false;
  
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  
  private tooltipElement: HTMLElement | null = null;
  private showTimeout: any = null;
  private hideTimeout: any = null;
  
  /**
   * Muestra el tooltip al pasar el mouse
   */
  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.tooltipDisabled || !this.tooltipText) return;
    this.scheduleShow();
  }
  
  /**
   * Oculta el tooltip al salir el mouse
   */
  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.scheduleHide();
  }
  
  /**
   * Muestra el tooltip al recibir focus (accesibilidad)
   */
  @HostListener('focus')
  onFocus(): void {
    if (this.tooltipDisabled || !this.tooltipText) return;
    this.scheduleShow();
  }
  
  /**
   * Oculta el tooltip al perder focus
   */
  @HostListener('blur')
  onBlur(): void {
    this.scheduleHide();
  }
  
  /**
   * Oculta el tooltip al presionar ESC
   */
  @HostListener('keydown.escape')
  onEscape(): void {
    this.hideTooltip();
  }
  
  ngOnDestroy(): void {
    this.clearTimeouts();
    this.removeTooltip();
  }
  
  /**
   * Programa la aparición del tooltip con delay
   */
  private scheduleShow(): void {
    this.clearTimeouts();
    this.showTimeout = setTimeout(() => {
      this.showTooltip();
    }, this.tooltipDelay);
  }
  
  /**
   * Programa la ocultación del tooltip
   */
  private scheduleHide(): void {
    this.clearTimeouts();
    this.hideTimeout = setTimeout(() => {
      this.hideTooltip();
    }, 100);
  }
  
  /**
   * Muestra el tooltip
   */
  private showTooltip(): void {
    if (this.tooltipElement) return;
    
    // Crear elemento del tooltip
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'tooltip');
    this.renderer.addClass(this.tooltipElement, `tooltip--${this.tooltipPosition}`);
    
    // Crear contenido
    const textNode = this.renderer.createText(this.tooltipText);
    this.renderer.appendChild(this.tooltipElement, textNode);
    
    // Añadir al DOM
    this.renderer.appendChild(document.body, this.tooltipElement);
    
    // Posicionar
    this.positionTooltip();
    
    // Animar entrada
    requestAnimationFrame(() => {
      if (this.tooltipElement) {
        this.renderer.addClass(this.tooltipElement, 'tooltip--visible');
      }
    });
    
    // Añadir ARIA
    this.renderer.setAttribute(
      this.elementRef.nativeElement, 
      'aria-describedby', 
      this.getTooltipId()
    );
    
    if (this.tooltipElement) {
      this.renderer.setAttribute(this.tooltipElement, 'id', this.getTooltipId());
      this.renderer.setAttribute(this.tooltipElement, 'role', 'tooltip');
    }
  }
  
  /**
   * Oculta el tooltip
   */
  private hideTooltip(): void {
    if (!this.tooltipElement) return;
    
    this.renderer.removeClass(this.tooltipElement, 'tooltip--visible');
    
    // Esperar animación y luego remover
    setTimeout(() => {
      this.removeTooltip();
    }, 150);
    
    // Limpiar ARIA
    this.renderer.removeAttribute(this.elementRef.nativeElement, 'aria-describedby');
  }
  
  /**
   * Remueve el tooltip del DOM
   */
  private removeTooltip(): void {
    if (this.tooltipElement && this.tooltipElement.parentNode) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }
  
  /**
   * Posiciona el tooltip respecto al elemento host
   */
  private positionTooltip(): void {
    if (!this.tooltipElement) return;
    
    const hostRect = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    let top: number;
    let left: number;
    
    const offset = 8; // Espacio entre elemento y tooltip
    
    switch (this.tooltipPosition) {
      case 'top':
        top = hostRect.top + scrollTop - tooltipRect.height - offset;
        left = hostRect.left + scrollLeft + (hostRect.width - tooltipRect.width) / 2;
        break;
        
      case 'bottom':
        top = hostRect.bottom + scrollTop + offset;
        left = hostRect.left + scrollLeft + (hostRect.width - tooltipRect.width) / 2;
        break;
        
      case 'left':
        top = hostRect.top + scrollTop + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.left + scrollLeft - tooltipRect.width - offset;
        break;
        
      case 'right':
        top = hostRect.top + scrollTop + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.right + scrollLeft + offset;
        break;
    }
    
    // Ajustar si se sale de la pantalla
    const maxLeft = window.innerWidth - tooltipRect.width - 10;
    const maxTop = window.innerHeight + scrollTop - tooltipRect.height - 10;
    
    left = Math.max(10, Math.min(left, maxLeft));
    top = Math.max(10 + scrollTop, Math.min(top, maxTop));
    
    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }
  
  /**
   * Genera un ID único para el tooltip
   */
  private getTooltipId(): string {
    return `tooltip-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Limpia los timeouts pendientes
   */
  private clearTimeouts(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }
}
