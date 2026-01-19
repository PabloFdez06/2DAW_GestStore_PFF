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

/**
 * Controlador REST para operaciones con productos
 * Los productos son personales de cada usuario
 */
@Slf4j
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Validated
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
    public ResponseEntity<ApiResponse<Page<ProductResponseDto>>> getAllProducts(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            Pageable pageable) {
        log.info("GET /api/products - Obteniendo todos los productos del usuario: {}", userId);
        String validUserId = getUserIdFromHeader(userId);
        Page<ProductResponseDto> products = productService.getAllProducts(validUserId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Productos obtenidos exitosamente", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDto>> getProductById(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("GET /api/products/{} - Obteniendo producto para usuario: {}", id, userId);
        String validUserId = getUserIdFromHeader(userId);
        ProductResponseDto product = productService.getProductById(id, validUserId);
        return ResponseEntity.ok(ApiResponse.success("Producto obtenido exitosamente", product));
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<ApiResponse<ProductResponseDto>> getProductBySku(
            @PathVariable String sku,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("GET /api/products/sku/{} - Obteniendo producto por SKU para usuario: {}", sku, userId);
        String validUserId = getUserIdFromHeader(userId);
        ProductResponseDto product = productService.getProductBySku(sku, validUserId);
        return ResponseEntity.ok(ApiResponse.success("Producto obtenido exitosamente", product));
    }

    @GetMapping("/search")
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
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getLowStockProducts(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("GET /api/products/low-stock - Obteniendo productos con bajo stock del usuario: {}", userId);
        String validUserId = getUserIdFromHeader(userId);
        List<ProductResponseDto> products = productService.getLowStockProducts(validUserId);
        return ResponseEntity.ok(ApiResponse.success("Productos con bajo stock obtenidos", products));
    }

    @GetMapping("/out-of-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getOutOfStockProducts(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("GET /api/products/out-of-stock - Obteniendo productos sin stock del usuario: {}", userId);
        String validUserId = getUserIdFromHeader(userId);
        List<ProductResponseDto> products = productService.getOutOfStockProducts(validUserId);
        return ResponseEntity.ok(ApiResponse.success("Productos sin stock obtenidos", products));
    }

    @GetMapping("/category/{category}")
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
