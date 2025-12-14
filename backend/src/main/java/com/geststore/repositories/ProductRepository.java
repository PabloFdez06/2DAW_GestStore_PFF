package com.geststore.repositories;

import com.geststore.models.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Product
 * Proporciona métodos CRUD y consultas personalizadas para productos
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Busca un producto por SKU
     * @param sku código SKU del producto
     * @return Optional con el producto si existe
     */
    Optional<Product> findBySku(String sku);

    /**
     * Busca todos los productos activos
     * @return lista de productos activos
     */
    List<Product> findByActive(Boolean active);

    /**
     * Busca productos por categoría
     * @param category la categoría
     * @return lista de productos de esa categoría
     */
    List<Product> findByCategory(String category);

    /**
     * Busca productos cuyo nombre contiene el texto buscado
     * @param searchText texto de búsqueda
     * @return lista de productos cuyo nombre contiene el texto
     */
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :searchText, '%')) ORDER BY p.name")
    List<Product> searchByName(@Param("searchText") String searchText);

    /**
     * Busca productos activos de una categoría específica
     * @param category la categoría
     * @param active estado activo
     * @return lista de productos activos de esa categoría
     */
    @Query("SELECT p FROM Product p WHERE p.category = :category AND p.active = :active ORDER BY p.name")
    List<Product> findActiveProductsByCategory(@Param("category") String category, @Param("active") Boolean active);

    /**
     * Busca productos con bajo stock
     * @return lista de productos cuya cantidad disponible es menor que el mínimo
     */
    @Query("SELECT p FROM Product p WHERE p.stock.quantityAvailable < p.stock.minimumLevel ORDER BY p.stock.quantityAvailable ASC")
    List<Product> findLowStockProducts();

    /**
     * Busca productos sin stock
     * @return lista de productos con cantidad disponible igual a 0
     */
    @Query("SELECT p FROM Product p WHERE p.stock.quantityAvailable = 0 ORDER BY p.name")
    List<Product> findOutOfStockProducts();

    /**
     * Verifica si existe un producto con el SKU especificado
     * @param sku código SKU
     * @return true si existe, false si no
     */
    Boolean existsBySku(String sku);

    /**
     * Cuenta el número de categorías distintas
     * @return número de categorías
     */
    @Query("SELECT COUNT(DISTINCT p.category) FROM Product p WHERE p.active = true")
    Long countDistinctCategories();
}
