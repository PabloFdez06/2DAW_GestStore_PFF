/**
 * Tests unitarios para NotificationService
 * 
 * Este servicio gestiona las notificaciones de la aplicación
 * usando Signals de Angular para un estado reactivo.
 */
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NotificationService, NotificationType, Notification } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService]
    });

    service = TestBed.inject(NotificationService);
    
    // Usar fake timers para controlar setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Inicialización', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should start with empty notifications', () => {
      expect(service.notifications()).toEqual([]);
    });
  });

  describe('show', () => {
    it('should add a notification', () => {
      service.show('Test message');
      
      const notifications = service.notifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].message).toBe('Test message');
    });

    it('should use default type "info" when not specified', () => {
      service.show('Test message');
      
      expect(service.notifications()[0].type).toBe('info');
    });

    it('should accept custom type', () => {
      service.show('Error message', 'error');
      
      expect(service.notifications()[0].type).toBe('error');
    });

    it('should use default duration of 4000ms', () => {
      service.show('Test message');
      
      expect(service.notifications()[0].duration).toBe(4000);
    });

    it('should accept custom duration', () => {
      service.show('Test message', 'info', 5000);
      
      expect(service.notifications()[0].duration).toBe(5000);
    });

    it('should auto-dismiss after duration', () => {
      service.show('Auto dismiss', 'info', 3000);
      
      expect(service.notifications().length).toBe(1);
      
      vi.advanceTimersByTime(3000);
      
      expect(service.notifications().length).toBe(0);
    });

    it('should not auto-dismiss when duration is 0', () => {
      service.show('Persistent notification', 'info', 0);
      
      vi.advanceTimersByTime(10000);
      
      expect(service.notifications().length).toBe(1);
    });

    it('should assign unique IDs to notifications', () => {
      service.show('First');
      service.show('Second');
      service.show('Third');
      
      const ids = service.notifications().map(n => n.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(3);
    });
  });

  describe('success', () => {
    it('should create success notification', () => {
      service.success('Operation completed');
      
      const notification = service.notifications()[0];
      expect(notification.type).toBe('success');
      expect(notification.message).toBe('Operation completed');
    });

    it('should use default duration of 4000ms', () => {
      service.success('Success');
      
      expect(service.notifications()[0].duration).toBe(4000);
    });

    it('should accept custom duration', () => {
      service.success('Success', 2000);
      
      expect(service.notifications()[0].duration).toBe(2000);
    });
  });

  describe('error', () => {
    it('should create error notification', () => {
      service.error('Something went wrong');
      
      const notification = service.notifications()[0];
      expect(notification.type).toBe('error');
      expect(notification.message).toBe('Something went wrong');
    });

    it('should use default duration of 5000ms (longer for errors)', () => {
      service.error('Error');
      
      expect(service.notifications()[0].duration).toBe(5000);
    });
  });

  describe('warning', () => {
    it('should create warning notification', () => {
      service.warning('Please be careful');
      
      const notification = service.notifications()[0];
      expect(notification.type).toBe('warning');
      expect(notification.message).toBe('Please be careful');
    });

    it('should use default duration of 4500ms', () => {
      service.warning('Warning');
      
      expect(service.notifications()[0].duration).toBe(4500);
    });
  });

  describe('info', () => {
    it('should create info notification', () => {
      service.info('Here is some information');
      
      const notification = service.notifications()[0];
      expect(notification.type).toBe('info');
      expect(notification.message).toBe('Here is some information');
    });

    it('should use default duration of 4000ms', () => {
      service.info('Info');
      
      expect(service.notifications()[0].duration).toBe(4000);
    });
  });

  describe('dismiss', () => {
    it('should remove a specific notification by ID', () => {
      service.show('First');
      service.show('Second');
      service.show('Third');
      
      const notifications = service.notifications();
      const idToRemove = notifications[1].id;
      
      service.dismiss(idToRemove);
      
      const remaining = service.notifications();
      expect(remaining.length).toBe(2);
      expect(remaining.find(n => n.id === idToRemove)).toBeUndefined();
    });

    it('should not affect other notifications', () => {
      service.show('First');
      service.show('Second');
      
      const firstId = service.notifications()[0].id;
      service.dismiss(firstId);
      
      expect(service.notifications()[0].message).toBe('Second');
    });

    it('should handle dismissing non-existent ID gracefully', () => {
      service.show('Test');
      
      expect(() => service.dismiss(999)).not.toThrow();
      expect(service.notifications().length).toBe(1);
    });
  });

  describe('dismissAll', () => {
    it('should remove all notifications', () => {
      service.show('First');
      service.show('Second');
      service.show('Third');
      
      expect(service.notifications().length).toBe(3);
      
      service.dismissAll();
      
      expect(service.notifications().length).toBe(0);
    });

    it('should work on empty list', () => {
      expect(() => service.dismissAll()).not.toThrow();
      expect(service.notifications().length).toBe(0);
    });
  });

  describe('Multiple notifications', () => {
    it('should handle multiple notifications simultaneously', () => {
      service.success('Task created');
      service.info('New update available');
      service.warning('Low stock');
      service.error('Connection lost');
      
      const notifications = service.notifications();
      expect(notifications.length).toBe(4);
      
      const types = notifications.map(n => n.type);
      expect(types).toContain('success');
      expect(types).toContain('info');
      expect(types).toContain('warning');
      expect(types).toContain('error');
    });

    it('should dismiss notifications independently', () => {
      service.show('First', 'info', 1000);
      service.show('Second', 'info', 2000);
      service.show('Third', 'info', 3000);
      
      expect(service.notifications().length).toBe(3);
      
      vi.advanceTimersByTime(1000);
      expect(service.notifications().length).toBe(2);
      
      vi.advanceTimersByTime(1000);
      expect(service.notifications().length).toBe(1);
      
      vi.advanceTimersByTime(1000);
      expect(service.notifications().length).toBe(0);
    });
  });

  describe('Signal reactivity', () => {
    it('should update computed notifications when adding', () => {
      const initialLength = service.notifications().length;
      
      service.show('New notification');
      
      expect(service.notifications().length).toBe(initialLength + 1);
    });

    it('should update computed notifications when removing', () => {
      service.show('To be removed');
      const id = service.notifications()[0].id;
      
      service.dismiss(id);
      
      expect(service.notifications().length).toBe(0);
    });
  });
});

