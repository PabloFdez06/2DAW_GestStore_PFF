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
import com.geststore.repositories.StockRepository;
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
 * Maneja operaciones CRUD y validaciones complejas
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final TaskProductRepository taskProductRepository;
    private final StockService stockService;

    private static final int MAX_ACTIVE_TASKS_PER_WORKER = 10;

    /**
     * Obtiene todas las tareas
     */
    public Page<TaskResponseDto> getAllTasks(Pageable pageable) {
        log.info("Obteniendo todas las tareas, página: {}", pageable.getPageNumber());
        Page<Task> tasks = taskRepository.findAll(pageable);
        return tasks.map(this::convertToDto);
    }

    /**
     * Obtiene una tarea por ID
     */
    public TaskResponseDto getTaskById(Long id) {
        log.info("Buscando tarea con ID: {}", id);
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", id));
        return convertToDto(task);
    }

    /**
     * Obtiene tareas de un usuario asignado
     */
    public List<TaskResponseDto> getTasksByAssignedUser(Long userId) {
        log.info("Obteniendo tareas asignadas al usuario ID: {}", userId);

        // Validar que el usuario existe
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
    public List<TaskResponseDto> getTasksCreatedByUser(Long userId) {
        log.info("Obteniendo tareas creadas por usuario ID: {}", userId);

        // Validar que el usuario existe
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
     * LÓGICA DE NEGOCIO:
     * - La tarea debe tener un usuario creador
     * - Si se asigna a un usuario, no puede tener más de MAX_ACTIVE_TASKS activas
     * - Si la tarea tiene productos, reserva automáticamente el stock
     */
    public TaskResponseDto createTask(TaskRequestDto requestDto, Long createdByUserId) {
        log.info("Creando nueva tarea");

        // Validar usuario creador
        User createdByUser = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario creador", createdByUserId));

        // Validar usuario asignado (si se proporciona)
        User assignedUser = null;
        if (requestDto.getAssignedUserId() != null) {
            assignedUser = userRepository.findById(requestDto.getAssignedUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario asignado", requestDto.getAssignedUserId()));

            // LÓGICA DE NEGOCIO: No permitir asignar más tareas activas
            validateMaxActiveTasks(assignedUser);
        }

        // Crear tarea
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

        Task savedTask = taskRepository.save(task);
        log.info("Tarea creada exitosamente con ID: {}", savedTask.getId());

        return convertToDto(savedTask);
    }

    /**
     * Actualiza una tarea
     */
    public TaskResponseDto updateTask(Long id, TaskRequestDto requestDto) {
        log.info("Actualizando tarea con ID: {}", id);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", id));

        // Si cambia el usuario asignado, validar
        if (requestDto.getAssignedUserId() != null &&
                (task.getAssignedUser() == null || !task.getAssignedUser().getId().equals(requestDto.getAssignedUserId()))) {

            User newAssignedUser = userRepository.findById(requestDto.getAssignedUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario", requestDto.getAssignedUserId()));

            validateMaxActiveTasks(newAssignedUser);
            task.setAssignedUser(newAssignedUser);
        }

        task.setTitle(requestDto.getTitle());
        task.setDescription(requestDto.getDescription());
        task.setStatus(requestDto.getStatus() != null ? requestDto.getStatus() : task.getStatus());
        task.setPriority(requestDto.getPriority() != null ? requestDto.getPriority() : task.getPriority());
        task.setDueDate(requestDto.getDueDate());
        task.setNotes(requestDto.getNotes());

        Task updatedTask = taskRepository.save(task);
        log.info("Tarea actualizada exitosamente con ID: {}", id);

        return convertToDto(updatedTask);
    }

    /**
     * Inicia una tarea (cambia estado a IN_PROGRESS)
     */
    public TaskResponseDto startTask(Long id) {
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

        Task updatedTask = taskRepository.save(task);
        log.info("Tarea iniciada exitosamente");

        return convertToDto(updatedTask);
    }

    /**
     * Completa una tarea
     * LÓGICA DE NEGOCIO:
     * - Solo se pueden completar tareas en IN_PROGRESS
     * - Todos los productos deben ser utilizados (quantityUsed == quantity)
     */
    public TaskResponseDto completeTask(Long id) {
        log.info("Completando tarea con ID: {}", id);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", id));

        if (!task.getStatus().equals(TaskStatus.IN_PROGRESS)) {
            throw new BusinessLogicException(
                    "Solo se pueden completar tareas en estado IN_PROGRESS",
                    "INVALID_TASK_STATE"
            );
        }

        // Validar que todos los productos se hayan utilizado
        boolean allProductsUsed = task.getTaskProducts().stream()
                .allMatch(tp -> tp.getQuantityUsed().equals(tp.getQuantity()));

        if (!allProductsUsed) {
            throw new BusinessLogicException(
                    "No se puede completar la tarea. Todos los productos deben ser utilizados completamente.",
                    "INCOMPLETE_PRODUCTS"
            );
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setCompleted(true);
        task.setEndDate(LocalDateTime.now());

        // Liberar stock reservado y descontar lo utilizado
        for (TaskProduct tp : task.getTaskProducts()) {
            Stock stock = tp.getProduct().getStock();
            // Descontar del reservado
            stockService.releaseReservedStock(stock.getId(), tp.getQuantityUsed());
        }

        Task updatedTask = taskRepository.save(task);
        log.info("Tarea completada exitosamente");

        return convertToDto(updatedTask);
    }

    /**
     * Cancela una tarea
     */
    public TaskResponseDto cancelTask(Long id) {
        log.info("Cancelando tarea con ID: {}", id);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", id));

        if (task.getStatus().equals(TaskStatus.COMPLETED)) {
            throw new BusinessLogicException(
                    "No se puede cancelar una tarea completada",
                    "INVALID_TASK_STATE"
            );
        }

        // Liberar stock reservado
        for (TaskProduct tp : task.getTaskProducts()) {
            Stock stock = tp.getProduct().getStock();
            stockService.releaseReservedStock(stock.getId(), tp.getQuantity() - tp.getQuantityUsed());
        }

        task.setStatus(TaskStatus.CANCELLED);
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
     * LÓGICA DE NEGOCIO: Valida que un usuario no tenga más de MAX_ACTIVE_TASKS activas
     * Similar al ejemplo de biblioteca: no permitir más de X tareas activas
     */
    private void validateMaxActiveTasks(User user) {
        long activeTasksCount = user.getAssignedTasks().stream()
                .filter(task -> !task.getStatus().equals(TaskStatus.COMPLETED) &&
                              !task.getStatus().equals(TaskStatus.CANCELLED))
                .count();

        if (activeTasksCount >= MAX_ACTIVE_TASKS_PER_WORKER) {
            throw new BusinessLogicException(
                    "El usuario ya tiene " + MAX_ACTIVE_TASKS_PER_WORKER + " tareas activas. No se pueden asignar más.",
                    "MAX_ACTIVE_TASKS_EXCEEDED"
            );
        }
    }

    /**
     * Convierte una entidad Task a TaskResponseDto
     */
    private TaskResponseDto convertToDto(Task task) {
        Set<TaskProductResponseDto> taskProductDtos = task.getTaskProducts().stream()
                .map(tp -> TaskProductResponseDto.builder()
                        .id(tp.getId())
                        .quantity(tp.getQuantity())
                        .quantityUsed(tp.getQuantityUsed())
                        .notes(tp.getNotes())
                        .createdAt(tp.getCreatedAt())
                        .product(convertProductToDto(tp.getProduct()))
                        .build())
                .collect(Collectors.toSet());

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
                .createdByUser(convertUserToDto(task.getCreatedByUser()))
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
