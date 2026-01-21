import { Directive, EventEmitter, HostListener, Input, Output, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

/**
 * Directiva para implementar infinite scroll en contenedores.
 * 
 * Uso:
 * <div appInfiniteScroll (scrolledToBottom)="loadMore()" [threshold]="100" [disabled]="isLoading">
 *   ...contenido...
 * </div>
 * 
 * También se puede usar en window:
 * <div appInfiniteScroll [useWindow]="true" (scrolledToBottom)="loadMore()">
 */
@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true
})
export class InfiniteScrollDirective implements AfterViewInit, OnDestroy {
  /**
   * Distancia en píxeles desde el fondo para disparar el evento
   */
  @Input() threshold: number = 150;
  
  /**
   * Si está deshabilitado (ej: durante carga)
   */
  @Input() disabled: boolean = false;
  
  /**
   * Usar el scroll de la ventana en lugar del contenedor
   */
  @Input() useWindow: boolean = false;
  
  /**
   * Evento emitido cuando se llega al final del scroll
   */
  @Output() scrolledToBottom = new EventEmitter<void>();
  
  private scroll$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  
  constructor(private elementRef: ElementRef<HTMLElement>) {}
  
  ngAfterViewInit(): void {
    // Debounce para evitar múltiples emisiones
    this.scroll$.pipe(
      debounceTime(100),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (!this.disabled) {
        this.scrolledToBottom.emit();
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  @HostListener('scroll')
  onElementScroll(): void {
    if (this.useWindow || this.disabled) return;
    
    const element = this.elementRef.nativeElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    if (scrollTop + clientHeight >= scrollHeight - this.threshold) {
      this.scroll$.next();
    }
  }
  
  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!this.useWindow || this.disabled) return;
    
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    
    if (scrollTop + clientHeight >= scrollHeight - this.threshold) {
      this.scroll$.next();
    }
  }
}
