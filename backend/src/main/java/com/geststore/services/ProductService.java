package com.geststore.services;

import com.geststore.exceptions.BusinessLogicException;
import com.geststore.exceptions.ResourceNotFoundException;
import com.geststore.models.dtos.ProductRequestDto;
import com.geststore.models.dtos.ProductResponseDto;
import com.geststore.models.entities.Product;
import com.geststore.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de lógica de negocio para productos
 * Maneja operaciones CRUD y validaciones
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    /**
     * Obtiene todos los productos activos de un usuario
     */
    public Page<ProductResponseDto> getAllProducts(String userId, Pageable pageable) {
        log.info("Obteniendo todos los productos activos del usuario: {}, página: {}", userId, pageable.getPageNumber());
        Page<Product> products = productRepository.findByActiveAndUserId(true, userId, pageable);
        return products.map(this::convertToDto);
    }

    /**
     * Obtiene un producto por ID (verificando que pertenece al usuario)
     */
    public ProductResponseDto getProductById(String id, String userId) {
        log.info("Buscando producto con ID: {} para usuario: {}", id, userId);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));
        
        if (!product.getActive() || !userId.equals(product.getUserId())) {
            throw new ResourceNotFoundException("Producto", id);
        }
        
        return convertToDto(product);
    }

    /**
     * Obtiene un producto por SKU del usuario
     */
    public ProductResponseDto getProductBySku(String sku, String userId) {
        log.info("Buscando producto con SKU: {} para usuario: {}", sku, userId);
        Product product = productRepository.findBySkuAndUserId(sku, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "SKU", sku));
        
        if (!product.getActive()) {
            throw new ResourceNotFoundException("Producto", "SKU", sku);
        }
        
        return convertToDto(product);
    }

    /**
     * Busca productos con bajo stock del usuario
     */
    public List<ProductResponseDto> getLowStockProducts(String userId) {
        log.info("Obteniendo productos con bajo stock del usuario: {}", userId);
        List<Product> products = productRepository.findLowStockProductsByUserId(userId);
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca productos sin stock del usuario
     */
    public List<ProductResponseDto> getOutOfStockProducts(String userId) {
        log.info("Obteniendo productos sin stock del usuario: {}", userId);
        List<Product> products = productRepository.findOutOfStockProductsByUserId(userId);
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca productos por categoría del usuario
     */
    public List<ProductResponseDto> getProductsByCategory(String category, String userId) {
        log.info("Obteniendo productos de la categoría: {} para usuario: {}", category, userId);
        List<Product> products = productRepository.findActiveProductsByCategoryAndUserId(category, true, userId);
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca productos por nombre del usuario
     */
    public List<ProductResponseDto> searchProductsByName(String searchText, String userId) {
        log.info("Buscando productos con nombre: {} para usuario: {}", searchText, userId);
        List<Product> products = productRepository.searchByNameAndUserId(searchText, userId);
        return products.stream()
                .filter(Product::getActive)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Crea un nuevo producto para un usuario
     */
    public ProductResponseDto createProduct(ProductRequestDto requestDto, String userId) {
        log.info("Creando nuevo producto con SKU: {} para usuario: {}", requestDto.getSku(), userId);

        if (productRepository.existsBySkuAndUserId(requestDto.getSku(), userId)) {
            throw new BusinessLogicException(
                    "El SKU ya existe: " + requestDto.getSku(),
                    "DUPLICATE_SKU"
            );
        }

        Product product = Product.builder()
                .userId(userId)
                .name(requestDto.getName())
                .sku(requestDto.getSku())
                .description(requestDto.getDescription())
                .unitPrice(requestDto.getUnitPrice())
                .category(requestDto.getCategory())
                .active(true)
                .stockQuantity(requestDto.getStockQuantity() != null ? requestDto.getStockQuantity() : 0)
                .minStockLevel(requestDto.getMinStockLevel() != null ? requestDto.getMinStockLevel() : 10)
                .build();

        product.onCreate();
        Product savedProduct = productRepository.save(product);

        log.info("Producto creado exitosamente con ID: {}", savedProduct.getId());

        return convertToDto(savedProduct);
    }

    /**
     * Actualiza un producto (verificando que pertenece al usuario)
     */
    public ProductResponseDto updateProduct(String id, ProductRequestDto requestDto, String userId) {
        log.info("Actualizando producto con ID: {} para usuario: {}", id, userId);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));

        // Verificar que el producto pertenece al usuario
        if (!userId.equals(product.getUserId())) {
            throw new ResourceNotFoundException("Producto", id);
        }

        if (!product.getSku().equals(requestDto.getSku()) &&
                productRepository.existsBySkuAndUserId(requestDto.getSku(), userId)) {
            throw new BusinessLogicException(
                    "El SKU ya existe: " + requestDto.getSku(),
                    "DUPLICATE_SKU"
            );
        }

        product.setName(requestDto.getName());
        product.setSku(requestDto.getSku());
        product.setDescription(requestDto.getDescription());
        product.setUnitPrice(requestDto.getUnitPrice());
        product.setCategory(requestDto.getCategory());
        
        // Actualizar stock si se proporciona
        if (requestDto.getStockQuantity() != null) {
            product.setStockQuantity(requestDto.getStockQuantity());
        }
        if (requestDto.getMinStockLevel() != null) {
            product.setMinStockLevel(requestDto.getMinStockLevel());
        }
        
        product.onUpdate();

        Product updatedProduct = productRepository.save(product);
        log.info("Producto actualizado exitosamente con ID: {}", id);

        return convertToDto(updatedProduct);
    }

    /**
     * Desactiva un producto (soft delete) - verificando que pertenece al usuario
     */
    public ProductResponseDto deactivateProduct(String id, String userId) {
        log.info("Desactivando producto con ID: {} para usuario: {}", id, userId);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));

        // Verificar que el producto pertenece al usuario
        if (!userId.equals(product.getUserId())) {
            throw new ResourceNotFoundException("Producto", id);
        }

        product.setActive(false);
        product.onUpdate();
        Product updatedProduct = productRepository.save(product);
        log.info("Producto desactivado exitosamente con ID: {}", id);

        return convertToDto(updatedProduct);
    }

    /**
     * Obtiene estadísticas de productos del usuario
     */
    @Transactional(readOnly = true)
    public ProductStatistics getProductStatistics(String userId) {
        log.info("Obteniendo estadísticas de productos del usuario: {}", userId);
        
        List<Product> activeProducts = productRepository.findByActiveAndUserId(true, userId);
        long totalProducts = activeProducts.size();
        long lowStockProducts = productRepository.findLowStockProductsByUserId(userId).size();
        long outOfStockProducts = productRepository.findOutOfStockProductsByUserId(userId).size();

        return ProductStatistics.builder()
                .totalProducts(totalProducts)
                .activeProducts(totalProducts)
                .inactiveProducts(0L)
                .lowStockProducts(lowStockProducts)
                .outOfStockProducts(outOfStockProducts)
                .build();
    }

    /**
     * Convierte una entidad Product a ProductResponseDto
     */
    private ProductResponseDto convertToDto(Product product) {
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
     * DTO para estadísticas de productos
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class ProductStatistics {
        private long totalProducts;
        private long activeProducts;
        private long inactiveProducts;
        private long lowStockProducts;
        private long outOfStockProducts;
    }
}
