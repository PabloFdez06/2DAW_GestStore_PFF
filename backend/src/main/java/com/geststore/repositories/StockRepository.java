package com.geststore.repositories;

import com.geststore.models.entities.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Stock
 * Proporciona métodos CRUD y consultas personalizadas para inventario
 */
@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    /**
     * Busca el stock de un producto por su ID
     * @param productId id del producto
     * @return Optional con el stock si existe
     */
    Optional<Stock> findByProductId(Long productId);

    /**
     * Encuentra todos los stocks con cantidad disponible igual a 0
     * @return lista de stocks sin productos disponibles
     */
    @Query("SELECT s FROM Stock s WHERE s.quantityAvailable = 0 ORDER BY s.product.name")
    List<Stock> findOutOfStockItems();

    /**
     * Encuentra todos los stocks por debajo del nivel mínimo
     * @return lista de stocks con cantidad disponible < nivel mínimo
     */
    @Query("SELECT s FROM Stock s WHERE s.quantityAvailable < s.minimumLevel ORDER BY s.quantityAvailable ASC")
    List<Stock> findBelowMinimumLevel();

    /**
     * Busca stocks en una ubicación específica
     * @param location la ubicación en el almacén
     * @return lista de stocks en esa ubicación
     */
    List<Stock> findByLocation(String location);

    /**
     * Encuentra los productos más reservados
     * @return lista de stocks ordenados por cantidad reservada (descendente)
     */
    @Query("SELECT s FROM Stock s WHERE s.quantityReserved > 0 ORDER BY s.quantityReserved DESC")
    List<Stock> findMostReservedItems();

    /**
     * Busca stocks con más cantidad disponible que reservada
     * @return lista de stocks con inventario balanceado
     */
    @Query("SELECT s FROM Stock s WHERE s.quantityAvailable > s.quantityReserved ORDER BY s.product.name")
    List<Stock> findWellStockedItems();

    /**
     * Calcula el valor total del inventario
     * @return suma del valor de todos los productos en stock
     */
    @Query("SELECT COALESCE(SUM(s.quantityAvailable * p.unitPrice), 0) FROM Stock s JOIN s.product p")
    Double calculateTotalInventoryValue();

    /**
     * Encuentra stocks que necesitan reabastecimiento inmediato
     * Considera los últimos actualizados
     * @return lista de stocks críticos
     */
    @Query("SELECT s FROM Stock s WHERE s.quantityAvailable <= s.minimumLevel ORDER BY s.lastUpdated DESC")
    List<Stock> findCriticalStocks();
}
