package com.geststore.repositories;

import com.geststore.models.entities.TaskProduct;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad TaskProduct
 * Proporciona métodos CRUD y consultas personalizadas para la relación tarea-producto
 */
@Repository
public interface TaskProductRepository extends MongoRepository<TaskProduct, String> {

    /**
     * Busca todos los productos de una tarea
     */
    @Query("{'task.$id': ObjectId(?0)}")
    List<TaskProduct> findByTaskId(String taskId);

    /**
     * Busca todas las tareas que usan un producto específico
     */
    @Query("{'product.$id': ObjectId(?0)}")
    List<TaskProduct> findByProductId(String productId);

    /**
     * Busca un producto específico en una tarea
     */
    @Query("{'task.$id': ObjectId(?0), 'product.$id': ObjectId(?1)}")
    Optional<TaskProduct> findByTaskIdAndProductId(String taskId, String productId);

    /**
     * Busca productos que tienen cantidad utilizada diferente de la requerida
     */
    @Query("{ $expr: { $ne: ['$quantityUsed', '$quantity'] } }")
    List<TaskProduct> findWithQuantityDiscrepancies();

    /**
     * Busca productos que aún no han sido utilizados en una tarea
     */
    @Query("{'task.$id': ObjectId(?0), 'quantityUsed': 0}")
    List<TaskProduct> findUnusedProductsByTask(String taskId);

    /**
     * Busca productos utilizados en una tarea
     */
    @Query("{'task.$id': ObjectId(?0), 'quantityUsed': {$gt: 0}}")
    List<TaskProduct> findUsedProductsByTask(String taskId);

    /**
     * Cuenta el número de productos en una tarea
     */
    @Query(value = "{'task.$id': ObjectId(?0)}", count = true)
    Long countByTaskId(String taskId);

    /**
     * Elimina todos los productos asociados a una tarea
     */
    @Query(value = "{'task.$id': ObjectId(?0)}", delete = true)
    void deleteByTaskId(String taskId);
}
