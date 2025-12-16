package com.geststore.controllers;

import com.geststore.models.dtos.TaskRequestDto;
import com.geststore.models.dtos.TaskResponseDto;
import com.geststore.services.TaskService;
import com.geststore.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

/**
 * Controlador REST para operaciones con tareas
 * Endpoints: /api/tasks
 * 
 * LÓGICA DE NEGOCIO IMPLEMENTADA:
 * - No permitir asignar más de 10 tareas activas a un trabajador
 * - Validar stock disponible al asignar productos
 * - No permitir completar tarea sin usar todos los productos
 * - Liberar stock reservado al cancelar tarea
 */
@Slf4j
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Validated
public class TaskController {

    private final TaskService taskService;

    /**
     * GET /api/tasks - Obtener todas las tareas (paginado)
     * Acceso: ADMIN, MANAGER, WORKER
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<Page<TaskResponseDto>>> getAllTasks(Pageable pageable) {
        log.info("GET /api/tasks - Obteniendo todas las tareas");
        Page<TaskResponseDto> tasks = taskService.getAllTasks(pageable);
        return ResponseEntity.ok(ApiResponse.success("Tareas obtenidas exitosamente", tasks));
    }

    /**
     * GET /api/tasks/{id} - Obtener una tarea por ID
     * Acceso: ADMIN, MANAGER, WORKER (solo su propia tarea)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<TaskResponseDto>> getTaskById(@PathVariable Long id) {
        log.info("GET /api/tasks/{} - Obteniendo tarea", id);
        TaskResponseDto task = taskService.getTaskById(id);
        return ResponseEntity.ok(ApiResponse.success("Tarea obtenida exitosamente", task));
    }

    /**
     * GET /api/tasks/user/{userId} - Obtener tareas asignadas a un usuario
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getTasksByAssignedUser(@PathVariable Long userId) {
        log.info("GET /api/tasks/user/{} - Obteniendo tareas del usuario", userId);
        List<TaskResponseDto> tasks = taskService.getTasksByAssignedUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Tareas obtenidas exitosamente", tasks));
    }

    /**
     * GET /api/tasks/created-by/{userId} - Obtener tareas creadas por un usuario
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/created-by/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getTasksCreatedByUser(@PathVariable Long userId) {
        log.info("GET /api/tasks/created-by/{} - Obteniendo tareas creadas", userId);
        List<TaskResponseDto> tasks = taskService.getTasksCreatedByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Tareas obtenidas exitosamente", tasks));
    }

    /**
     * GET /api/tasks/unassigned - Obtener tareas sin asignar
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/unassigned")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getUnassignedTasks() {
        log.info("GET /api/tasks/unassigned - Obteniendo tareas sin asignar");
        List<TaskResponseDto> tasks = taskService.getUnassignedTasks();
        return ResponseEntity.ok(ApiResponse.success("Tareas sin asignar obtenidas", tasks));
    }

    /**
     * GET /api/tasks/in-progress - Obtener tareas en progreso
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/in-progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getTasksInProgress() {
        log.info("GET /api/tasks/in-progress - Obteniendo tareas en progreso");
        List<TaskResponseDto> tasks = taskService.getTasksInProgress();
        return ResponseEntity.ok(ApiResponse.success("Tareas en progreso obtenidas", tasks));
    }

    /**
     * GET /api/tasks/overdue - Obtener tareas vencidas
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getOverdueTasks() {
        log.info("GET /api/tasks/overdue - Obteniendo tareas vencidas");
        List<TaskResponseDto> tasks = taskService.getOverdueTasks();
        return ResponseEntity.ok(ApiResponse.success("Tareas vencidas obtenidas", tasks));
    }

    /**
     * GET /api/tasks/high-priority - Obtener tareas de alta prioridad sin completar
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/high-priority")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getHighPriorityActiveTasks() {
        log.info("GET /api/tasks/high-priority - Obteniendo tareas de alta prioridad");
        List<TaskResponseDto> tasks = taskService.getHighPriorityActiveTasks();
        return ResponseEntity.ok(ApiResponse.success("Tareas de alta prioridad obtenidas", tasks));
    }

    /**
     * GET /api/tasks/search?q=texto - Buscar tareas por título o descripción
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> searchTasks(@RequestParam String q) {
        log.info("GET /api/tasks/search?q={} - Buscando tareas", q);
        List<TaskResponseDto> tasks = taskService.searchTasks(q);
        return ResponseEntity.ok(ApiResponse.success("Búsqueda completada", tasks));
    }

    /**
     * POST /api/tasks - Crear una nueva tarea
     * Acceso: ADMIN, MANAGER
     * 
     * LÓGICA: La tarea se crea con el usuario autenticado como creador
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TaskResponseDto>> createTask(
            @Valid @RequestBody TaskRequestDto requestDto,
            Authentication authentication) {
        log.info("POST /api/tasks - Creando nueva tarea");
        
        // Extraer ID del usuario autenticado (en implementación real, obtener de JWT)
        Long createdByUserId = 1L; // Placeholder - en production obtener del token JWT
        
        TaskResponseDto task = taskService.createTask(requestDto, createdByUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tarea creada exitosamente", task));
    }

    /**
     * PUT /api/tasks/{id} - Actualizar una tarea
     * Acceso: ADMIN, MANAGER
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TaskResponseDto>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequestDto requestDto) {
        log.info("PUT /api/tasks/{} - Actualizando tarea", id);
        TaskResponseDto task = taskService.updateTask(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Tarea actualizada exitosamente", task));
    }

    /**
     * POST /api/tasks/{id}/start - Iniciar una tarea (cambiar a IN_PROGRESS)
     * Acceso: ADMIN, MANAGER, WORKER (solo asignado)
     */
    @PostMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<TaskResponseDto>> startTask(@PathVariable Long id) {
        log.info("POST /api/tasks/{}/start - Iniciando tarea", id);
        TaskResponseDto task = taskService.startTask(id);
        return ResponseEntity.ok(ApiResponse.success("Tarea iniciada exitosamente", task));
    }

    /**
     * POST /api/tasks/{id}/complete - Completar una tarea
     * Acceso: ADMIN, MANAGER, WORKER (solo asignado)
     * 
     * LÓGICA COMPLEJA: No permitir completar si no están utilizados todos los productos
     */
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<TaskResponseDto>> completeTask(@PathVariable Long id) {
        log.info("POST /api/tasks/{}/complete - Completando tarea", id);
        TaskResponseDto task = taskService.completeTask(id);
        return ResponseEntity.ok(ApiResponse.success("Tarea completada exitosamente", task));
    }

    /**
     * POST /api/tasks/{id}/cancel - Cancelar una tarea
     * Acceso: ADMIN, MANAGER
     * 
     * LÓGICA: Libera automáticamente el stock reservado
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TaskResponseDto>> cancelTask(@PathVariable Long id) {
        log.info("POST /api/tasks/{}/cancel - Cancelando tarea", id);
        TaskResponseDto task = taskService.cancelTask(id);
        return ResponseEntity.ok(ApiResponse.success("Tarea cancelada exitosamente", task));
    }

    /**
     * GET /api/tasks/statistics - Obtener estadísticas de tareas
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TaskService.TaskStatistics>> getTaskStatistics() {
        log.info("GET /api/tasks/statistics - Obteniendo estadísticas");
        TaskService.TaskStatistics stats = taskService.getTaskStatistics();
        return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas", stats));
    }
}
