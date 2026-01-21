/**
 * Tests unitarios para TaskCardComponent
 * 
 * Este componente representa una tarjeta de tarea con estado,
 * prioridad, menú y diferentes variantes de visualización.
 * Usa ChangeDetectionStrategy.OnPush para optimización.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TaskCardComponent, TaskCardStatus, TaskCardPriority, TaskCardVariant } from './task-card.component';

describe('TaskCardComponent', () => {
  let component: TaskCardComponent;
  let fixture: ComponentFixture<TaskCardComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TaskCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
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

    it('should have default values', () => {
      expect(component.title).toBe('');
      expect(component.description).toBe('');
      expect(component.status).toBe('PENDING');
      expect(component.priority).toBe('MEDIUM');
      expect(component.important).toBe(false);
      expect(component.variant).toBe('default');
      expect(component.showMenu).toBe(true);
      expect(component.isMenuOpen).toBe(false);
    });
  });

  describe('Status labels', () => {
    it('should return correct label for COMPLETED status', () => {
      component.status = 'COMPLETED';
      expect(component.getStatusLabel()).toBe('Completada');
    });

    it('should return correct label for PENDING status', () => {
      component.status = 'PENDING';
      expect(component.getStatusLabel()).toBe('Pendiente');
    });

    it('should return correct label for IN_PROGRESS status', () => {
      component.status = 'IN_PROGRESS';
      expect(component.getStatusLabel()).toBe('En progreso');
    });

    it('should return correct label for CANCELLED status', () => {
      component.status = 'CANCELLED';
      expect(component.getStatusLabel()).toBe('Cancelada');
    });

    it('should return correct label for NOT_STARTED status', () => {
      component.status = 'NOT_STARTED';
      expect(component.getStatusLabel()).toBe('Sin comenzar');
    });

    it('should return default label for unknown status', () => {
      component.status = 'UNKNOWN' as TaskCardStatus;
      expect(component.getStatusLabel()).toBe('Pendiente');
    });
  });

  describe('Priority labels', () => {
    it('should return correct label for HIGH priority', () => {
      component.priority = 'HIGH';
      expect(component.getPriorityLabel()).toBe('Alta');
    });

    it('should return correct label for MEDIUM priority', () => {
      component.priority = 'MEDIUM';
      expect(component.getPriorityLabel()).toBe('Media');
    });

    it('should return correct label for LOW priority', () => {
      component.priority = 'LOW';
      expect(component.getPriorityLabel()).toBe('Baja');
    });

    it('should return default label for unknown priority', () => {
      component.priority = 'UNKNOWN' as TaskCardPriority;
      expect(component.getPriorityLabel()).toBe('Media');
    });
  });

  describe('CSS Classes', () => {
    it('should return correct status class for COMPLETED', () => {
      component.status = 'COMPLETED';
      expect(component.getStatusClass()).toBe('completed');
    });

    it('should return correct status class for IN_PROGRESS', () => {
      component.status = 'IN_PROGRESS';
      expect(component.getStatusClass()).toBe('inprogress');
    });

    it('should return correct status class for NOT_STARTED', () => {
      component.status = 'NOT_STARTED';
      expect(component.getStatusClass()).toBe('notstarted');
    });

    it('should return correct priority class for each priority', () => {
      component.priority = 'HIGH';
      expect(component.getPriorityClass()).toBe('high');
      
      component.priority = 'MEDIUM';
      expect(component.getPriorityClass()).toBe('medium');
      
      component.priority = 'LOW';
      expect(component.getPriorityClass()).toBe('low');
    });
  });

  describe('Date formatting', () => {
    it('should format date string correctly', () => {
      const result = component.formatDate('2025-01-15T10:30:00');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should format Date object correctly', () => {
      const date = new Date(2025, 0, 15); // 15 Enero 2025
      const result = component.formatDate(date);
      expect(result).toBe('15/01/2025');
    });

    it('should return empty string for undefined date', () => {
      expect(component.formatDate(undefined)).toBe('');
    });
  });

  describe('Completed ago calculation', () => {
    it('should return "hoy" for tasks completed today', () => {
      component.completedAt = new Date();
      expect(component.getCompletedAgo()).toBe('hoy');
    });

    it('should return "1 día" for tasks completed yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      component.completedAt = yesterday;
      expect(component.getCompletedAgo()).toBe('1 día');
    });

    it('should return "X días" for tasks completed X days ago', () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - 5);
      component.completedAt = daysAgo;
      expect(component.getCompletedAgo()).toBe('5 días');
    });

    it('should return empty string when completedAt is undefined', () => {
      component.completedAt = undefined;
      expect(component.getCompletedAgo()).toBe('');
    });

    it('should handle string dates', () => {
      component.completedAt = new Date().toISOString();
      expect(component.getCompletedAgo()).toBe('hoy');
    });
  });

  describe('Event emitters', () => {
    it('should emit cardClick on card click', () => {
      const clickSpy = vi.fn();
      component.cardClick.subscribe(clickSpy);
      
      component.onCardClick();
      
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should emit menuToggle and stop propagation', () => {
      const toggleSpy = vi.fn();
      component.menuToggle.subscribe(toggleSpy);
      
      const mockEvent = { stopPropagation: vi.fn() } as unknown as MouseEvent;
      component.onMenuToggle(mockEvent);
      
      expect(toggleSpy).toHaveBeenCalledWith(mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should emit menuClick and stop propagation', () => {
      const menuClickSpy = vi.fn();
      component.menuClick.subscribe(menuClickSpy);
      
      const mockEvent = { stopPropagation: vi.fn() } as unknown as MouseEvent;
      component.onMenuClick(mockEvent);
      
      expect(menuClickSpy).toHaveBeenCalledWith(mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Variants', () => {
    const variants: TaskCardVariant[] = ['default', 'grid', 'compact'];

    variants.forEach(variant => {
      it(`should accept variant: ${variant}`, () => {
        component.variant = variant;
        fixture.detectChanges();
        expect(component.variant).toBe(variant);
      });
    });
  });

  describe('Input bindings', () => {
    it('should accept all input properties', () => {
      component.title = 'Test Task';
      component.description = 'This is a test description';
      component.status = 'COMPLETED';
      component.priority = 'HIGH';
      component.imageUrl = 'https://example.com/image.jpg';
      component.important = true;
      component.createdAt = new Date();
      component.completedAt = new Date();
      
      fixture.detectChanges();
      
      expect(component.title).toBe('Test Task');
      expect(component.description).toBe('This is a test description');
      expect(component.status).toBe('COMPLETED');
      expect(component.priority).toBe('HIGH');
      expect(component.imageUrl).toBe('https://example.com/image.jpg');
      expect(component.important).toBe(true);
      expect(component.createdAt).toBeDefined();
      expect(component.completedAt).toBeDefined();
    });
  });
});

