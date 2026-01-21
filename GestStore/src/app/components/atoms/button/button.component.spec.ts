/**
 * Tests unitarios para ButtonComponent
 * 
 * Este componente es un botón reutilizable con múltiples variantes,
 * tamaños y estados. Usa ChangeDetectionStrategy.OnPush para optimización.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ButtonComponent, ButtonVariant, ButtonSize } from './button.component';
import { By } from '@angular/platform-browser';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Inicialización', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have default values', () => {
      expect(component.variant).toBe('primary');
      expect(component.size).toBe('medium');
      expect(component.disabled).toBe(false);
      expect(component.fullWidth).toBe(false);
      expect(component.active).toBe(false);
      expect(component.iconPosition).toBe('left');
      expect(component.iconOnly).toBe(false);
      expect(component.type).toBe('button');
    });
  });

  describe('Variantes de botón', () => {
    const variants: ButtonVariant[] = ['primary', 'secondary', 'tertiary', 'outline', 'danger', 'success', 'warning', 'info', 'error', 'ghost', 'link', 'icon', 'nav'];

    variants.forEach(variant => {
      it(`should apply correct classes for variant: ${variant}`, () => {
        component.variant = variant;
        fixture.detectChanges();
        
        const classes = component.getButtonClasses();
        expect(classes).toContain(`button--${variant}`);
      });
    });
  });

  describe('Tamaños de botón', () => {
    const sizes: ButtonSize[] = ['small', 'medium', 'large'];

    sizes.forEach(size => {
      it(`should apply correct classes for size: ${size}`, () => {
        component.size = size;
        fixture.detectChanges();
        
        const classes = component.getButtonClasses();
        expect(classes).toContain(`button--${size}`);
      });
    });
  });

  describe('Estados del botón', () => {
    it('should apply full-width class when fullWidth is true', () => {
      component.fullWidth = true;
      fixture.detectChanges();
      
      const classes = component.getButtonClasses();
      expect(classes).toContain('button--full-width');
    });

    it('should apply active class when active is true', () => {
      component.active = true;
      fixture.detectChanges();
      
      const classes = component.getButtonClasses();
      expect(classes).toContain('button--active');
    });

    it('should apply icon-only class when iconOnly is true', () => {
      component.iconOnly = true;
      fixture.detectChanges();
      
      const classes = component.getButtonClasses();
      expect(classes).toContain('button--icon-only');
    });

    it('should apply with-icon class when icon is provided and not iconOnly', () => {
      component.icon = 'check';
      component.iconOnly = false;
      fixture.detectChanges();
      
      const classes = component.getButtonClasses();
      expect(classes).toContain('button--with-icon');
    });
  });

  describe('Eventos de click', () => {
    it('should emit clicked event when button is clicked and not disabled', () => {
      const clickSpy = vi.fn();
      component.clicked.subscribe(clickSpy);
      
      const mockEvent = new MouseEvent('click');
      component.onClick(mockEvent);
      
      expect(clickSpy).toHaveBeenCalledWith(mockEvent);
    });

    it('should NOT emit clicked event when button is disabled', () => {
      component.disabled = true;
      const clickSpy = vi.fn();
      component.clicked.subscribe(clickSpy);
      
      const mockEvent = new MouseEvent('click');
      component.onClick(mockEvent);
      
      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Accesibilidad', () => {
    it('should support aria-label input', () => {
      component.ariaLabel = 'Guardar cambios';
      fixture.detectChanges();
      
      expect(component.ariaLabel).toBe('Guardar cambios');
    });

    it('should have correct button type attribute', () => {
      component.type = 'submit';
      fixture.detectChanges();
      
      expect(component.type).toBe('submit');
    });
  });

  describe('getButtonClasses()', () => {
    it('should return base button class', () => {
      const classes = component.getButtonClasses();
      expect(classes).toContain('button');
    });

    it('should combine multiple classes correctly', () => {
      component.variant = 'danger';
      component.size = 'large';
      component.fullWidth = true;
      component.active = true;
      fixture.detectChanges();
      
      const classes = component.getButtonClasses();
      expect(classes).toContain('button');
      expect(classes).toContain('button--danger');
      expect(classes).toContain('button--large');
      expect(classes).toContain('button--full-width');
      expect(classes).toContain('button--active');
    });

    it('should not include empty strings in classes', () => {
      const classes = component.getButtonClasses();
      // No debe haber espacios dobles que indicarían strings vacíos
      expect(classes).not.toMatch(/  /);
    });
  });
});

