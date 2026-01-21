/**
 * Tests unitarios para DebounceInputDirective
 * 
 * Esta directiva aplica debounce a inputs de búsqueda,
 * evitando peticiones excesivas mientras el usuario escribe.
 */
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { By } from '@angular/platform-browser';
import { DebounceInputDirective } from './debounce-input.directive';

// Componente de prueba que usa la directiva
@Component({
  standalone: true,
  imports: [DebounceInputDirective],
  template: `
    <input
      appDebounceInput
      [debounceTime]="debounceTime"
      (debounceValue)="onDebounceValue($event)"
    />
  `
})
class TestHostComponent {
  debounceTime = 300;
  receivedValue = '';
  
  onDebounceValue(value: string): void {
    this.receivedValue = value;
  }
}

describe('DebounceInputDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let inputEl: DebugElement;
  let directive: DebounceInputDirective;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, DebounceInputDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    inputEl = fixture.debugElement.query(By.directive(DebounceInputDirective));
    directive = inputEl.injector.get(DebounceInputDirective);
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Inicialización', () => {
    it('should create the directive', () => {
      expect(directive).toBeTruthy();
    });

    it('should have default debounce time of 300ms', () => {
      expect(directive.debounceTime).toBe(300);
    });
  });

  describe('Debounce behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should NOT emit value immediately on input', () => {
      const onValueSpy = vi.fn();
      directive.debounceValue.subscribe(onValueSpy);
      
      const inputEvent = new Event('input');
      Object.defineProperty(inputEvent, 'target', { value: { value: 'test' } });
      directive.onInput(inputEvent);
      
      // No debe emitir inmediatamente
      expect(onValueSpy).not.toHaveBeenCalled();
    });

    it('should emit value after debounce time', () => {
      const onValueSpy = vi.fn();
      directive.debounceValue.subscribe(onValueSpy);
      
      // Simular evento de input
      const inputEvent = new Event('input');
      Object.defineProperty(inputEvent, 'target', { value: { value: 'test' } });
      directive.onInput(inputEvent);
      
      // Antes del debounce
      expect(onValueSpy).not.toHaveBeenCalled();
      
      // Avanzar el tiempo del debounce
      vi.advanceTimersByTime(350);
      
      // Después del debounce
      expect(onValueSpy).toHaveBeenCalledWith('test');
    });

    it('should only emit last value during rapid typing', () => {
      const onValueSpy = vi.fn();
      directive.debounceValue.subscribe(onValueSpy);
      
      // Simular escritura rápida
      const values = ['t', 'te', 'tes', 'test'];
      values.forEach((value) => {
        const inputEvent = new Event('input');
        Object.defineProperty(inputEvent, 'target', { value: { value } });
        directive.onInput(inputEvent);
      });
      
      // Avanzar el tiempo del debounce
      vi.advanceTimersByTime(350);
      
      // Solo debe emitir el último valor
      expect(onValueSpy).toHaveBeenCalledTimes(1);
      expect(onValueSpy).toHaveBeenCalledWith('test');
    });

    it('should NOT emit if value has not changed (distinctUntilChanged)', () => {
      const onValueSpy = vi.fn();
      directive.debounceValue.subscribe(onValueSpy);
      
      // Primera entrada
      const inputEvent1 = new Event('input');
      Object.defineProperty(inputEvent1, 'target', { value: { value: 'same' } });
      directive.onInput(inputEvent1);
      vi.advanceTimersByTime(350);
      
      // Segunda entrada con el mismo valor
      const inputEvent2 = new Event('input');
      Object.defineProperty(inputEvent2, 'target', { value: { value: 'same' } });
      directive.onInput(inputEvent2);
      vi.advanceTimersByTime(350);
      
      // Solo debe emitir una vez
      expect(onValueSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom debounce time', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should respect custom debounce time', () => {
      // Obtener la directiva antes de cambiar el tiempo
      const onValueSpy = vi.fn();
      directive.debounceValue.subscribe(onValueSpy);
      
      // El debounce time por defecto es 300ms
      const inputEvent = new Event('input');
      Object.defineProperty(inputEvent, 'target', { value: { value: 'default' } });
      directive.onInput(inputEvent);
      
      // No debe emitir antes de los 300ms
      vi.advanceTimersByTime(250);
      expect(onValueSpy).not.toHaveBeenCalled();
      
      // Debe emitir después de 300ms (tiempo por defecto)
      vi.advanceTimersByTime(100);
      expect(onValueSpy).toHaveBeenCalledWith('default');
    });
  });

  describe('Component cleanup', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should complete subscriptions on destroy', () => {
      const destroySpy = vi.spyOn(directive['destroy$'], 'next');
      const completeSpy = vi.spyOn(directive['destroy$'], 'complete');
      
      directive.ngOnDestroy();
      
      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should not emit after destroy', () => {
      const onValueSpy = vi.fn();
      directive.debounceValue.subscribe(onValueSpy);
      
      const inputEvent = new Event('input');
      Object.defineProperty(inputEvent, 'target', { value: { value: 'test' } });
      directive.onInput(inputEvent);
      
      // Destruir antes del debounce
      directive.ngOnDestroy();
      
      // Avanzar el tiempo
      vi.advanceTimersByTime(350);
      
      // No debe emitir después de destruir
      expect(onValueSpy).not.toHaveBeenCalled();
    });
  });

  describe('Input event handling', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should extract value from input event target', () => {
      const inputSpy = vi.spyOn(directive['input$'], 'next');
      
      const inputEvent = new Event('input');
      Object.defineProperty(inputEvent, 'target', { value: { value: 'extracted value' } });
      directive.onInput(inputEvent);
      
      expect(inputSpy).toHaveBeenCalledWith('extracted value');
    });

    it('should handle empty input', () => {
      const onValueSpy = vi.fn();
      directive.debounceValue.subscribe(onValueSpy);
      
      const inputEvent = new Event('input');
      Object.defineProperty(inputEvent, 'target', { value: { value: '' } });
      directive.onInput(inputEvent);
      
      vi.advanceTimersByTime(350);
      expect(onValueSpy).toHaveBeenCalledWith('');
    });
  });

  describe('Integration with host component', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should update host component value after debounce', () => {
      const inputNative = inputEl.nativeElement as HTMLInputElement;
      inputNative.value = 'integration test';
      inputNative.dispatchEvent(new Event('input'));
      
      vi.advanceTimersByTime(350);
      expect(component.receivedValue).toBe('integration test');
    });
  });
});



