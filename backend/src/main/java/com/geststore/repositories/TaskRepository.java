package com.geststore.repositories;

import com.geststore.models.entities.Task;
import com.geststore.models.entities.TaskStatus;
import com.geststore.models.entities.TaskPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Task
 * Proporciona métodos CRUD y consultas personalizadas para tareas
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Busca todas las tareas con un estado específico
     * @param status el estado de la tarea
     * @return lista de tareas con ese estado
     */
    List<Task> findByStatus(TaskStatus status);

    /**
     * Busca todas las tareas asignadas a un usuario
     * @param assignedUserId id del usuario asignado
     * @return lista de tareas del usuario
     */
    @Query("SELECT t FROM Task t WHERE t.assignedUser.id = :userId ORDER BY t.priority DESC, t.dueDate ASC")
    List<Task> findTasksByAssignedUser(@Param("userId") Long userId);

    /**
     * Busca todas las tareas creadas por un usuario
     * @param createdByUserId id del usuario que creó la tarea
     * @return lista de tareas creadas por ese usuario
     */
    @Query("SELECT t FROM Task t WHERE t.createdByUser.id = :userId ORDER BY t.createdAt DESC")
    List<Task> findTasksCreatedByUser(@Param("userId") Long userId);

    /**
     * Busca tareas sin asignar
     * @return lista de tareas sin usuario asignado
     */
    @Query("SELECT t FROM Task t WHERE t.assignedUser IS NULL AND t.status != 'CANCELLED' ORDER BY t.priority DESC")
    List<Task> findUnassignedTasks();

    /**
     * Busca tareas con prioridad específica
     * @param priority la prioridad
     * @return lista de tareas con esa prioridad
     */
    List<Task> findByPriority(TaskPriority priority);

    /**
     * Busca tareas con vencimiento próximo
     * @param dueDate fecha límite de búsqueda
     * @return lista de tareas con vencimiento antes de esa fecha
     */
    @Query("SELECT t FROM Task t WHERE t.dueDate <= :dueDate AND t.status != 'COMPLETED' AND t.status != 'CANCELLED' ORDER BY t.dueDate ASC")
    List<Task> findUpcomingTasks(@Param("dueDate") LocalDateTime dueDate);

    /**
     * Busca tareas vencidas no completadas
     * @return lista de tareas vencidas
     */
    @Query("SELECT t FROM Task t WHERE t.dueDate < CURRENT_TIMESTAMP AND t.status != 'COMPLETED' AND t.status != 'CANCELLED' ORDER BY t.dueDate ASC")
    List<Task> findOverdueTasks();

    /**
     * Busca tareas en progreso ordenadas por prioridad
     * @return lista de tareas en progreso
     */
    @Query("SELECT t FROM Task t WHERE t.status = 'IN_PROGRESS' ORDER BY t.priority DESC, t.dueDate ASC")
    List<Task> findTasksInProgress();

    /**
     * Busca tareas completadas en un rango de fechas
     * @param startDate fecha de inicio
     * @param endDate fecha de fin
     * @return lista de tareas completadas en ese rango
     */
    @Query("SELECT t FROM Task t WHERE t.status = 'COMPLETED' AND t.endDate BETWEEN :startDate AND :endDate ORDER BY t.endDate DESC")
    List<Task> findCompletedTasksBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * Busca tareas cuyo título contiene el texto buscado
     * @param searchText texto de búsqueda
     * @return lista de tareas que contienen ese texto
     */
    @Query("SELECT t FROM Task t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :searchText, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :searchText, '%')) ORDER BY t.priority DESC")
    List<Task> searchByTitleOrDescription(@Param("searchText") String searchText);

    /**
     * Cuenta las tareas por estado
     * @param status el estado
     * @return número de tareas con ese estado
     */
    Long countByStatus(TaskStatus status);

    /**
     * Encuentra tareas asignadas a un usuario con estado específico
     * @param userId id del usuario
     * @param status estado de la tarea
     * @return lista de tareas filtradas
     */
    @Query("SELECT t FROM Task t WHERE t.assignedUser.id = :userId AND t.status = :status ORDER BY t.priority DESC, t.dueDate ASC")
    List<Task> findTasksByAssignedUserAndStatus(@Param("userId") Long userId, @Param("status") TaskStatus status);

    /**
     * Busca tareas de alta prioridad sin completar
     * @return lista de tareas críticas
     */
    @Query("SELECT t FROM Task t WHERE t.priority = 'HIGH' AND t.status != 'COMPLETED' AND t.status != 'CANCELLED' ORDER BY t.dueDate ASC")
    List<Task> findHighPriorityActiveTasks();
}
