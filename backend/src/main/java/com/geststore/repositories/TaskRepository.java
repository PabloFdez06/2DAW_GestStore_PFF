package com.geststore.repositories;

import com.geststore.models.entities.Task;
import com.geststore.models.entities.TaskStatus;
import com.geststore.models.entities.TaskPriority;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para la entidad Task
 * Proporciona métodos CRUD y consultas personalizadas para tareas
 */
@Repository
public interface TaskRepository extends MongoRepository<Task, String> {

    /**
     * Busca todas las tareas con un estado específico
     */
    List<Task> findByStatus(TaskStatus status);

    /**
     * Busca todas las tareas asignadas a un usuario
     */
    @Query("{'assignedUser.$id': ObjectId(?0)}")
    List<Task> findTasksByAssignedUser(String userId);

    /**
     * Busca todas las tareas creadas por un usuario
     */
    @Query("{'createdByUser.$id': ObjectId(?0)}")
    List<Task> findTasksCreatedByUser(String userId);

    /**
     * Busca tareas sin asignar
     */
    @Query("{'assignedUser': null, 'status': {$ne: 'CANCELLED'}}")
    List<Task> findUnassignedTasks();

    /**
     * Busca tareas con prioridad específica
     */
    List<Task> findByPriority(TaskPriority priority);

    /**
     * Busca tareas con vencimiento próximo
     */
    @Query("{'dueDate': {$lte: ?0}, 'status': {$nin: ['COMPLETED', 'CANCELLED']}}")
    List<Task> findUpcomingTasks(LocalDateTime dueDate);

    /**
     * Busca tareas vencidas no completadas
     */
    @Query("{'dueDate': {$lt: new Date()}, 'status': {$nin: ['COMPLETED', 'CANCELLED']}}")
    List<Task> findOverdueTasks();

    /**
     * Busca tareas en progreso ordenadas por prioridad
     */
    List<Task> findByStatusOrderByPriorityDescDueDateAsc(TaskStatus status);

    /**
     * Método helper para tareas en progreso
     */
    default List<Task> findTasksInProgress() {
        return findByStatusOrderByPriorityDescDueDateAsc(TaskStatus.IN_PROGRESS);
    }

    /**
     * Busca tareas completadas en un rango de fechas
     */
    @Query("{'status': 'COMPLETED', 'endDate': {$gte: ?0, $lte: ?1}}")
    List<Task> findCompletedTasksBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Busca tareas cuyo título contiene el texto buscado
     */
    @Query("{ $or: [ {'title': {$regex: ?0, $options: 'i'}}, {'description': {$regex: ?0, $options: 'i'}} ] }")
    List<Task> searchByTitleOrDescription(String searchText);

    /**
     * Cuenta las tareas por estado
     */
    Long countByStatus(TaskStatus status);

    /**
     * Encuentra tareas asignadas a un usuario con estado específico
     */
    @Query("{'assignedUser.$id': ObjectId(?0), 'status': ?1}")
    List<Task> findTasksByAssignedUserAndStatus(String userId, TaskStatus status);

    /**
     * Busca tareas de alta prioridad sin completar
     */
    @Query("{'priority': 'HIGH', 'status': {$nin: ['COMPLETED', 'CANCELLED']}}")
    List<Task> findHighPriorityActiveTasks();
}
