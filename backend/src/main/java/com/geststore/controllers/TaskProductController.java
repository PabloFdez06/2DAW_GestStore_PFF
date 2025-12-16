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
 * Permite asignar productos a tareas y controlar su uso
 * Endpoints: /api/task-products
 * 
 * LÓGICA DE NEGOCIO:
 * - Valida stock disponible al asignar productos
 * - Reserva automáticamente el stock
 * - Controla cantidad utilizada vs. cantidad asignada
 */
@Slf4j
@RestController
@RequestMapping("/api/task-products")
@RequiredArgsConstructor
@Validated
public class TaskProductController {

    private final TaskProductService taskProductService;

    /**
     * GET /api/task-products/task/{taskId} - Obtener productos de una tarea
     * Acceso: ADMIN, MANAGER, WORKER
     */
    @GetMapping("/task/{taskId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<List<TaskProductResponseDto>>> getProductsByTaskId(
            @PathVariable Long taskId) {
        log.info("GET /api/task-products/task/{} - Obteniendo productos", taskId);
        List<TaskProductResponseDto> products = taskProductService.getProductsByTaskId(taskId);
        return ResponseEntity.ok(ApiResponse.success("Productos obtenidos exitosamente", products));
    }

    /**
     * GET /api/task-products/product/{productId} - Obtener tareas que usan un producto
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TaskProductResponseDto>>> getTasksByProductId(
            @PathVariable Long productId) {
        log.info("GET /api/task-products/product/{} - Obteniendo tareas", productId);
        List<TaskProductResponseDto> taskProducts = taskProductService.getTasksByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success("Tareas obtenidas exitosamente", taskProducts));
    }

    /**
     * POST /api/task-products/assign - Asignar un producto a una tarea
     * Acceso: ADMIN, MANAGER
     * 
     * LÓGICA: Reserva automáticamente el stock especificado
     */
    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TaskProductResponseDto>> assignProductToTask(
            @RequestParam Long taskId,
            @Valid @RequestBody TaskProductRequestDto requestDto) {
        log.info("POST /api/task-products/assign - Asignando producto a tarea");
        TaskProductResponseDto taskProduct = taskProductService.assignProductToTask(taskId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Producto asignado exitosamente", taskProduct));
    }

    /**
     * PUT /api/task-products/{id} - Actualizar asignación de producto
     * Acceso: ADMIN, MANAGER
     * 
     * LÓGICA: Ajusta automáticamente el stock reservado
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TaskProductResponseDto>> updateTaskProduct(
            @PathVariable Long id,
            @Valid @RequestBody TaskProductRequestDto requestDto) {
        log.info("PUT /api/task-products/{} - Actualizando asignación", id);
        TaskProductResponseDto taskProduct = taskProductService.updateTaskProduct(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Asignación actualizada exitosamente", taskProduct));
    }

    /**
     * POST /api/task-products/{id}/use - Registrar cantidad utilizada de un producto
     * Acceso: ADMIN, MANAGER, WORKER
     * 
     * LÓGICA: Registra cuánto se consumió del producto asignado
     */
    @PostMapping("/{id}/use")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<TaskProductResponseDto>> useProduct(
            @PathVariable Long id,
            @RequestParam int quantityUsed) {
        log.info("POST /api/task-products/{}/use - Registrando uso de {} unidades", id, quantityUsed);
        TaskProductResponseDto taskProduct = taskProductService.useProduct(id, quantityUsed);
        return ResponseEntity.ok(ApiResponse.success("Cantidad utilizada registrada exitosamente", taskProduct));
    }

    /**
     * DELETE /api/task-products/{id} - Eliminar asignación de producto
     * Acceso: ADMIN, MANAGER
     * 
     * LÓGICA: Libera automáticamente el stock reservado
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<String>> removeProductFromTask(@PathVariable Long id) {
        log.info("DELETE /api/task-products/{} - Eliminando asignación", id);
        taskProductService.removeProductFromTask(id);
        return ResponseEntity.ok(ApiResponse.success("Asignación eliminada exitosamente", "OK"));
    }

    /**
     * GET /api/task-products/discrepancies - Obtener productos con discrepancias
     * (cantidad utilizada != cantidad asignada)
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/discrepancies")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TaskProductResponseDto>>> getProductsWithDiscrepancies() {
        log.info("GET /api/task-products/discrepancies - Obteniendo productos con discrepancias");
        List<TaskProductResponseDto> products = taskProductService.getProductsWithDiscrepancies();
        return ResponseEntity.ok(ApiResponse.success("Productos con discrepancias obtenidos", products));
    }

    /**
     * GET /api/task-products/task/{taskId}/unused - Obtener productos no utilizados
     * Acceso: ADMIN, MANAGER, WORKER
     */
    @GetMapping("/task/{taskId}/unused")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<List<TaskProductResponseDto>>> getUnusedProductsByTask(
            @PathVariable Long taskId) {
        log.info("GET /api/task-products/task/{}/unused - Obteniendo productos no utilizados", taskId);
        List<TaskProductResponseDto> products = taskProductService.getUnusedProductsByTask(taskId);
        return ResponseEntity.ok(ApiResponse.success("Productos no utilizados obtenidos", products));
    }

    /**
     * GET /api/task-products/task/{taskId}/used - Obtener productos utilizados
     * Acceso: ADMIN, MANAGER, WORKER
     */
    @GetMapping("/task/{taskId}/used")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<List<TaskProductResponseDto>>> getUsedProductsByTask(
            @PathVariable Long taskId) {
        log.info("GET /api/task-products/task/{}/used - Obteniendo productos utilizados", taskId);
        List<TaskProductResponseDto> products = taskProductService.getUsedProductsByTask(taskId);
        return ResponseEntity.ok(ApiResponse.success("Productos utilizados obtenidos", products));
    }

    /**
     * GET /api/task-products/product/{productId}/reserved - Obtener cantidad total reservada
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/product/{productId}/reserved")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Integer>> calculateTotalReservedQuantity(
            @PathVariable Long productId) {
        log.info("GET /api/task-products/product/{}/reserved - Calculando cantidad reservada", productId);
        Integer totalReserved = taskProductService.calculateTotalReservedQuantity(productId);
        return ResponseEntity.ok(ApiResponse.success("Cantidad total reservada obtenida", totalReserved));
    }
}
