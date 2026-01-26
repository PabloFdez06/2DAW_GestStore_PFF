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
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import jakarta.validation.Valid;
import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.parameters.RequestBody;

/**
 * Controlador REST para operaciones con tareas
 * 
 * Proporciona endpoints para crear, actualizar, eliminar y consultar tareas.
 * Todos los endpoints requieren autenticación JWT excepto los públicos.
 * Los roles especificados en @PreAuthorize determinan qué usuarios pueden acceder.
 */
@Slf4j
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@Validated
@Tag(name = "Tareas", description = "Endpoints para gestión de tareas")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    @Operation(
            summary = "Obtener todas las tareas paginadas",
            description = "Retorna una lista paginada de todas las tareas del sistema"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Tareas obtenidas exitosamente"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "No autenticado"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Sin permisos suficientes"
            )
    })
    public ResponseEntity<ApiResponse<Page<TaskResponseDto>>> getAllTasks(Pageable pageable) {
        log.info("GET /api/tasks - Obteniendo todas las tareas");
        Page<TaskResponseDto> tasks = taskService.getAllTasks(pageable);
        return ResponseEntity.ok(ApiResponse.success("Tareas obtenidas exitosamente", tasks));
    }
    
    @GetMapping("/all")
    @Operation(
            summary = "Obtener todas las tareas sin paginación",
            description = "Retorna una lista completa de todas las tareas sin paginación"
    )
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getAllTasksList() {
        log.info("GET /api/tasks/all - Obteniendo todas las tareas sin paginación");
        List<TaskResponseDto> tasks = taskService.getAllTasksList();
        return ResponseEntity.ok(ApiResponse.success("Tareas obtenidas exitosamente", tasks));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    @Operation(
            summary = "Obtener tarea por ID",
            description = "Retorna los detalles de una tarea específica"
    )
    public ResponseEntity<ApiResponse<TaskResponseDto>> getTaskById(@PathVariable String id) {
        log.info("GET /api/tasks/{} - Obteniendo tarea", id);
        TaskResponseDto task = taskService.getTaskById(id);
        return ResponseEntity.ok(ApiResponse.success("Tarea obtenida exitosamente", task));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Obtener tareas asignadas a un usuario",
            description = "Retorna todas las tareas asignadas a un usuario específico"
    )
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getTasksByAssignedUser(@PathVariable String userId) {
        log.info("GET /api/tasks/user/{} - Obteniendo tareas del usuario", userId);
        List<TaskResponseDto> tasks = taskService.getTasksByAssignedUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Tareas obtenidas exitosamente", tasks));
    }

    @GetMapping("/created-by/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Obtener tareas creadas por un usuario",
            description = "Retorna todas las tareas creadas por un usuario específico"
    )
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getTasksCreatedByUser(@PathVariable String userId) {
        log.info("GET /api/tasks/created-by/{} - Obteniendo tareas creadas", userId);
        List<TaskResponseDto> tasks = taskService.getTasksCreatedByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Tareas obtenidas exitosamente", tasks));
    }

    @GetMapping("/unassigned")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Obtener tareas sin asignar",
            description = "Retorna todas las tareas que no tienen usuario asignado"
    )
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getUnassignedTasks() {
        log.info("GET /api/tasks/unassigned - Obteniendo tareas sin asignar");
        List<TaskResponseDto> tasks = taskService.getUnassignedTasks();
        return ResponseEntity.ok(ApiResponse.success("Tareas sin asignar obtenidas", tasks));
    }

    @GetMapping("/in-progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Obtener tareas en progreso",
            description = "Retorna todas las tareas con estado 'en progreso'"
    )
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getTasksInProgress() {
        log.info("GET /api/tasks/in-progress - Obteniendo tareas en progreso");
        List<TaskResponseDto> tasks = taskService.getTasksInProgress();
        return ResponseEntity.ok(ApiResponse.success("Tareas en progreso obtenidas", tasks));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Obtener tareas vencidas",
            description = "Retorna todas las tareas con fecha de vencimiento pasada"
    )
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getOverdueTasks() {
        log.info("GET /api/tasks/overdue - Obteniendo tareas vencidas");
        List<TaskResponseDto> tasks = taskService.getOverdueTasks();
        return ResponseEntity.ok(ApiResponse.success("Tareas vencidas obtenidas", tasks));
    }

    @GetMapping("/high-priority")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Obtener tareas de alta prioridad activas",
            description = "Retorna todas las tareas activas con prioridad alta"
    )
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getHighPriorityActiveTasks() {
        log.info("GET /api/tasks/high-priority - Obteniendo tareas de alta prioridad");
        List<TaskResponseDto> tasks = taskService.getHighPriorityActiveTasks();
        return ResponseEntity.ok(ApiResponse.success("Tareas de alta prioridad obtenidas", tasks));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Buscar tareas",
            description = "Busca tareas por título o descripción"
    )
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> searchTasks(@RequestParam String q) {
        log.info("GET /api/tasks/search?q={} - Buscando tareas", q);
        List<TaskResponseDto> tasks = taskService.searchTasks(q);
        return ResponseEntity.ok(ApiResponse.success("Búsqueda completada", tasks));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Crear nueva tarea",
            description = "Crea una nueva tarea en el sistema. Requiere el ID del usuario creador en el header X-User-Id"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Tarea creada exitosamente"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Datos inválidos o ID de usuario no proporcionado"
            )
    })
    public ResponseEntity<ApiResponse<TaskResponseDto>> createTask(
            @Valid @RequestBody TaskRequestDto requestDto,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("POST /api/tasks - Creando nueva tarea");
        
        if (userId == null || userId.isEmpty()) {
            log.error("No se proporcionó el ID del usuario");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<TaskResponseDto>builder()
                            .success(false)
                            .message("Se requiere el ID del usuario para crear una tarea")
                            .timestamp(java.time.LocalDateTime.now())
                            .build());
        }
        
        log.info("Usuario desde header: {}", userId);
        TaskResponseDto task = taskService.createTask(requestDto, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tarea creada exitosamente", task));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Actualizar tarea completamente",
            description = "Actualiza todos los campos de una tarea existente"
    )
    public ResponseEntity<ApiResponse<TaskResponseDto>> updateTask(
            @PathVariable String id,
            @Valid @RequestBody TaskRequestDto requestDto) {
        log.info("PUT /api/tasks/{} - Actualizando tarea", id);
        TaskResponseDto task = taskService.updateTask(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Tarea actualizada exitosamente", task));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    @Operation(
            summary = "Actualizar tarea parcialmente",
            description = "Actualiza solo los campos especificados de una tarea"
    )
    public ResponseEntity<ApiResponse<TaskResponseDto>> patchTask(
            @PathVariable String id,
            @RequestBody java.util.Map<String, Object> updates) {
        log.info("PATCH /api/tasks/{} - Actualizando parcialmente tarea", id);
        TaskResponseDto task = taskService.patchTask(id, updates);
        return ResponseEntity.ok(ApiResponse.success("Tarea actualizada exitosamente", task));
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    @Operation(
            summary = "Iniciar tarea",
            description = "Cambia el estado de una tarea a 'en progreso'"
    )
    public ResponseEntity<ApiResponse<TaskResponseDto>> startTask(@PathVariable String id) {
        log.info("POST /api/tasks/{}/start - Iniciando tarea", id);
        TaskResponseDto task = taskService.startTask(id);
        return ResponseEntity.ok(ApiResponse.success("Tarea iniciada exitosamente", task));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    @Operation(
            summary = "Completar tarea",
            description = "Marca una tarea como completada"
    )
    public ResponseEntity<ApiResponse<TaskResponseDto>> completeTask(@PathVariable String id) {
        log.info("POST /api/tasks/{}/complete - Completando tarea", id);
        TaskResponseDto task = taskService.completeTask(id);
        return ResponseEntity.ok(ApiResponse.success("Tarea completada exitosamente", task));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Cancelar tarea",
            description = "Cancela una tarea en progreso"
    )
    public ResponseEntity<ApiResponse<TaskResponseDto>> cancelTask(@PathVariable String id) {
        log.info("POST /api/tasks/{}/cancel - Cancelando tarea", id);
        TaskResponseDto task = taskService.cancelTask(id);
        return ResponseEntity.ok(ApiResponse.success("Tarea cancelada exitosamente", task));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Eliminar tarea",
            description = "Elimina una tarea del sistema permanentemente"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Tarea eliminada exitosamente"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Tarea no encontrada"
            )
    })
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable String id) {
        log.info("DELETE /api/tasks/{} - Eliminando tarea", id);
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Tarea eliminada exitosamente", null));
    }

    @PutMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    @Operation(
            summary = "Actualizar imagen de tarea",
            description = "Sube una nueva imagen para una tarea"
    )
    public ResponseEntity<ApiResponse<TaskResponseDto>> updateTaskImage(
            @PathVariable String id,
            @RequestPart("file") MultipartFile file
    ) {
        log.info("PUT /api/tasks/{}/image - Actualizando imagen de tarea", id);
        TaskResponseDto task = taskService.updateTaskImage(id, file);
        return ResponseEntity.ok(ApiResponse.success("Imagen de tarea actualizada exitosamente", task));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Obtener estadísticas globales",
            description = "Retorna estadísticas generales de todas las tareas"
    )
    public ResponseEntity<ApiResponse<TaskService.TaskStatistics>> getTaskStatistics() {
        log.info("GET /api/tasks/statistics - Obteniendo estadísticas");
        TaskService.TaskStatistics stats = taskService.getTaskStatistics();
        return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas", stats));
    }

    @GetMapping("/statistics/user/{userId}")
    @Operation(
            summary = "Obtener estadísticas de usuario",
            description = "Retorna estadísticas de tareas para un usuario específico"
    )
    public ResponseEntity<ApiResponse<TaskService.TaskStatistics>> getTaskStatisticsByUser(@PathVariable String userId) {
        log.info("GET /api/tasks/statistics/user/{} - Obteniendo estadísticas del usuario", userId);
        TaskService.TaskStatistics stats = taskService.getTaskStatisticsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Estadísticas del usuario obtenidas", stats));
    }
}
