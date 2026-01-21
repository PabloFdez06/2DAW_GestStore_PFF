import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

/**
 * Directiva para aplicar debounce a inputs de búsqueda.
 * 
 * Uso:
 * <input appDebounceInput [debounceTime]="300" (debounceValue)="onSearch($event)" />
 * 
 * Esto evita peticiones excesivas mientras el usuario escribe.
 */
@Directive({
  selector: '[appDebounceInput]',
  standalone: true
})
export class DebounceInputDirective implements OnInit, OnDestroy {
  /**
   * Tiempo de debounce en milisegundos (por defecto 300ms)
   */
  @Input() debounceTime: number = 300;
  
  /**
   * Evento emitido con el valor después del debounce
   */
  @Output() debounceValue = new EventEmitter<string>();
  
  private input$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    this.input$.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.debounceValue.emit(value);
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.input$.next(target.value);
  }
}
