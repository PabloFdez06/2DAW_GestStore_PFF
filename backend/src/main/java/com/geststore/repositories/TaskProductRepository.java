package com.geststore.repositories;

import com.geststore.models.entities.TaskProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad TaskProduct
 * Proporciona métodos CRUD y consultas personalizadas para la relación tarea-producto
 */
@Repository
public interface TaskProductRepository extends JpaRepository<TaskProduct, Long> {

    /**
     * Busca todos los productos de una tarea
     * @param taskId id de la tarea
     * @return lista de productos asignados a esa tarea
     */
    @Query("SELECT tp FROM TaskProduct tp WHERE tp.task.id = :taskId ORDER BY tp.createdAt DESC")
    List<TaskProduct> findByTaskId(@Param("taskId") Long taskId);

    /**
     * Busca todas las tareas que usan un producto específico
     * @param productId id del producto
     * @return lista de tareas que usan ese producto
     */
    @Query("SELECT tp FROM TaskProduct tp WHERE tp.product.id = :productId ORDER BY tp.task.dueDate ASC")
    List<TaskProduct> findByProductId(@Param("productId") Long productId);

    /**
     * Busca un producto específico en una tarea
     * @param taskId id de la tarea
     * @param productId id del producto
     * @return Optional con la relación si existe
     */
    @Query("SELECT tp FROM TaskProduct tp WHERE tp.task.id = :taskId AND tp.product.id = :productId")
    Optional<TaskProduct> findByTaskIdAndProductId(@Param("taskId") Long taskId, @Param("productId") Long productId);

    /**
     * Calcula la cantidad total de un producto requerido en todas las tareas activas
     * @param productId id del producto
     * @return cantidad total reservada
     */
    @Query("SELECT COALESCE(SUM(tp.quantity), 0) FROM TaskProduct tp WHERE tp.product.id = :productId AND tp.task.status != 'COMPLETED' AND tp.task.status != 'CANCELLED'")
    Integer calculateTotalReservedQuantity(@Param("productId") Long productId);

    /**
     * Busca productos que tienen cantidad utilizada diferente de la requerida
     * @return lista de relaciones con discrepancias
     */
    @Query("SELECT tp FROM TaskProduct tp WHERE tp.quantityUsed != tp.quantity ORDER BY tp.task.id")
    List<TaskProduct> findWithQuantityDiscrepancies();

    /**
     * Busca productos que aún no han sido utilizados en una tarea
     * @param taskId id de la tarea
     * @return lista de productos sin usar
     */
    @Query("SELECT tp FROM TaskProduct tp WHERE tp.task.id = :taskId AND tp.quantityUsed = 0 ORDER BY tp.createdAt")
    List<TaskProduct> findUnusedProductsByTask(@Param("taskId") Long taskId);

    /**
     * Busca productos utilizados en una tarea
     * @param taskId id de la tarea
     * @return lista de productos con cantidad utilizada > 0
     */
    @Query("SELECT tp FROM TaskProduct tp WHERE tp.task.id = :taskId AND tp.quantityUsed > 0 ORDER BY tp.createdAt")
    List<TaskProduct> findUsedProductsByTask(@Param("taskId") Long taskId);

    /**
     * Cuenta el número de productos en una tarea
     * @param taskId id de la tarea
     * @return número de productos
     */
    Long countByTaskId(Long taskId);
}
