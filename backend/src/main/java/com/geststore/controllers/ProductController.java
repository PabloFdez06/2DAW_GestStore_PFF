package com.geststore.controllers;

import com.geststore.models.dtos.ProductRequestDto;
import com.geststore.models.dtos.ProductResponseDto;
import com.geststore.services.ProductService;
import com.geststore.utils.ApiResponse;
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
 * Endpoints: /api/products
 */
@Slf4j
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Validated
public class ProductController {

    private final ProductService productService;

    /**
     * GET /api/products - Obtener todos los productos (paginado)
     * Acceso: Público
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponseDto>>> getAllProducts(Pageable pageable) {
        log.info("GET /api/products - Obteniendo todos los productos");
        Page<ProductResponseDto> products = productService.getAllProducts(pageable);
        return ResponseEntity.ok(ApiResponse.success("Productos obtenidos exitosamente", products));
    }

    /**
     * GET /api/products/{id} - Obtener un producto por ID
     * Acceso: Público
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDto>> getProductById(@PathVariable Long id) {
        log.info("GET /api/products/{} - Obteniendo producto", id);
        ProductResponseDto product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Producto obtenido exitosamente", product));
    }

    /**
     * GET /api/products/sku/{sku} - Obtener producto por SKU
     * Acceso: Público
     */
    @GetMapping("/sku/{sku}")
    public ResponseEntity<ApiResponse<ProductResponseDto>> getProductBySku(@PathVariable String sku) {
        log.info("GET /api/products/sku/{} - Obteniendo producto por SKU", sku);
        ProductResponseDto product = productService.getProductBySku(sku);
        return ResponseEntity.ok(ApiResponse.success("Producto obtenido exitosamente", product));
    }

    /**
     * GET /api/products/search?q=texto - Buscar productos por nombre
     * Acceso: Público
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> searchProducts(@RequestParam String q) {
        log.info("GET /api/products/search?q={} - Buscando productos", q);
        List<ProductResponseDto> products = productService.searchProductsByName(q);
        return ResponseEntity.ok(ApiResponse.success("Búsqueda completada", products));
    }

    /**
     * GET /api/products/low-stock - Obtener productos con bajo stock
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getLowStockProducts() {
        log.info("GET /api/products/low-stock - Obteniendo productos con bajo stock");
        List<ProductResponseDto> products = productService.getLowStockProducts();
        return ResponseEntity.ok(ApiResponse.success("Productos con bajo stock obtenidos", products));
    }

    /**
     * GET /api/products/out-of-stock - Obtener productos sin stock
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/out-of-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getOutOfStockProducts() {
        log.info("GET /api/products/out-of-stock - Obteniendo productos sin stock");
        List<ProductResponseDto> products = productService.getOutOfStockProducts();
        return ResponseEntity.ok(ApiResponse.success("Productos sin stock obtenidos", products));
    }

    /**
     * GET /api/products/category/{category} - Obtener productos por categoría
     * Acceso: Público
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getProductsByCategory(@PathVariable String category) {
        log.info("GET /api/products/category/{} - Obteniendo productos por categoría", category);
        List<ProductResponseDto> products = productService.getProductsByCategory(category);
        return ResponseEntity.ok(ApiResponse.success("Productos obtenidos exitosamente", products));
    }

    /**
     * POST /api/products - Crear un nuevo producto
     * Acceso: ADMIN, MANAGER
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProductResponseDto>> createProduct(@Valid @RequestBody ProductRequestDto requestDto) {
        log.info("POST /api/products - Creando nuevo producto");
        ProductResponseDto product = productService.createProduct(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Producto creado exitosamente", product));
    }

    /**
     * PUT /api/products/{id} - Actualizar un producto
     * Acceso: ADMIN, MANAGER
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProductResponseDto>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDto requestDto) {
        log.info("PUT /api/products/{} - Actualizando producto", id);
        ProductResponseDto product = productService.updateProduct(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Producto actualizado exitosamente", product));
    }

    /**
     * DELETE /api/products/{id} - Desactivar un producto
     * Acceso: ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponseDto>> deactivateProduct(@PathVariable Long id) {
        log.info("DELETE /api/products/{} - Desactivando producto", id);
        ProductResponseDto product = productService.deactivateProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Producto desactivado exitosamente", product));
    }

    /**
     * GET /api/products/statistics - Obtener estadísticas de productos
     * Acceso: ADMIN, MANAGER
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProductService.ProductStatistics>> getProductStatistics() {
        log.info("GET /api/products/statistics - Obteniendo estadísticas");
        ProductService.ProductStatistics stats = productService.getProductStatistics();
        return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas", stats));
    }
}
