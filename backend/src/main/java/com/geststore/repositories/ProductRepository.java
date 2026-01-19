package com.geststore.repositories;

import com.geststore.models.entities.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Product
 * Proporciona métodos CRUD y consultas personalizadas para productos
 */
@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    /**
     * Busca un producto por SKU y userId
     */
    Optional<Product> findBySkuAndUserId(String sku, String userId);

    /**
     * Busca todos los productos activos de un usuario
     */
    List<Product> findByActiveAndUserId(Boolean active, String userId);

    /**
     * Busca todos los productos activos de un usuario con paginación
     */
    Page<Product> findByActiveAndUserId(Boolean active, String userId, Pageable pageable);

    /**
     * Busca productos por categoría y usuario
     */
    List<Product> findByCategoryAndUserId(String category, String userId);

    /**
     * Busca productos cuyo nombre contiene el texto buscado para un usuario específico
     */
    @Query("{'name': {$regex: ?0, $options: 'i'}, 'userId': ?1}")
    List<Product> searchByNameAndUserId(String searchText, String userId);

    /**
     * Busca productos activos de una categoría específica para un usuario
     */
    List<Product> findByCategoryAndActiveAndUserId(String category, Boolean active, String userId);

    /**
     * Método para compatibilidad
     */
    default List<Product> findActiveProductsByCategoryAndUserId(String category, Boolean active, String userId) {
        return findByCategoryAndActiveAndUserId(category, active, userId);
    }

    /**
     * Busca productos con bajo stock de un usuario
     */
    @Query("{ $expr: { $lt: ['$stockQuantity', '$minStockLevel'] }, 'active': true, 'userId': ?0 }")
    List<Product> findLowStockProductsByUserId(String userId);

    /**
     * Busca productos sin stock de un usuario
     */
    @Query("{ 'stockQuantity': 0, 'active': true, 'userId': ?0 }")
    List<Product> findOutOfStockProductsByUserId(String userId);

    /**
     * Verifica si existe un producto con el SKU especificado para un usuario
     */
    Boolean existsBySkuAndUserId(String sku, String userId);
}
