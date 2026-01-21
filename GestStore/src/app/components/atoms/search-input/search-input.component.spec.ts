/**
 * Tests unitarios para SearchInputComponent
 * 
 * Este componente implementa un input de búsqueda con debounce,
 * accesibilidad y ControlValueAccessor para formularios reactivos.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SearchInputComponent } from './search-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SearchInputComponent, FormsModule, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Inicialización', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have default placeholder', () => {
      expect(component.placeholder).toBe('Buscar...');
    });

    it('should have default aria-label', () => {
      expect(component.ariaLabel).toBe('Buscar');
    });

    it('should have default debounce time of 300ms', () => {
      expect(component.debounceMs).toBe(300);
    });

    it('should initialize with empty value', () => {
      expect(component.value).toBe('');
    });
  });

  describe('Input customization', () => {
    it('should accept custom placeholder', () => {
      component.placeholder = 'Buscar productos...';
      fixture.detectChanges();
      expect(component.placeholder).toBe('Buscar productos...');
    });

    it('should accept custom aria-label', () => {
      component.ariaLabel = 'Buscar en la lista de tareas';
      fixture.detectChanges();
      expect(component.ariaLabel).toBe('Buscar en la lista de tareas');
    });

    it('should accept custom debounce time', () => {
      component.debounceMs = 500;
      fixture.detectChanges();
      expect(component.debounceMs).toBe(500);
    });
  });

  describe('ControlValueAccessor Implementation', () => {
    it('should implement writeValue correctly', () => {
      component.writeValue('test value');
      expect(component.value).toBe('test value');
    });

    it('should handle null/undefined in writeValue', () => {
      component.writeValue(null as unknown as string);
      expect(component.value).toBe('');

      component.writeValue(undefined as unknown as string);
      expect(component.value).toBe('');
    });

    it('should register onChange callback', () => {
      const onChangeFn = vi.fn();
      component.registerOnChange(onChangeFn);
      
      // Simular un cambio de input
      const mockEvent = { target: { value: 'new value' } } as unknown as Event;
      component.onInputChange(mockEvent);
      
      expect(onChangeFn).toHaveBeenCalledWith('new value');
    });

    it('should register onTouched callback', () => {
      const onTouchedFn = vi.fn();
      component.registerOnTouched(onTouchedFn);
      
      expect(component['onTouched']).toBe(onTouchedFn);
    });
  });

  describe('Debounce functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should emit debouncedSearch after debounce time', () => {
      const debounceSpy = vi.fn();
      component.debouncedSearch.subscribe(debounceSpy);
      
      // Simular escritura
      const mockEvent = { target: { value: 'test' } } as unknown as Event;
      component.onInputChange(mockEvent);
      
      // Antes del debounce no debe emitir
      expect(debounceSpy).not.toHaveBeenCalled();
      
      // Avanzar el tiempo del debounce
      vi.advanceTimersByTime(350);
      
      // Después del debounce debe emitir
      expect(debounceSpy).toHaveBeenCalledWith('test');
    });

    it('should emit searchChange immediately on input', () => {
      const searchChangeSpy = vi.fn();
      component.searchChange.subscribe(searchChangeSpy);
      
      const mockEvent = { target: { value: 'immediate' } } as unknown as Event;
      component.onInputChange(mockEvent);
      
      expect(searchChangeSpy).toHaveBeenCalledWith('immediate');
    });

    it('should only emit once for rapid successive inputs (debounce)', () => {
      const debounceSpy = vi.fn();
      component.debouncedSearch.subscribe(debounceSpy);
      
      // Simular escritura rápida
      component.onInputChange({ target: { value: 't' } } as unknown as Event);
      component.onInputChange({ target: { value: 'te' } } as unknown as Event);
      component.onInputChange({ target: { value: 'tes' } } as unknown as Event);
      component.onInputChange({ target: { value: 'test' } } as unknown as Event);
      
      // Avanzar el tiempo del debounce
      vi.advanceTimersByTime(350);
      
      // Solo debe emitir el valor final
      expect(debounceSpy).toHaveBeenCalledTimes(1);
      expect(debounceSpy).toHaveBeenCalledWith('test');
    });

    it('should not emit if value does not change (distinctUntilChanged)', () => {
      const debounceSpy = vi.fn();
      component.debouncedSearch.subscribe(debounceSpy);
      
      // Primer input
      component.onInputChange({ target: { value: 'same' } } as unknown as Event);
      vi.advanceTimersByTime(350);
      
      // Mismo valor de nuevo
      component.onInputChange({ target: { value: 'same' } } as unknown as Event);
      vi.advanceTimersByTime(350);
      
      // Solo debe emitir una vez (distinctUntilChanged)
      expect(debounceSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component lifecycle', () => {
    it('should clean up subscriptions on destroy', () => {
      const destroySpy = vi.spyOn(component['destroy$'], 'next');
      const completeSpy = vi.spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Value updates', () => {
    it('should update internal value on input change', () => {
      const mockEvent = { target: { value: 'updated value' } } as unknown as Event;
      component.onInputChange(mockEvent);
      
      expect(component.value).toBe('updated value');
    });
  });
});



