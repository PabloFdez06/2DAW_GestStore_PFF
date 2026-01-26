package com.geststore.controllers;

import com.geststore.models.dtos.ProductRequestDto;
import com.geststore.models.dtos.ProductResponseDto;
import com.geststore.services.ProductService;
import com.geststore.utils.ApiResponse;
import com.geststore.exceptions.BusinessLogicException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
 * Controlador REST para operaciones con productos
 * 
 * Los productos son elementos personales de cada usuario.
 * Se utilizan para crear un almacén de productos disponibles
 * que pueden ser asignados a tareas específicas.
 */
@Slf4j
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Validated
@Tag(name = "Productos", description = "Endpoints para gestión de productos personales")
@SecurityRequirement(name = "bearerAuth")
public class ProductController {

    private final ProductService productService;

    /**
     * Extrae el userId del header X-User-Id
     */
    private String getUserIdFromHeader(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            throw new BusinessLogicException("Usuario no autenticado", "USER_NOT_AUTHENTICATED");
        }
        return userIdHeader;
    }

    @GetMapping
    @Operation(
            summary = "Obtener productos del usuario",
            description = "Retorna una lista paginada de todos los productos del usuario autenticado"
    )
    public ResponseEntity<ApiResponse<Page<ProductResponseDto>>> getAllProducts(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            Pageable pageable) {
        log.info("GET /api/products - Obteniendo todos los productos del usuario: {}", userId);
        String validUserId = getUserIdFromHeader(userId);
        Page<ProductResponseDto> products = productService.getAllProducts(validUserId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Productos obtenidos exitosamente", products));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Obtener producto por ID",
            description = "Retorna los detalles de un producto específico"
    )
    public ResponseEntity<ApiResponse<ProductResponseDto>> getProductById(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("GET /api/products/{} - Obteniendo producto para usuario: {}", id, userId);
        String validUserId = getUserIdFromHeader(userId);
        ProductResponseDto product = productService.getProductById(id, validUserId);
        return ResponseEntity.ok(ApiResponse.success("Producto obtenido exitosamente", product));
    }

    @GetMapping("/sku/{sku}")
    @Operation(
            summary = "Obtener producto por SKU",
            description = "Busca un producto por su código SKU único"
    )
    public ResponseEntity<ApiResponse<ProductResponseDto>> getProductBySku(
            @PathVariable String sku,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("GET /api/products/sku/{} - Obteniendo producto por SKU para usuario: {}", sku, userId);
        String validUserId = getUserIdFromHeader(userId);
        ProductResponseDto product = productService.getProductBySku(sku, validUserId);
        return ResponseEntity.ok(ApiResponse.success("Producto obtenido exitosamente", product));
    }

    @GetMapping("/search")
    @Operation(
            summary = "Buscar productos",
            description = "Busca productos por nombre o descripción"
    )
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> searchProducts(
            @RequestParam String q,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("GET /api/products/search?q={} - Buscando productos para usuario: {}", q, userId);
        String validUserId = getUserIdFromHeader(userId);
        List<ProductResponseDto> products = productService.searchProductsByName(q, validUserId);
        return ResponseEntity.ok(ApiResponse.success("Búsqueda completada", products));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Obtener productos con bajo stock",
            description = "Retorna todos los productos del usuario con inventario bajo"
    )
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getLowStockProducts(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("GET /api/products/low-stock - Obteniendo productos con bajo stock del usuario: {}", userId);
        String validUserId = getUserIdFromHeader(userId);
        List<ProductResponseDto> products = productService.getLowStockProducts(validUserId);
        return ResponseEntity.ok(ApiResponse.success("Productos con bajo stock obtenidos", products));
    }

    @GetMapping("/out-of-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Obtener productos sin stock",
            description = "Retorna todos los productos del usuario sin inventario disponible"
    )
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getOutOfStockProducts(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("GET /api/products/out-of-stock - Obteniendo productos sin stock del usuario: {}", userId);
        String validUserId = getUserIdFromHeader(userId);
        List<ProductResponseDto> products = productService.getOutOfStockProducts(validUserId);
        return ResponseEntity.ok(ApiResponse.success("Productos sin stock obtenidos", products));
    }

    @GetMapping("/category/{category}")
    @Operation(
            summary = "Obtener productos por categoría",
            description = "Retorna todos los productos del usuario en una categoría específica"
    )
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getProductsByCategory(
            @PathVariable String category,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("GET /api/products/category/{} - Obteniendo productos por categoría para usuario: {}", category, userId);
        String validUserId = getUserIdFromHeader(userId);
        List<ProductResponseDto> products = productService.getProductsByCategory(category, validUserId);
        return ResponseEntity.ok(ApiResponse.success("Productos obtenidos exitosamente", products));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Crear nuevo producto",
            description = "Crea un nuevo producto en el almacén personal del usuario"
    )
    public ResponseEntity<ApiResponse<ProductResponseDto>> createProduct(
            @Valid @RequestBody ProductRequestDto requestDto,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("POST /api/products - Creando nuevo producto para usuario: {}", userId);
        String validUserId = getUserIdFromHeader(userId);
        ProductResponseDto product = productService.createProduct(requestDto, validUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Producto creado exitosamente", product));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
            summary = "Actualizar producto",
            description = "Actualiza la información de un producto existente"
    )
    public ResponseEntity<ApiResponse<ProductResponseDto>> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody ProductRequestDto requestDto,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("PUT /api/products/{} - Actualizando producto para usuario: {}", id, userId);
        String validUserId = getUserIdFromHeader(userId);
        ProductResponseDto product = productService.updateProduct(id, requestDto, validUserId);
        return ResponseEntity.ok(ApiResponse.success("Producto actualizado exitosamente", product));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProductResponseDto>> deactivateProduct(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("DELETE /api/products/{} - Desactivando producto para usuario: {}", id, userId);
        String validUserId = getUserIdFromHeader(userId);
        ProductResponseDto product = productService.deactivateProduct(id, validUserId);
        return ResponseEntity.ok(ApiResponse.success("Producto desactivado exitosamente", product));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProductService.ProductStatistics>> getProductStatistics(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("GET /api/products/statistics - Obteniendo estadísticas para usuario: {}", userId);
        String validUserId = getUserIdFromHeader(userId);
        ProductService.ProductStatistics stats = productService.getProductStatistics(validUserId);
        return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas", stats));
    }
}
