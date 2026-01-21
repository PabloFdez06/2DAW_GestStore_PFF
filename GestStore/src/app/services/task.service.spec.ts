/**
 * Tests unitarios para TaskService
 * 
 * Este servicio gestiona las tareas con:
 * - Estado reactivo usando Signals
 * - Paginación e infinite scroll
 * - Operaciones CRUD con actualización de estado local
 * - Mocks de HTTP para testing
 */
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TaskService, TaskPage } from './task.service';
import { Task, TaskStatus, TaskPriority, TaskRequest, TaskStatistics } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  // Mock de usuario creador
  const mockCreatedByUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER'
  };

  // Mock de tarea
  const mockTask: Task = {
    id: '1',
    title: 'Tarea de prueba',
    description: 'Descripción de la tarea',
    status: 'PENDING' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    important: false,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByUser: mockCreatedByUser
  };

  // Mock de página de tareas
  const mockTaskPage: TaskPage = {
    content: [mockTask],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true
  };

  // Mock de estadísticas
  const mockStatistics: TaskStatistics = {
    totalTasks: 10,
    pendingTasks: 5,
    inProgressTasks: 3,
    completedTasks: 2,
    cancelledTasks: 0,
    overdueTasks: 1,
    completionRate: 20
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Inicialización', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have initial empty state', () => {
      expect(service.tasks()).toEqual([]);
      expect(service.isLoading()).toBe(false);
      expect(service.error()).toBeNull();
      expect(service.currentPage()).toBe(0);
      expect(service.totalPages()).toBe(0);
    });

    it('should have computed signals for counts', () => {
      expect(service.pendingCount()).toBe(0);
      expect(service.inProgressCount()).toBe(0);
      expect(service.completedCount()).toBe(0);
      expect(service.importantCount()).toBe(0);
    });
  });

  describe('getTasksPaginated', () => {
    it('should fetch tasks with pagination', () => {
      service.getTasksPaginated(0, 10).subscribe(page => {
        expect(page.content).toEqual([mockTask]);
        expect(page.totalElements).toBe(1);
      });

      const req = httpMock.expectOne('/api/tasks?page=0&size=10');
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockTaskPage });
      });

    it('should update signals after fetching', () => {
      service.getTasksPaginated(0, 10).subscribe();

      const req = httpMock.expectOne('/api/tasks?page=0&size=10');
      req.flush({ data: mockTaskPage });
      expect(service.tasks()).toEqual([mockTask]);
      expect(service.currentPage()).toBe(0);
      expect(service.totalPages()).toBe(1);
      expect(service.isLoading()).toBe(false);
    });

    it('should replace tasks on first page', () => {
      service.setTasks([{ ...mockTask, id: 'old' }]);
      
      service.getTasksPaginated(0, 10).subscribe();

      const req = httpMock.expectOne('/api/tasks?page=0&size=10');
      req.flush({ data: mockTaskPage });
      expect(service.tasks().length).toBe(1);
      expect(service.tasks()[0].id).toBe('1');
    });

    it('should append tasks on subsequent pages (infinite scroll)', () => {
      service.setTasks([mockTask]);
      
      const newTask = { ...mockTask, id: '2', title: 'Segunda tarea' };
      const secondPage = { ...mockTaskPage, content: [newTask], number: 1 };

      service.getTasksPaginated(1, 10).subscribe();

      const req = httpMock.expectOne('/api/tasks?page=1&size=10');
      req.flush({ data: secondPage });
      expect(service.tasks().length).toBe(2);
      expect(service.tasks()[1].id).toBe('2');
    });

    it('should avoid duplicates in infinite scroll', () => {
      service.setTasks([mockTask]);
      
      const secondPage = { ...mockTaskPage, number: 1 };

      service.getTasksPaginated(1, 10).subscribe();

      const req = httpMock.expectOne('/api/tasks?page=1&size=10');
      req.flush({ data: secondPage });
      // No debe duplicar la tarea
      expect(service.tasks().length).toBe(1);
    });
  });

  describe('getTaskById', () => {
    it('should fetch a task by ID', () => {
      service.getTaskById('1').subscribe(task => {
        expect(task).toEqual(mockTask);
      });

      const req = httpMock.expectOne('/api/tasks/1');
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockTask });
      });
  });

  describe('createTask', () => {
    it('should create a task and add to state', () => {
      const taskRequest: TaskRequest = {
        title: 'Nueva tarea',
        description: 'Descripción',
        priority: 'HIGH' as TaskPriority
      };

      service.createTask(taskRequest).subscribe(task => {
        expect(task.title).toBe('Nueva tarea');
      });

      const req = httpMock.expectOne('/api/tasks');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(taskRequest);
      req.flush({ data: { ...mockTask, ...taskRequest } });
      expect(service.tasks().length).toBe(1);
    });

    it('should add X-User-Id header when user is in localStorage', () => {
      // Simular usuario en localStorage (debe estar antes de la llamada)
      const mockUser = { id: 'user123', name: 'Test User' };
      localStorage.setItem('currentUser', JSON.stringify(mockUser));

      const taskRequest: TaskRequest = {
        title: 'Nueva tarea',
        description: 'Descripción',
        priority: 'HIGH' as TaskPriority
      };

      service.createTask(taskRequest).subscribe();

      const req = httpMock.expectOne('/api/tasks');
      expect(req.request.headers.get('X-User-Id')).toBe('user123');
      req.flush({ data: mockTask });
      });
  });

  describe('updateTask', () => {
    it('should update a task and update state', () => {
      service.setTasks([mockTask]);

      const updateRequest: TaskRequest = {
        title: 'Tarea actualizada',
        description: 'Nueva descripción',
        priority: 'HIGH' as TaskPriority
      };

      service.updateTask('1', updateRequest).subscribe(task => {
        expect(task.title).toBe('Tarea actualizada');
      });

      const req = httpMock.expectOne('/api/tasks/1');
      expect(req.request.method).toBe('PUT');
      req.flush({ data: { ...mockTask, ...updateRequest } });
      expect(service.tasks()[0].title).toBe('Tarea actualizada');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task and remove from state', () => {
      service.setTasks([mockTask]);
      expect(service.tasks().length).toBe(1);

      service.deleteTask('1').subscribe();

      const req = httpMock.expectOne('/api/tasks/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
      expect(service.tasks().length).toBe(0);
    });
  });

  describe('Task status actions', () => {
    beforeEach(() => {
      service.setTasks([mockTask]);
    });

    it('should start a task', () => {
      service.startTask('1').subscribe(task => {
        expect(task.status).toBe('IN_PROGRESS');
      });

      const req = httpMock.expectOne('/api/tasks/1/start');
      expect(req.request.method).toBe('POST');
      req.flush({ data: { ...mockTask, status: 'IN_PROGRESS' } });
      });

    it('should complete a task', () => {
      service.completeTask('1').subscribe(task => {
        expect(task.status).toBe('COMPLETED');
      });

      const req = httpMock.expectOne('/api/tasks/1/complete');
      expect(req.request.method).toBe('POST');
      req.flush({ data: { ...mockTask, status: 'COMPLETED' } });
      });

    it('should cancel a task', () => {
      service.cancelTask('1').subscribe(task => {
        expect(task.status).toBe('CANCELLED');
      });

      const req = httpMock.expectOne('/api/tasks/1/cancel');
      expect(req.request.method).toBe('POST');
      req.flush({ data: { ...mockTask, status: 'CANCELLED' } });
      });
  });

  describe('Important tasks', () => {
    beforeEach(() => {
      service.setTasks([mockTask]);
    });

    it('should mark task as important', () => {
      service.markAsImportant('1').subscribe(task => {
        expect(task.important).toBe(true);
      });

      const req = httpMock.expectOne('/api/tasks/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ important: true });
      req.flush({ data: { ...mockTask, important: true } });
      });

    it('should remove important mark', () => {
      service.removeImportant('1').subscribe(task => {
        expect(task.important).toBe(false);
      });

      const req = httpMock.expectOne('/api/tasks/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ important: false });
      req.flush({ data: { ...mockTask, important: false } });
      });
  });

  describe('searchTasks', () => {
    it('should search tasks with query', () => {
      service.searchTasks('prueba').subscribe(tasks => {
        expect(tasks).toEqual([mockTask]);
      });

      const req = httpMock.expectOne('/api/tasks/search?q=prueba');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [mockTask] });
      });
  });

  describe('getTaskStatistics', () => {
    it('should fetch and store statistics', () => {
      service.getTaskStatistics().subscribe(stats => {
        expect(stats.totalTasks).toBe(10);
        expect(stats.pendingTasks).toBe(5);
      });

      const req = httpMock.expectOne('/api/tasks/statistics');
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockStatistics });
      expect(service.statistics()).toEqual(mockStatistics);
    });
  });

  describe('Computed signals', () => {
    it('should update pendingCount when tasks change', () => {
      const tasks: Task[] = [
        { ...mockTask, id: '1', status: 'PENDING' as TaskStatus },
        { ...mockTask, id: '2', status: 'PENDING' as TaskStatus },
        { ...mockTask, id: '3', status: 'COMPLETED' as TaskStatus }
      ];
      service.setTasks(tasks);

      expect(service.pendingCount()).toBe(2);
    });

    it('should update inProgressCount when tasks change', () => {
      const tasks: Task[] = [
        { ...mockTask, id: '1', status: 'IN_PROGRESS' as TaskStatus },
        { ...mockTask, id: '2', status: 'PENDING' as TaskStatus }
      ];
      service.setTasks(tasks);

      expect(service.inProgressCount()).toBe(1);
    });

    it('should update completedCount when tasks change', () => {
      const tasks: Task[] = [
        { ...mockTask, id: '1', status: 'COMPLETED' as TaskStatus },
        { ...mockTask, id: '2', status: 'COMPLETED' as TaskStatus },
        { ...mockTask, id: '3', status: 'COMPLETED' as TaskStatus }
      ];
      service.setTasks(tasks);

      expect(service.completedCount()).toBe(3);
    });

    it('should update importantCount when tasks change', () => {
      const tasks: Task[] = [
        { ...mockTask, id: '1', important: true },
        { ...mockTask, id: '2', important: true },
        { ...mockTask, id: '3', important: false }
      ];
      service.setTasks(tasks);

      expect(service.importantCount()).toBe(2);
    });

    it('should calculate hasMorePages correctly', () => {
      const multiPageData = { ...mockTaskPage, number: 0, totalPages: 3 };
      
      service.getTasksPaginated(0, 10).subscribe();
      httpMock.expectOne('/api/tasks?page=0&size=10').flush({ data: multiPageData });
      expect(service.hasMorePages()).toBe(true);
    });

    it('should return false for hasMorePages on last page', () => {
      const lastPageData = { ...mockTaskPage, number: 2, totalPages: 3 };
      
      service.getTasksPaginated(2, 10).subscribe();
      httpMock.expectOne('/api/tasks?page=2&size=10').flush({ data: lastPageData });
      expect(service.hasMorePages()).toBe(false);
    });
  });

  describe('State management', () => {
    it('should update tasks$ observable when setTasks is called', () => {
      return new Promise<void>((resolve) => {
        service.tasks$.subscribe(tasks => {
          if (tasks.length > 0) {
            expect(tasks[0].id).toBe('1');
            resolve();
          }
        });

        service.setTasks([mockTask]);
      });
    });

    it('should clear error with clearError', () => {
      service['errorSignal'].set('Some error');
      expect(service.error()).toBe('Some error');
      
      service.clearError();
      expect(service.error()).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle HTTP errors', () => {
      let errorCaught = false;
      
      service.getTaskById('999').subscribe({
        error: () => {
          errorCaught = true;
        }
      });

      // El servicio tiene retry(1), así que necesitamos responder a 2 requests
      const req = httpMock.expectOne('/api/tasks/999');
      req.error(new ErrorEvent('Network error'));
      
      // Segunda petición por el retry
      const retryReq = httpMock.expectOne('/api/tasks/999');
      retryReq.error(new ErrorEvent('Network error'));
      
      expect(errorCaught).toBe(true);
    });
  });
});


