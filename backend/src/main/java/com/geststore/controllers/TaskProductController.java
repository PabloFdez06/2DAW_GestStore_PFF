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

/**
 * Controlador REST para gestionar la relación Task-Product
 */
@Slf4j
@RestController
@RequestMapping("/task-products")
@RequiredArgsConstructor
@Validated
public class TaskProductController {

    private final TaskProductService taskProductService;

    @GetMapping("/task/{taskId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<List<TaskProductResponseDto>>> getProductsByTaskId(
            @PathVariable String taskId) {
        log.info("GET /api/task-products/task/{} - Obteniendo productos", taskId);
        List<TaskProductResponseDto> products = taskProductService.getProductsByTaskId(taskId);
        return ResponseEntity.ok(ApiResponse.success("Productos obtenidos exitosamente", products));
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TaskProductResponseDto>>> getTasksByProductId(
            @PathVariable String productId) {
        log.info("GET /api/task-products/product/{} - Obteniendo tareas", productId);
        List<TaskProductResponseDto> taskProducts = taskProductService.getTasksByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success("Tareas obtenidas exitosamente", taskProducts));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
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
    public ResponseEntity<ApiResponse<TaskProductResponseDto>> updateTaskProduct(
            @PathVariable String id,
            @Valid @RequestBody TaskProductRequestDto requestDto) {
        log.info("PUT /api/task-products/{} - Actualizando asignación", id);
        TaskProductResponseDto taskProduct = taskProductService.updateTaskProduct(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Asignación actualizada exitosamente", taskProduct));
    }

    @PostMapping("/{id}/use")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<TaskProductResponseDto>> useProduct(
            @PathVariable String id,
            @RequestParam int quantity) {
        log.info("POST /api/task-products/{}/use - Registrando uso de {} unidades", id, quantity);
        TaskProductResponseDto taskProduct = taskProductService.useProduct(id, quantity);
        return ResponseEntity.ok(ApiResponse.success("Uso registrado exitosamente", taskProduct));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> removeProductFromTask(@PathVariable String id) {
        log.info("DELETE /api/task-products/{} - Eliminando asignación", id);
        taskProductService.removeProductFromTask(id);
        return ResponseEntity.ok(ApiResponse.success("Asignación eliminada exitosamente", null));
    }
}
