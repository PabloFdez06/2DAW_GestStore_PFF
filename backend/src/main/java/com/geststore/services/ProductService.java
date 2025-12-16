package com.geststore.services;

import com.geststore.exceptions.BusinessLogicException;
import com.geststore.exceptions.ResourceNotFoundException;
import com.geststore.models.dtos.ProductRequestDto;
import com.geststore.models.dtos.ProductResponseDto;
import com.geststore.models.dtos.StockResponseDto;
import com.geststore.models.entities.Product;
import com.geststore.models.entities.Stock;
import com.geststore.repositories.ProductRepository;
import com.geststore.repositories.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
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
    private final StockRepository stockRepository;

    /**
     * Obtiene todos los productos activos
     */
    public Page<ProductResponseDto> getAllProducts(Pageable pageable) {
        log.info("Obteniendo todos los productos activos, página: {}", pageable.getPageNumber());
        Page<Product> products = productRepository.findByActive(true);
        return products.map(this::convertToDto);
    }

    /**
     * Obtiene un producto por ID
     */
    public ProductResponseDto getProductById(Long id) {
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
     * LÓGICA DE NEGOCIO:
     * - El SKU debe ser único
     * - Se crea automáticamente un registro de Stock
     * - El producto es activo por defecto
     */
    public ProductResponseDto createProduct(ProductRequestDto requestDto) {
        log.info("Creando nuevo producto con SKU: {}", requestDto.getSku());

        // Validar que el SKU sea único
        if (productRepository.existsBySku(requestDto.getSku())) {
            throw new BusinessLogicException(
                    "El SKU ya existe: " + requestDto.getSku(),
                    "DUPLICATE_SKU"
            );
        }

        // Crear producto
        Product product = Product.builder()
                .name(requestDto.getName())
                .sku(requestDto.getSku())
                .description(requestDto.getDescription())
                .unitPrice(requestDto.getUnitPrice())
                .category(requestDto.getCategory())
                .active(true)
                .build();

        Product savedProduct = productRepository.save(product);

        // Crear registro de stock automáticamente
        Stock stock = Stock.builder()
                .product(savedProduct)
                .quantityAvailable(0)
                .quantityReserved(0)
                .minimumLevel(10)
                .lastUpdated(LocalDateTime.now())
                .build();

        stockRepository.save(stock);
        savedProduct.setStock(stock);

        log.info("Producto creado exitosamente con ID: {}", savedProduct.getId());

        return convertToDto(savedProduct);
    }

    /**
     * Actualiza un producto
     * LÓGICA DE NEGOCIO:
     * - No se puede cambiar el SKU si ya existe otro producto con ese SKU
     */
    public ProductResponseDto updateProduct(Long id, ProductRequestDto requestDto) {
        log.info("Actualizando producto con ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));

        // Si cambia el SKU, validar que sea único
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

        Product updatedProduct = productRepository.save(product);
        log.info("Producto actualizado exitosamente con ID: {}", id);

        return convertToDto(updatedProduct);
    }

    /**
     * Desactiva un producto (soft delete)
     * LÓGICA DE NEGOCIO:
     * - No se puede desactivar si tiene stock reservado
     */
    public ProductResponseDto deactivateProduct(Long id) {
        log.info("Desactivando producto con ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));

        // Validar que no tenga stock reservado
        if (product.getStock() != null && product.getStock().getQuantityReserved() > 0) {
            throw new BusinessLogicException(
                    "No se puede desactivar un producto con " + product.getStock().getQuantityReserved() + " unidad(es) reservada(s)",
                    "PRODUCT_HAS_RESERVED_STOCK"
            );
        }

        product.setActive(false);
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

        List<Product> allProducts = productRepository.findByActive(true);
        List<Product> lowStockProducts = productRepository.findLowStockProducts();
        List<Product> outOfStockProducts = productRepository.findOutOfStockProducts();
        Long distinctCategories = productRepository.countDistinctCategories();

        return ProductStatistics.builder()
                .totalProducts((long) allProducts.size())
                .lowStockCount((long) lowStockProducts.size())
                .outOfStockCount((long) outOfStockProducts.size())
                .distinctCategories(distinctCategories)
                .build();
    }

    /**
     * Convierte una entidad Product a ProductResponseDto
     */
    private ProductResponseDto convertToDto(Product product) {
        StockResponseDto stockDto = null;
        if (product.getStock() != null) {
            Stock stock = product.getStock();
            stockDto = StockResponseDto.builder()
                    .id(stock.getId())
                    .quantityAvailable(stock.getQuantityAvailable())
                    .quantityReserved(stock.getQuantityReserved())
                    .minimumLevel(stock.getMinimumLevel())
                    .location(stock.getLocation())
                    .totalQuantity(stock.getTotalQuantity())
                    .lowStock(stock.isLowStock())
                    .lastUpdated(stock.getLastUpdated())
                    .build();
        }

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
                .stock(stockDto)
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
        private long lowStockCount;
        private long outOfStockCount;
        private long distinctCategories;
    }
}
