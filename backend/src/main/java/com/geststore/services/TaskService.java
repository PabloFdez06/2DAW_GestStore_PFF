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
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
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
        log.info("Creando nueva tarea para usuario ID: {}", createdByUserId);

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
        if (requestDto.getImportant() != null) {
            task.setImportant(requestDto.getImportant());
        }
        task.onUpdate();

        Task updatedTask = taskRepository.save(task);
        log.info("Tarea actualizada exitosamente con ID: {}", id);

        return convertToDto(updatedTask);
    }

    /**
     * Actualiza parcialmente una tarea (PATCH)
     */
    public TaskResponseDto patchTask(String id, java.util.Map<String, Object> updates) {
        log.info("Actualizando parcialmente tarea con ID: {}", id);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", id));

        // Actualizar solo los campos proporcionados
        updates.forEach((key, value) -> {
            switch (key) {
                case "isImportant":
                case "important":
                    task.setImportant((Boolean) value);
                    log.info("Actualizando important a: {}", value);
                    break;
                case "title":
                    task.setTitle((String) value);
                    break;
                case "description":
                    task.setDescription((String) value);
                    break;
                case "notes":
                    task.setNotes((String) value);
                    break;
                // Agregar más campos según sea necesario
                default:
                    log.warn("Campo desconocido en PATCH: {}", key);
            }
        });

        task.onUpdate();
        Task updatedTask = taskRepository.save(task);
        log.info("Tarea actualizada parcialmente con éxito");

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

        if (task.getStatus().equals(TaskStatus.COMPLETED)) {
            throw new BusinessLogicException(
                    "La tarea ya está completada",
                    "TASK_ALREADY_COMPLETED"
            );
        }

        if (task.getStatus().equals(TaskStatus.CANCELLED)) {
            throw new BusinessLogicException(
                    "No se puede completar una tarea cancelada",
                    "TASK_CANCELLED"
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
     * Elimina una tarea permanentemente
     */
    public void deleteTask(String id) {
        log.info("Eliminando tarea con ID: {}", id);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", id));

        // Eliminar relaciones con productos si existen
        taskProductRepository.deleteByTaskId(id);
        
        taskRepository.delete(task);
        log.info("Tarea eliminada exitosamente con ID: {}", id);
    }

    /**
     * Actualiza la imagen de una tarea a partir de un archivo (multipart/form-data).
     * Se persiste como Data URL base64 en el campo "imageUrl".
     */
    public TaskResponseDto updateTaskImage(String taskId, MultipartFile file) {
        log.info("Actualizando imagen de la tarea con ID: {}", taskId);

        if (file == null || file.isEmpty()) {
            throw new BusinessLogicException("El archivo de imagen es obligatorio", "INVALID_FILE");
        }

        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            throw new BusinessLogicException("No se pudo determinar el tipo de archivo", "INVALID_FILE_TYPE");
        }

        boolean allowed = contentType.equals("image/png")
                || contentType.equals("image/jpeg")
                || contentType.equals("image/svg+xml")
                || contentType.equals("image/webp");

        if (!allowed) {
            throw new BusinessLogicException(
                    "Formato no soportado. Usa PNG, JPG, SVG o WEBP",
                    "INVALID_FILE_TYPE"
            );
        }

        long maxBytes = 2L * 1024L * 1024L;
        if (file.getSize() > maxBytes) {
            throw new BusinessLogicException("La imagen es demasiado grande (máx 2MB)", "FILE_TOO_LARGE");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", taskId));

        try {
            byte[] bytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            String dataUrl = "data:" + contentType + ";base64," + base64;

            task.setImageUrl(dataUrl);
            task.onUpdate();
            Task updatedTask = taskRepository.save(task);
            log.info("Imagen de tarea actualizada exitosamente");
            return convertToDto(updatedTask);
        } catch (IOException e) {
            throw new BusinessLogicException("No se pudo leer el archivo de imagen", "FILE_READ_ERROR");
        }
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

        // Calcular tasa de completitud
        double completionRate = totalTasks > 0 ? Math.round((completedTasks * 100.0 / totalTasks) * 100) / 100.0 : 0;

        return TaskStatistics.builder()
                .totalTasks(totalTasks)
                .pendingTasks(pendingTasks)
                .inProgressTasks(inProgressTasks)
                .completedTasks(completedTasks)
                .cancelledTasks(cancelledTasks)
                .overdueTasksCount((long) overdueTasks.size())
                .completionRate(completionRate)
                .build();
    }

    /**
     * Obtiene las estadísticas de tareas para un usuario específico
     */
    public TaskStatistics getTaskStatisticsByUser(String userId) {
        log.info("Obteniendo estadísticas de tareas para usuario ID: {}", userId);

        // Verificar que el usuario existe
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", userId));

        // Obtener todas las tareas del usuario (creadas o asignadas)
        List<Task> createdTasks = taskRepository.findTasksCreatedByUser(userId);
        List<Task> assignedTasks = taskRepository.findTasksByAssignedUser(userId);
        
        // Combinar y eliminar duplicados
        Set<String> taskIds = new HashSet<>();
        List<Task> allUserTasks = new ArrayList<>();
        
        for (Task task : createdTasks) {
            if (taskIds.add(task.getId())) {
                allUserTasks.add(task);
            }
        }
        
        for (Task task : assignedTasks) {
            if (taskIds.add(task.getId())) {
                allUserTasks.add(task);
            }
        }

        // Calcular estadísticas
        long totalTasks = allUserTasks.size();
        long pendingTasks = allUserTasks.stream().filter(t -> t.getStatus() == TaskStatus.PENDING).count();
        long inProgressTasks = allUserTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long completedTasks = allUserTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long cancelledTasks = allUserTasks.stream().filter(t -> t.getStatus() == TaskStatus.CANCELLED).count();
        
        LocalDateTime now = LocalDateTime.now();
        long overdueTasks = allUserTasks.stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(now) 
                        && t.getStatus() != TaskStatus.COMPLETED && t.getStatus() != TaskStatus.CANCELLED)
                .count();

        // Calcular tasa de completitud
        double completionRate = totalTasks > 0 ? Math.round((completedTasks * 100.0 / totalTasks) * 100) / 100.0 : 0;

        return TaskStatistics.builder()
                .totalTasks(totalTasks)
                .pendingTasks(pendingTasks)
                .inProgressTasks(inProgressTasks)
                .completedTasks(completedTasks)
                .cancelledTasks(cancelledTasks)
                .overdueTasksCount(overdueTasks)
                .completionRate(completionRate)
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
                .important(task.getImportant())
                .imageUrl(task.getImageUrl())
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
        private double completionRate;
    }
}
