package com.geststore.repositories;

import com.geststore.models.entities.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Product
 * Proporciona métodos CRUD y consultas personalizadas para productos
 */
@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    /**
     * Busca un producto por SKU
     */
    Optional<Product> findBySku(String sku);

    /**
     * Busca todos los productos activos
     */
    List<Product> findByActive(Boolean active);

    /**
     * Busca productos por categoría
     */
    List<Product> findByCategory(String category);

    /**
     * Busca productos cuyo nombre contiene el texto buscado
     */
    @Query("{'name': {$regex: ?0, $options: 'i'}}")
    List<Product> searchByName(String searchText);

    /**
     * Busca productos activos de una categoría específica
     */
    List<Product> findByCategoryAndActive(String category, Boolean active);

    /**
     * Método para compatibilidad
     */
    default List<Product> findActiveProductsByCategory(String category, Boolean active) {
        return findByCategoryAndActive(category, active);
    }

    /**
     * Busca productos con bajo stock
     */
    @Query("{ $expr: { $lt: ['$stockQuantity', '$minStockLevel'] }, 'active': true }")
    List<Product> findLowStockProducts();

    /**
     * Busca productos sin stock
     */
    @Query("{ 'stockQuantity': 0, 'active': true }")
    List<Product> findOutOfStockProducts();

    /**
     * Verifica si existe un producto con el SKU especificado
     */
    Boolean existsBySku(String sku);
}
