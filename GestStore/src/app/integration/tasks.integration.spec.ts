/**
 * Tests de integración para el flujo de tareas
 * 
 * Estos tests verifican el flujo completo de:
 * - CRUD de tareas
 * - Paginación e infinite scroll
 * - Actualización de estado en tiempo real
 * - Gestión de estado con Signals
 */
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TaskService, TaskPage } from '../services/task.service';
import { Task, TaskStatus, TaskPriority, TaskRequest, TaskStatistics } from '../models/task.model';

describe('Task Flow Integration Tests', () => {
  let taskService: TaskService;
  let httpMock: HttpTestingController;

  const mockCreatedByUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER'
  };

  const createMockTask = (overrides: Partial<Task> = {}): Task => ({
    id: '1',
    title: 'Tarea de prueba',
    description: 'Descripción de la tarea',
    status: 'PENDING' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    important: false,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByUser: mockCreatedByUser,
    ...overrides
  });

  const createMockTaskPage = (tasks: Task[], page: number = 0, totalPages: number = 1): TaskPage => ({
    content: tasks,
    totalElements: tasks.length,
    totalPages,
    size: 10,
    number: page,
    first: page === 0,
    last: page === totalPages - 1
  });

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        TaskService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    taskService = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Complete Task CRUD Flow', () => {
    it('should complete full create-read-update-delete flow', () => {
      const newTask = createMockTask({ id: 'new-1', title: 'Nueva Tarea' });
      
      // CREATE
      const createRequest: TaskRequest = {
        title: 'Nueva Tarea',
        description: 'Descripción',
        priority: 'HIGH' as TaskPriority
      };
      
      taskService.createTask(createRequest).subscribe(task => {
        expect(task.title).toBe('Nueva Tarea');
      });
      
      httpMock.expectOne('/api/tasks').flush({ data: newTask });
expect(taskService.tasks().length).toBe(1);
      expect(taskService.tasks()[0].id).toBe('new-1');
      
      // READ
      taskService.getTaskById('new-1').subscribe(task => {
        expect(task.title).toBe('Nueva Tarea');
      });
      
      httpMock.expectOne('/api/tasks/new-1').flush({ data: newTask });
// UPDATE
      const updateRequest: TaskRequest = {
        title: 'Tarea Actualizada',
        description: 'Nueva descripción',
        priority: 'LOW' as TaskPriority
      };
      
      const updatedTask = { ...newTask, ...updateRequest };
      
      taskService.updateTask('new-1', updateRequest).subscribe(task => {
        expect(task.title).toBe('Tarea Actualizada');
      });
      
      httpMock.expectOne('/api/tasks/new-1').flush({ data: updatedTask });
expect(taskService.tasks()[0].title).toBe('Tarea Actualizada');
      
      // DELETE
      taskService.deleteTask('new-1').subscribe();
      
      httpMock.expectOne('/api/tasks/new-1').flush(null);
expect(taskService.tasks().length).toBe(0);
    });
  });

  describe('Task Status Workflow', () => {
    it('should transition task through complete workflow: PENDING -> IN_PROGRESS -> COMPLETED', () => {
      const task = createMockTask({ status: 'PENDING' as TaskStatus });
      taskService.setTasks([task]);
      
      // Start task (PENDING -> IN_PROGRESS)
      taskService.startTask('1').subscribe();
      
      httpMock.expectOne('/api/tasks/1/start').flush({
        data: { ...task, status: 'IN_PROGRESS' }
      });
expect(taskService.tasks()[0].status).toBe('IN_PROGRESS');
      expect(taskService.inProgressCount()).toBe(1);
      
      // Complete task (IN_PROGRESS -> COMPLETED)
      taskService.completeTask('1').subscribe();
      
      httpMock.expectOne('/api/tasks/1/complete').flush({
        data: { ...task, status: 'COMPLETED' }
      });
expect(taskService.tasks()[0].status).toBe('COMPLETED');
      expect(taskService.completedCount()).toBe(1);
      expect(taskService.inProgressCount()).toBe(0);
    });

    it('should handle task cancellation', () => {
      const task = createMockTask({ status: 'IN_PROGRESS' as TaskStatus });
      taskService.setTasks([task]);
      
      taskService.cancelTask('1').subscribe();
      
      httpMock.expectOne('/api/tasks/1/cancel').flush({
        data: { ...task, status: 'CANCELLED' }
      });
expect(taskService.tasks()[0].status).toBe('CANCELLED');
    });
  });

  describe('Important Task Management', () => {
    it('should toggle important flag correctly', () => {
      const task = createMockTask({ important: false });
      taskService.setTasks([task]);
      
      expect(taskService.importantCount()).toBe(0);
      
      // Mark as important
      taskService.markAsImportant('1').subscribe();
      
      httpMock.expectOne('/api/tasks/1').flush({
        data: { ...task, important: true }
      });
expect(taskService.tasks()[0].important).toBe(true);
      expect(taskService.importantCount()).toBe(1);
      
      // Remove important
      taskService.removeImportant('1').subscribe();
      
      httpMock.expectOne('/api/tasks/1').flush({
        data: { ...task, important: false }
      });
expect(taskService.tasks()[0].important).toBe(false);
      expect(taskService.importantCount()).toBe(0);
    });
  });

  describe('Pagination and Infinite Scroll', () => {
    it('should handle infinite scroll pagination correctly', () => {
      // Primera página
      const page1Tasks = [
        createMockTask({ id: '1', title: 'Tarea 1' }),
        createMockTask({ id: '2', title: 'Tarea 2' })
      ];
      
      taskService.getTasksPaginated(0, 2).subscribe();
      
      httpMock.expectOne('/api/tasks?page=0&size=2').flush({
        data: createMockTaskPage(page1Tasks, 0, 3)
      });
expect(taskService.tasks().length).toBe(2);
      expect(taskService.currentPage()).toBe(0);
      expect(taskService.hasMorePages()).toBe(true);
      
      // Segunda página
      const page2Tasks = [
        createMockTask({ id: '3', title: 'Tarea 3' }),
        createMockTask({ id: '4', title: 'Tarea 4' })
      ];
      
      taskService.getTasksPaginated(1, 2).subscribe();
      
      httpMock.expectOne('/api/tasks?page=1&size=2').flush({
        data: createMockTaskPage(page2Tasks, 1, 3)
      });
// Debe agregar las nuevas tareas
      expect(taskService.tasks().length).toBe(4);
      expect(taskService.currentPage()).toBe(1);
      expect(taskService.hasMorePages()).toBe(true);
      
      // Última página
      const page3Tasks = [
        createMockTask({ id: '5', title: 'Tarea 5' })
      ];
      
      taskService.getTasksPaginated(2, 2).subscribe();
      
      httpMock.expectOne('/api/tasks?page=2&size=2').flush({
        data: createMockTaskPage(page3Tasks, 2, 3)
      });
expect(taskService.tasks().length).toBe(5);
      expect(taskService.hasMorePages()).toBe(false);
    });

    it('should not duplicate tasks in infinite scroll', () => {
      const task = createMockTask({ id: '1', title: 'Tarea 1' });
      
      // Primera carga
      taskService.getTasksPaginated(0, 10).subscribe();
      httpMock.expectOne('/api/tasks?page=0&size=10').flush({
        data: createMockTaskPage([task], 0, 2)
      });
// Segunda carga con mismo elemento (simula duplicado)
      taskService.getTasksPaginated(1, 10).subscribe();
      httpMock.expectOne('/api/tasks?page=1&size=10').flush({
        data: createMockTaskPage([task], 1, 2)
      });
// No debe duplicar
      expect(taskService.tasks().length).toBe(1);
    });

    it('should refresh tasks and reset to first page', () => {
      // Cargar algunas tareas
      taskService.setTasks([
        createMockTask({ id: '1' }),
        createMockTask({ id: '2' }),
        createMockTask({ id: '3' })
      ]);
      
      // Refresh
      const freshTasks = [createMockTask({ id: 'new-1', title: 'Fresh Task' })];
      
      taskService.refreshTasks().subscribe();
      
      httpMock.expectOne('/api/tasks?page=0&size=10').flush({
        data: createMockTaskPage(freshTasks, 0, 1)
      });
// Debe reemplazar todas las tareas
      expect(taskService.tasks().length).toBe(1);
      expect(taskService.tasks()[0].id).toBe('new-1');
    });
  });

  describe('Search Integration', () => {
    it('should search tasks and return results', () => {
      const searchResults = [
        createMockTask({ id: '1', title: 'Tarea importante' }),
        createMockTask({ id: '2', title: 'Otra tarea importante' })
      ];
      
      taskService.searchTasks('importante').subscribe(results => {
        expect(results.length).toBe(2);
        expect(results[0].title).toContain('importante');
      });
      
      httpMock.expectOne('/api/tasks/search?q=importante').flush({
        data: searchResults
      });
});
  });

  describe('Statistics Integration', () => {
    it('should fetch and store statistics', () => {
      const stats: TaskStatistics = {
        totalTasks: 100,
        pendingTasks: 50,
        inProgressTasks: 30,
        completedTasks: 20,
        cancelledTasks: 0,
        overdueTasks: 5,
        completionRate: 20
      };
      
      taskService.getTaskStatistics().subscribe(result => {
        expect(result.totalTasks).toBe(100);
      });
      
      httpMock.expectOne('/api/tasks/statistics').flush({ data: stats });
expect(taskService.statistics()).toEqual(stats);
    });
  });

  describe('Computed Signals Integration', () => {
    it('should update all computed signals when tasks change', () => {
      const tasks = [
        createMockTask({ id: '1', status: 'PENDING' as TaskStatus, important: true }),
        createMockTask({ id: '2', status: 'PENDING' as TaskStatus, important: false }),
        createMockTask({ id: '3', status: 'IN_PROGRESS' as TaskStatus, important: true }),
        createMockTask({ id: '4', status: 'COMPLETED' as TaskStatus, important: false }),
        createMockTask({ id: '5', status: 'COMPLETED' as TaskStatus, important: true })
      ];
      
      taskService.setTasks(tasks);
      
      expect(taskService.pendingCount()).toBe(2);
      expect(taskService.inProgressCount()).toBe(1);
      expect(taskService.completedCount()).toBe(2);
      expect(taskService.importantCount()).toBe(3);
    });

    it('should recalculate counts when individual task is updated', () => {
      const task = createMockTask({ id: '1', status: 'PENDING' as TaskStatus });
      taskService.setTasks([task]);
      
      expect(taskService.pendingCount()).toBe(1);
      expect(taskService.completedCount()).toBe(0);
      
      // Complete the task
      taskService.completeTask('1').subscribe();
      
      httpMock.expectOne('/api/tasks/1/complete').flush({
        data: { ...task, status: 'COMPLETED' }
      });
expect(taskService.pendingCount()).toBe(0);
      expect(taskService.completedCount()).toBe(1);
    });
  });

  describe('Observable and Signal Sync', () => {
    it('should keep tasks$ observable in sync with signal', () => {
      return new Promise<void>((resolve) => {
        const task = createMockTask({ id: '1' });
        
        const emissions: Task[][] = [];
        taskService.tasks$.subscribe(tasks => {
          emissions.push([...tasks]);
          
          if (emissions.length === 2) {
            expect(emissions[0].length).toBe(0);
            expect(emissions[1].length).toBe(1);
            expect(emissions[1][0].id).toBe('1');
            resolve();
          }
        });
        
        taskService.setTasks([task]);
      });
    });
  });
});


