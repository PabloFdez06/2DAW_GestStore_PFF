import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchInputComponent),
      multi: true
    }
  ]
})
export class SearchInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() placeholder: string = 'Buscar...';
  @Input() ariaLabel: string = 'Buscar';
  
  /**
   * Tiempo de debounce en milisegundos (por defecto 300ms)
   * Evita peticiones excesivas mientras el usuario escribe
   */
  @Input() debounceMs: number = 300;
  
  @Output() searchChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<void>();
  
  /**
   * Evento emitido después del debounce (recomendado para búsquedas)
   */
  @Output() debouncedSearch = new EventEmitter<string>();

  value: string = '';
  
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  
  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    // Configurar debounce para búsquedas
    this.searchSubject$.pipe(
      debounceTime(this.debounceMs),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.debouncedSearch.emit(value);
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.searchChange.emit(this.value);
    // Emitir al subject para debounce
    this.searchSubject$.next(this.value);
  }

  onSearchClick(): void {
    this.search.emit();
  }
}
