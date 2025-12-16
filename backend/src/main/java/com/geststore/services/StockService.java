package com.geststore.services;

import com.geststore.exceptions.BusinessLogicException;
import com.geststore.exceptions.ResourceNotFoundException;
import com.geststore.models.dtos.StockRequestDto;
import com.geststore.models.dtos.StockResponseDto;
import com.geststore.models.entities.Stock;
import com.geststore.models.entities.Product;
import com.geststore.repositories.StockRepository;
import com.geststore.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de lógica de negocio para Stock/Inventario
 * Maneja operaciones CRUD y validaciones
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class StockService {

    private final StockRepository stockRepository;
    private final ProductRepository productRepository;

    /**
     * Obtiene el stock de un producto
     */
    public StockResponseDto getStockByProductId(Long productId) {
        log.info("Obteniendo stock para producto ID: {}", productId);

        Stock stock = stockRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock para producto", productId));

        return convertToDto(stock);
    }

    /**
     * Obtiene todos los productos con bajo stock
     */
    public List<StockResponseDto> getBelowMinimumLevel() {
        log.info("Obteniendo productos con stock por debajo del mínimo");
        List<Stock> stocks = stockRepository.findBelowMinimumLevel();
        return stocks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene todos los productos sin stock
     */
    public List<StockResponseDto> getOutOfStockItems() {
        log.info("Obteniendo productos sin stock");
        List<Stock> stocks = stockRepository.findOutOfStockItems();
        return stocks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene stocks críticos que necesitan reabastecimiento
     */
    public List<StockResponseDto> getCriticalStocks() {
        log.info("Obteniendo stocks críticos");
        List<Stock> stocks = stockRepository.findCriticalStocks();
        return stocks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene el stock más reservado
     */
    public List<StockResponseDto> getMostReservedItems() {
        log.info("Obteniendo artículos más reservados");
        List<Stock> stocks = stockRepository.findMostReservedItems();
        return stocks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Actualiza el stock de un producto
     * LÓGICA DE NEGOCIO:
     * - Validar que la cantidad disponible no sea negativa
     * - Actualizar lastUpdated
     */
    public StockResponseDto updateStock(Long stockId, StockRequestDto requestDto) {
        log.info("Actualizando stock con ID: {}", stockId);

        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock", stockId));

        // Validar cantidades
        if (requestDto.getQuantityAvailable() < 0) {
            throw new BusinessLogicException(
                    "La cantidad disponible no puede ser negativa",
                    "INVALID_QUANTITY"
            );
        }

        if (requestDto.getQuantityReserved() < 0) {
            throw new BusinessLogicException(
                    "La cantidad reservada no puede ser negativa",
                    "INVALID_QUANTITY"
            );
        }

        stock.setQuantityAvailable(requestDto.getQuantityAvailable());
        stock.setQuantityReserved(requestDto.getQuantityReserved());
        stock.setMinimumLevel(requestDto.getMinimumLevel());
        stock.setLocation(requestDto.getLocation());
        stock.setLastUpdated(LocalDateTime.now());

        Stock updatedStock = stockRepository.save(stock);
        log.info("Stock actualizado exitosamente con ID: {}", stockId);

        return convertToDto(updatedStock);
    }

    /**
     * Aumenta la cantidad disponible de stock
     */
    public StockResponseDto increaseStock(Long stockId, int quantity) {
        log.info("Aumentando stock ID: {} en {} unidades", stockId, quantity);

        if (quantity <= 0) {
            throw new BusinessLogicException(
                    "La cantidad a aumentar debe ser positiva",
                    "INVALID_QUANTITY"
            );
        }

        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock", stockId));

        stock.setQuantityAvailable(stock.getQuantityAvailable() + quantity);
        stock.setLastUpdated(LocalDateTime.now());

        Stock updatedStock = stockRepository.save(stock);
        log.info("Stock aumentado exitosamente");

        return convertToDto(updatedStock);
    }

    /**
     * Reduce la cantidad disponible de stock
     * LÓGICA DE NEGOCIO:
     * - No se puede reducir más de lo disponible
     */
    public StockResponseDto decreaseStock(Long stockId, int quantity) {
        log.info("Reduciendo stock ID: {} en {} unidades", stockId, quantity);

        if (quantity <= 0) {
            throw new BusinessLogicException(
                    "La cantidad a reducir debe ser positiva",
                    "INVALID_QUANTITY"
            );
        }

        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock", stockId));

        if (stock.getQuantityAvailable() < quantity) {
            throw new BusinessLogicException(
                    "Stock insuficiente. Disponible: " + stock.getQuantityAvailable() + ", requerido: " + quantity,
                    "INSUFFICIENT_STOCK"
            );
        }

        stock.setQuantityAvailable(stock.getQuantityAvailable() - quantity);
        stock.setLastUpdated(LocalDateTime.now());

        Stock updatedStock = stockRepository.save(stock);
        log.info("Stock reducido exitosamente");

        return convertToDto(updatedStock);
    }

    /**
     * Reserva cantidad de stock para una tarea
     */
    public StockResponseDto reserveStock(Long stockId, int quantity) {
        log.info("Reservando {} unidades de stock ID: {}", quantity, stockId);

        if (quantity <= 0) {
            throw new BusinessLogicException(
                    "La cantidad a reservar debe ser positiva",
                    "INVALID_QUANTITY"
            );
        }

        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock", stockId));

        if (stock.getQuantityAvailable() < quantity) {
            throw new BusinessLogicException(
                    "Stock insuficiente para reservar. Disponible: " + stock.getQuantityAvailable() + ", requerido: " + quantity,
                    "INSUFFICIENT_STOCK"
            );
        }

        stock.setQuantityAvailable(stock.getQuantityAvailable() - quantity);
        stock.setQuantityReserved(stock.getQuantityReserved() + quantity);
        stock.setLastUpdated(LocalDateTime.now());

        Stock updatedStock = stockRepository.save(stock);
        log.info("Stock reservado exitosamente");

        return convertToDto(updatedStock);
    }

    /**
     * Libera stock reservado (cuando se cancela una tarea)
     */
    public StockResponseDto releaseReservedStock(Long stockId, int quantity) {
        log.info("Liberando {} unidades reservadas de stock ID: {}", quantity, stockId);

        if (quantity <= 0) {
            throw new BusinessLogicException(
                    "La cantidad a liberar debe ser positiva",
                    "INVALID_QUANTITY"
            );
        }

        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock", stockId));

        if (stock.getQuantityReserved() < quantity) {
            throw new BusinessLogicException(
                    "No hay suficiente stock reservado para liberar. Reservado: " + stock.getQuantityReserved(),
                    "INVALID_QUANTITY"
            );
        }

        stock.setQuantityReserved(stock.getQuantityReserved() - quantity);
        stock.setQuantityAvailable(stock.getQuantityAvailable() + quantity);
        stock.setLastUpdated(LocalDateTime.now());

        Stock updatedStock = stockRepository.save(stock);
        log.info("Stock reservado liberado exitosamente");

        return convertToDto(updatedStock);
    }

    /**
     * Calcula el valor total del inventario
     */
    @Transactional(readOnly = true)
    public Double getInventoryValue() {
        log.info("Calculando valor total del inventario");
        return stockRepository.calculateTotalInventoryValue();
    }

    /**
     * Obtiene estadísticas del inventario
     */
    @Transactional(readOnly = true)
    public InventoryStatistics getInventoryStatistics() {
        log.info("Obteniendo estadísticas del inventario");

        List<Stock> allStocks = stockRepository.findAll();
        List<Stock> lowStocks = stockRepository.findBelowMinimumLevel();
        List<Stock> criticalStocks = stockRepository.findCriticalStocks();

        return InventoryStatistics.builder()
                .totalProducts((long) allStocks.size())
                .lowStockCount((long) lowStocks.size())
                .criticalStockCount((long) criticalStocks.size())
                .totalInventoryValue(getInventoryValue())
                .build();
    }

    /**
     * Convierte una entidad Stock a StockResponseDto
     */
    private StockResponseDto convertToDto(Stock stock) {
        return StockResponseDto.builder()
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

    /**
     * DTO para estadísticas de inventario
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class InventoryStatistics {
        private long totalProducts;
        private long lowStockCount;
        private long criticalStockCount;
        private Double totalInventoryValue;
    }
}
