package com.geststore.services;

import com.geststore.exceptions.BusinessLogicException;
import com.geststore.exceptions.ResourceNotFoundException;
import com.geststore.models.dtos.TaskRequestDto;
import com.geststore.models.dtos.TaskResponseDto;
import com.geststore.models.dtos.TaskProductResponseDto;
import com.geststore.models.dtos.ProductResponseDto;
import com.geststore.models.entities.*;
import com.geststore.repositories.TaskRepository;
import com.geststore.repositories.UserRepository;
import com.geststore.repositories.TaskProductRepository;
import com.geststore.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Servicio de lógica de negocio para tareas
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final TaskProductRepository taskProductRepository;

    private static final int MAX_ACTIVE_TASKS_PER_WORKER = 10;

    /**
     * Obtiene todas las tareas (paginado)
     */
    public Page<TaskResponseDto> getAllTasks(Pageable pageable) {
        log.info("Obteniendo todas las tareas, página: {}", pageable.getPageNumber());
        Page<Task> tasks = taskRepository.findAll(pageable);
        return tasks.map(this::convertToDto);
    }
    
    /**
     * Obtiene todas las tareas sin paginación
     */
    public List<TaskResponseDto> getAllTasksList() {
        log.info("Obteniendo todas las tareas sin paginación");
        List<Task> tasks = taskRepository.findAll();
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene una tarea por ID
     */
    public TaskResponseDto getTaskById(String id) {
        log.info("Buscando tarea con ID: {}", id);
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", id));
        return convertToDto(task);
    }

    /**
     * Obtiene tareas de un usuario asignado
     */
    public List<TaskResponseDto> getTasksByAssignedUser(String userId) {
        log.info("Obteniendo tareas asignadas al usuario ID: {}", userId);

        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", userId));

        List<Task> tasks = taskRepository.findTasksByAssignedUser(userId);
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene tareas creadas por un usuario
     */
    public List<TaskResponseDto> getTasksCreatedByUser(String userId) {
        log.info("Obteniendo tareas creadas por usuario ID: {}", userId);

        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", userId));

        List<Task> tasks = taskRepository.findTasksCreatedByUser(userId);
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene tareas sin asignar
     */
    public List<TaskResponseDto> getUnassignedTasks() {
        log.info("Obteniendo tareas sin asignar");
        List<Task> tasks = taskRepository.findUnassignedTasks();
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene tareas en progreso
     */
    public List<TaskResponseDto> getTasksInProgress() {
        log.info("Obteniendo tareas en progreso");
        List<Task> tasks = taskRepository.findTasksInProgress();
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene tareas vencidas sin completar
     */
    public List<TaskResponseDto> getOverdueTasks() {
        log.info("Obteniendo tareas vencidas");
        List<Task> tasks = taskRepository.findOverdueTasks();
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene tareas de alta prioridad sin completar
     */
    public List<TaskResponseDto> getHighPriorityActiveTasks() {
        log.info("Obteniendo tareas de alta prioridad activas");
        List<Task> tasks = taskRepository.findHighPriorityActiveTasks();
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Crea una nueva tarea
     */
    public TaskResponseDto createTask(TaskRequestDto requestDto, String createdByUserId) {
        log.info("Creando nueva tarea");

        User createdByUser = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario creador", createdByUserId));

        User assignedUser = null;
        if (requestDto.getAssignedUserId() != null) {
            assignedUser = userRepository.findById(requestDto.getAssignedUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario asignado", requestDto.getAssignedUserId()));
        }

        Task task = Task.builder()
                .title(requestDto.getTitle())
                .description(requestDto.getDescription())
                .status(requestDto.getStatus() != null ? requestDto.getStatus() : TaskStatus.PENDING)
                .priority(requestDto.getPriority() != null ? requestDto.getPriority() : TaskPriority.MEDIUM)
                .dueDate(requestDto.getDueDate())
                .startDate(requestDto.getStartDate())
                .endDate(requestDto.getEndDate())
                .notes(requestDto.getNotes())
                .completed(false)
                .assignedUser(assignedUser)
                .createdByUser(createdByUser)
                .build();

        task.onCreate();
        Task savedTask = taskRepository.save(task);
        log.info("Tarea creada exitosamente con ID: {}", savedTask.getId());

        return convertToDto(savedTask);
    }

    /**
     * Actualiza una tarea
     */
    public TaskResponseDto updateTask(String id, TaskRequestDto requestDto) {
        log.info("Actualizando tarea con ID: {}", id);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", id));

        if (requestDto.getAssignedUserId() != null &&
                (task.getAssignedUser() == null || !task.getAssignedUser().getId().equals(requestDto.getAssignedUserId()))) {

            User newAssignedUser = userRepository.findById(requestDto.getAssignedUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario", requestDto.getAssignedUserId()));

            task.setAssignedUser(newAssignedUser);
        }

        task.setTitle(requestDto.getTitle());
        task.setDescription(requestDto.getDescription());
        task.setStatus(requestDto.getStatus() != null ? requestDto.getStatus() : task.getStatus());
        task.setPriority(requestDto.getPriority() != null ? requestDto.getPriority() : task.getPriority());
        task.setDueDate(requestDto.getDueDate());
        task.setNotes(requestDto.getNotes());
        task.onUpdate();

        Task updatedTask = taskRepository.save(task);
        log.info("Tarea actualizada exitosamente con ID: {}", id);

        return convertToDto(updatedTask);
    }

    /**
     * Inicia una tarea
     */
    public TaskResponseDto startTask(String id) {
        log.info("Iniciando tarea con ID: {}", id);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", id));

        if (!task.getStatus().equals(TaskStatus.PENDING)) {
            throw new BusinessLogicException(
                    "Solo se pueden iniciar tareas con estado PENDING",
                    "INVALID_TASK_STATE"
            );
        }

        task.setStatus(TaskStatus.IN_PROGRESS);
        task.setStartDate(LocalDateTime.now());
        task.onUpdate();

        Task updatedTask = taskRepository.save(task);
        log.info("Tarea iniciada exitosamente");

        return convertToDto(updatedTask);
    }

    /**
     * Completa una tarea
     */
    public TaskResponseDto completeTask(String id) {
        log.info("Completando tarea con ID: {}", id);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", id));

        if (!task.getStatus().equals(TaskStatus.IN_PROGRESS)) {
            throw new BusinessLogicException(
                    "Solo se pueden completar tareas en estado IN_PROGRESS",
                    "INVALID_TASK_STATE"
            );
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setCompleted(true);
        task.setEndDate(LocalDateTime.now());
        task.onUpdate();

        Task updatedTask = taskRepository.save(task);
        log.info("Tarea completada exitosamente");

        return convertToDto(updatedTask);
    }

    /**
     * Cancela una tarea
     */
    public TaskResponseDto cancelTask(String id) {
        log.info("Cancelando tarea con ID: {}", id);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", id));

        if (task.getStatus().equals(TaskStatus.COMPLETED)) {
            throw new BusinessLogicException(
                    "No se puede cancelar una tarea completada",
                    "INVALID_TASK_STATE"
            );
        }

        task.setStatus(TaskStatus.CANCELLED);
        task.onUpdate();
        Task updatedTask = taskRepository.save(task);
        log.info("Tarea cancelada exitosamente");

        return convertToDto(updatedTask);
    }

    /**
     * Busca tareas por título o descripción
     */
    public List<TaskResponseDto> searchTasks(String searchText) {
        log.info("Buscando tareas con texto: {}", searchText);
        List<Task> tasks = taskRepository.searchByTitleOrDescription(searchText);
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene estadísticas de tareas
     */
    @Transactional(readOnly = true)
    public TaskStatistics getTaskStatistics() {
        log.info("Obteniendo estadísticas de tareas");

        long totalTasks = taskRepository.count();
        long pendingTasks = taskRepository.countByStatus(TaskStatus.PENDING);
        long inProgressTasks = taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
        long completedTasks = taskRepository.countByStatus(TaskStatus.COMPLETED);
        long cancelledTasks = taskRepository.countByStatus(TaskStatus.CANCELLED);

        List<Task> overdueTasks = taskRepository.findOverdueTasks();

        return TaskStatistics.builder()
                .totalTasks(totalTasks)
                .pendingTasks(pendingTasks)
                .inProgressTasks(inProgressTasks)
                .completedTasks(completedTasks)
                .cancelledTasks(cancelledTasks)
                .overdueTasksCount((long) overdueTasks.size())
                .build();
    }

    /**
     * Convierte una entidad Task a TaskResponseDto
     */
    private TaskResponseDto convertToDto(Task task) {
        Set<TaskProductResponseDto> taskProductDtos = task.getTaskProducts() != null ?
                task.getTaskProducts().stream()
                        .map(tp -> TaskProductResponseDto.builder()
                                .id(tp.getId())
                                .quantity(tp.getQuantity())
                                .quantityUsed(tp.getQuantityUsed())
                                .notes(tp.getNotes())
                                .createdAt(tp.getCreatedAt())
                                .product(convertProductToDto(tp.getProduct()))
                                .build())
                        .collect(Collectors.toSet())
                : Set.of();

        return TaskResponseDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .startDate(task.getStartDate())
                .endDate(task.getEndDate())
                .notes(task.getNotes())
                .completed(task.getCompleted())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .assignedUser(task.getAssignedUser() != null ? convertUserToDto(task.getAssignedUser()) : null)
                .createdByUser(task.getCreatedByUser() != null ? convertUserToDto(task.getCreatedByUser()) : null)
                .taskProducts(taskProductDtos)
                .build();
    }

    private com.geststore.models.dtos.UserResponseDto convertUserToDto(User user) {
        return com.geststore.models.dtos.UserResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(user.getPhone())
                .department(user.getDepartment())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private ProductResponseDto convertProductToDto(Product product) {
        return ProductResponseDto.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .description(product.getDescription())
                .unitPrice(product.getUnitPrice())
                .category(product.getCategory())
                .active(product.getActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .stockQuantity(product.getStockQuantity())
                .minStockLevel(product.getMinStockLevel())
                .locationInWarehouse(product.getLocationInWarehouse())
                .build();
    }

    /**
     * DTO para estadísticas de tareas
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class TaskStatistics {
        private long totalTasks;
        private long pendingTasks;
        private long inProgressTasks;
        private long completedTasks;
        private long cancelledTasks;
        private long overdueTasksCount;
    }
}
