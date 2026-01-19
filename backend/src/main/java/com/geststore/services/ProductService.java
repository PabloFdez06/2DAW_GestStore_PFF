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
     * Obtiene todos los productos activos
     */
    public Page<ProductResponseDto> getAllProducts(Pageable pageable) {
        log.info("Obteniendo todos los productos activos, página: {}", pageable.getPageNumber());
        Page<Product> products = productRepository.findAll(pageable);
        return products.map(this::convertToDto);
    }

    /**
     * Obtiene un producto por ID
     */
    public ProductResponseDto getProductById(String id) {
        log.info("Buscando producto con ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));
        
        if (!product.getActive()) {
            throw new ResourceNotFoundException("Producto", id);
        }
        
        return convertToDto(product);
    }

    /**
     * Obtiene un producto por SKU
     */
    public ProductResponseDto getProductBySku(String sku) {
        log.info("Buscando producto con SKU: {}", sku);
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "SKU", sku));
        
        if (!product.getActive()) {
            throw new ResourceNotFoundException("Producto", "SKU", sku);
        }
        
        return convertToDto(product);
    }

    /**
     * Busca productos con bajo stock
     */
    public List<ProductResponseDto> getLowStockProducts() {
        log.info("Obteniendo productos con bajo stock");
        List<Product> products = productRepository.findLowStockProducts();
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca productos sin stock
     */
    public List<ProductResponseDto> getOutOfStockProducts() {
        log.info("Obteniendo productos sin stock");
        List<Product> products = productRepository.findOutOfStockProducts();
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca productos por categoría
     */
    public List<ProductResponseDto> getProductsByCategory(String category) {
        log.info("Obteniendo productos de la categoría: {}", category);
        List<Product> products = productRepository.findActiveProductsByCategory(category, true);
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca productos por nombre
     */
    public List<ProductResponseDto> searchProductsByName(String searchText) {
        log.info("Buscando productos con nombre: {}", searchText);
        List<Product> products = productRepository.searchByName(searchText);
        return products.stream()
                .filter(Product::getActive)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Crea un nuevo producto
     */
    public ProductResponseDto createProduct(ProductRequestDto requestDto) {
        log.info("Creando nuevo producto con SKU: {}", requestDto.getSku());

        if (productRepository.existsBySku(requestDto.getSku())) {
            throw new BusinessLogicException(
                    "El SKU ya existe: " + requestDto.getSku(),
                    "DUPLICATE_SKU"
            );
        }

        Product product = Product.builder()
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
     * Actualiza un producto
     */
    public ProductResponseDto updateProduct(String id, ProductRequestDto requestDto) {
        log.info("Actualizando producto con ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));

        if (!product.getSku().equals(requestDto.getSku()) &&
                productRepository.existsBySku(requestDto.getSku())) {
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
     * Desactiva un producto (soft delete)
     */
    public ProductResponseDto deactivateProduct(String id) {
        log.info("Desactivando producto con ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));

        product.setActive(false);
        product.onUpdate();
        Product updatedProduct = productRepository.save(product);
        log.info("Producto desactivado exitosamente con ID: {}", id);

        return convertToDto(updatedProduct);
    }

    /**
     * Obtiene estadísticas de productos
     */
    @Transactional(readOnly = true)
    public ProductStatistics getProductStatistics() {
        log.info("Obteniendo estadísticas de productos");
        
        long totalProducts = productRepository.count();
        long activeProducts = productRepository.findByActive(true).size();
        long lowStockProducts = productRepository.findLowStockProducts().size();
        long outOfStockProducts = productRepository.findOutOfStockProducts().size();

        return ProductStatistics.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .inactiveProducts(totalProducts - activeProducts)
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
