package com.geststore.controllers;

import com.geststore.models.dtos.TaskProductRequestDto;
import com.geststore.models.dtos.TaskProductResponseDto;
import com.geststore.services.TaskProductService;
import com.geststore.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

/**
 * Controlador REST para gestionar la relación Task-Product
 * 
 * Proporciona endpoints para asignar productos a tareas y
 * registrar el consumo de productos durante la ejecución de tareas.
 */
@Slf4j
@RestController
@RequestMapping("/api/task-products")
@RequiredArgsConstructor
@Validated
@Tag(name = "Productos de Tareas", description = "Endpoints para gestionar asignación de productos a tareas")
@SecurityRequirement(name = "bearerAuth")
public class TaskProductController {

    private final TaskProductService taskProductService;

    @GetMapping("/task/{taskId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    @Operation(
            summary = "Obtener productos de una tarea",
            description = "Retorna todos los productos asignados a una tarea específica"
    )
    public ResponseEntity<ApiResponse<List<TaskProductResponseDto>>> getProductsByTaskId(
            @PathVariable String taskId) {
        log.info("GET /api/task-products/task/{} - Obteniendo productos", taskId);
        List<TaskProductResponseDto> products = taskProductService.getProductsByTaskId(taskId);
        return ResponseEntity.ok(ApiResponse.success("Productos obtenidos exitosamente", products));
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Obtener tareas de un producto",
            description = "Retorna todas las tareas a las que está asignado un producto específico"
    )
    public ResponseEntity<ApiResponse<List<TaskProductResponseDto>>> getTasksByProductId(
            @PathVariable String productId) {
        log.info("GET /api/task-products/product/{} - Obteniendo tareas", productId);
        List<TaskProductResponseDto> taskProducts = taskProductService.getTasksByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success("Tareas obtenidas exitosamente", taskProducts));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Asignar producto a tarea",
            description = "Asigna un producto con cantidad específica a una tarea"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Producto asignado exitosamente"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Datos inválidos o recurso no encontrado"
            )
    })
    public ResponseEntity<ApiResponse<TaskProductResponseDto>> assignProductToTask(
            @RequestParam String taskId,
            @Valid @RequestBody TaskProductRequestDto requestDto) {
        log.info("POST /api/task-products/assign - Asignando producto a tarea");
        TaskProductResponseDto taskProduct = taskProductService.assignProductToTask(taskId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Producto asignado exitosamente", taskProduct));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Actualizar asignación de producto",
            description = "Actualiza la cantidad de producto asignado a una tarea"
    )
    public ResponseEntity<ApiResponse<TaskProductResponseDto>> updateTaskProduct(
            @PathVariable String id,
            @Valid @RequestBody TaskProductRequestDto requestDto) {
        log.info("PUT /api/task-products/{} - Actualizando asignación", id);
        TaskProductResponseDto taskProduct = taskProductService.updateTaskProduct(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Asignación actualizada exitosamente", taskProduct));
    }

    @PostMapping("/{id}/use")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    @Operation(
            summary = "Registrar uso de producto",
            description = "Registra el consumo de unidades de un producto en una tarea"
    )
    public ResponseEntity<ApiResponse<TaskProductResponseDto>> useProduct(
            @PathVariable String id,
            @RequestParam int quantity) {
        log.info("POST /api/task-products/{}/use - Registrando uso de {} unidades", id, quantity);
        TaskProductResponseDto taskProduct = taskProductService.useProduct(id, quantity);
        return ResponseEntity.ok(ApiResponse.success("Uso registrado exitosamente", taskProduct));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Remover producto de tarea",
            description = "Elimina la asignación de un producto a una tarea"
    )
    public ResponseEntity<ApiResponse<Void>> removeProductFromTask(@PathVariable String id) {
        log.info("DELETE /api/task-products/{} - Eliminando asignación", id);
        taskProductService.removeProductFromTask(id);
        return ResponseEntity.ok(ApiResponse.success("Asignación eliminada exitosamente", null));
    }
}
