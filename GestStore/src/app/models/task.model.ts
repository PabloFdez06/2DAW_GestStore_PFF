// Enums
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

// Interfaces de Usuario
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Interfaces de Task Product
export interface TaskProduct {
  id: number;
  productId: number;
  productName: string;
  quantityRequired: number;
  quantityUsed: number;
  notes?: string;
}

// Interface principal de Task
export interface Task {
  id: string | number;
  _id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  completed: boolean;
  important?: boolean;
  createdAt: string;
  updatedAt: string;
  assignedUser?: User;
  createdByUser: User;
  taskProducts?: TaskProduct[];
}

// DTO para crear/actualizar tareas
export interface TaskRequest {
  title: string;
  description: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  assignedUserId?: number;
  important?: boolean;
}

// Response wrapper de la API
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

// Para estadísticas
export interface TaskStatistics {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  overdueTasks: number;
  completionRate: number;
}
