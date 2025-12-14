package com.geststore.controllers;

import com.geststore.models.dtos.StockRequestDto;
import com.geststore.models.dtos.StockResponseDto;
import com.geststore.services.StockService;
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
 * Controlador REST para operaciones con Stock/Inventario
 * Endpoints: /api/stock
 */
@Slf4j
@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
@Validated
public class StockController {

    private final StockService stockService;

    /**
     * GET /api/stock/product/{productId} - Obtener stock de un producto
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<StockResponseDto>> getStockByProductId(@PathVariable Long productId) {
        log.info("GET /api/stock/product/{} - Obteniendo stock", productId);
        StockResponseDto stock = stockService.getStockByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success("Stock obtenido exitosamente", stock));
    }

    /**
     * GET /api/stock/low-stock - Obtener productos con bajo stock
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<StockResponseDto>>> getBelowMinimumLevel() {
        log.info("GET /api/stock/low-stock - Obteniendo productos con bajo stock");
        List<StockResponseDto> stocks = stockService.getBelowMinimumLevel();
        return ResponseEntity.ok(ApiResponse.success("Productos con bajo stock obtenidos", stocks));
    }

    /**
     * GET /api/stock/out-of-stock - Obtener productos sin stock
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/out-of-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<StockResponseDto>>> getOutOfStockItems() {
        log.info("GET /api/stock/out-of-stock - Obteniendo productos sin stock");
        List<StockResponseDto> stocks = stockService.getOutOfStockItems();
        return ResponseEntity.ok(ApiResponse.success("Productos sin stock obtenidos", stocks));
    }

    /**
     * GET /api/stock/critical - Obtener stocks críticos
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/critical")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<StockResponseDto>>> getCriticalStocks() {
        log.info("GET /api/stock/critical - Obteniendo stocks críticos");
        List<StockResponseDto> stocks = stockService.getCriticalStocks();
        return ResponseEntity.ok(ApiResponse.success("Stocks críticos obtenidos", stocks));
    }

    /**
     * GET /api/stock/most-reserved - Obtener artículos más reservados
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/most-reserved")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<StockResponseDto>>> getMostReservedItems() {
        log.info("GET /api/stock/most-reserved - Obteniendo artículos más reservados");
        List<StockResponseDto> stocks = stockService.getMostReservedItems();
        return ResponseEntity.ok(ApiResponse.success("Artículos más reservados obtenidos", stocks));
    }

    /**
     * PUT /api/stock/{id} - Actualizar stock
     * Acceso: ADMIN, MANAGER
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<StockResponseDto>> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody StockRequestDto requestDto) {
        log.info("PUT /api/stock/{} - Actualizando stock", id);
        StockResponseDto stock = stockService.updateStock(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Stock actualizado exitosamente", stock));
    }

    /**
     * POST /api/stock/{id}/increase - Aumentar cantidad disponible
     * Acceso: ADMIN, MANAGER
     */
    @PostMapping("/{id}/increase")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<StockResponseDto>> increaseStock(
            @PathVariable Long id,
            @RequestParam int quantity) {
        log.info("POST /api/stock/{}/increase - Aumentando {} unidades", id, quantity);
        StockResponseDto stock = stockService.increaseStock(id, quantity);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Stock aumentado exitosamente", stock));
    }

    /**
     * POST /api/stock/{id}/decrease - Reducir cantidad disponible
     * Acceso: ADMIN, MANAGER
     */
    @PostMapping("/{id}/decrease")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<StockResponseDto>> decreaseStock(
            @PathVariable Long id,
            @RequestParam int quantity) {
        log.info("POST /api/stock/{}/decrease - Reduciendo {} unidades", id, quantity);
        StockResponseDto stock = stockService.decreaseStock(id, quantity);
        return ResponseEntity.ok(ApiResponse.success("Stock reducido exitosamente", stock));
    }

    /**
     * GET /api/stock/value - Obtener valor total del inventario
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/value")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Double>> getInventoryValue() {
        log.info("GET /api/stock/value - Obteniendo valor total del inventario");
        Double value = stockService.getInventoryValue();
        return ResponseEntity.ok(ApiResponse.success("Valor del inventario obtenido", value));
    }

    /**
     * GET /api/stock/statistics - Obtener estadísticas de inventario
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<StockService.InventoryStatistics>> getInventoryStatistics() {
        log.info("GET /api/stock/statistics - Obteniendo estadísticas");
        StockService.InventoryStatistics stats = stockService.getInventoryStatistics();
        return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas", stats));
    }
}
