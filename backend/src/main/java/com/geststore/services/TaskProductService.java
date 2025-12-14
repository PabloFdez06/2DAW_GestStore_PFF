package com.geststore.services;

import com.geststore.exceptions.BusinessLogicException;
import com.geststore.exceptions.ResourceNotFoundException;
import com.geststore.models.dtos.TaskProductRequestDto;
import com.geststore.models.dtos.TaskProductResponseDto;
import com.geststore.models.dtos.ProductResponseDto;
import com.geststore.models.entities.*;
import com.geststore.repositories.TaskProductRepository;
import com.geststore.repositories.TaskRepository;
import com.geststore.repositories.ProductRepository;
import com.geststore.repositories.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de lógica de negocio para relación Task-Product
 * Maneja la asignación de productos a tareas y el control de stock
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TaskProductService {

    private final TaskProductRepository taskProductRepository;
    private final TaskRepository taskRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final StockService stockService;

    /**
     * Obtiene todos los productos asignados a una tarea
     */
    public List<TaskProductResponseDto> getProductsByTaskId(Long taskId) {
        log.info("Obteniendo productos de la tarea ID: {}", taskId);

        // Validar que la tarea existe
        taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", taskId));

        List<TaskProduct> taskProducts = taskProductRepository.findByTaskId(taskId);
        return taskProducts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene todas las tareas que usan un producto específico
     */
    public List<TaskProductResponseDto> getTasksByProductId(Long productId) {
        log.info("Obteniendo tareas que usan el producto ID: {}", productId);

        // Validar que el producto existe
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", productId));

        List<TaskProduct> taskProducts = taskProductRepository.findByProductId(productId);
        return taskProducts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Asigna un producto a una tarea
     * LÓGICA DE NEGOCIO:
     * - No puede existir ya una asignación del mismo producto a la misma tarea
     * - Debe haber stock disponible para reservar
     * - La tarea no debe estar completada o cancelada
     */
    public TaskProductResponseDto assignProductToTask(Long taskId, TaskProductRequestDto requestDto) {
        log.info("Asignando producto ID: {} a tarea ID: {}", requestDto.getProductId(), taskId);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", taskId));

        Product product = productRepository.findById(requestDto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto", requestDto.getProductId()));

        // Validar que la tarea no esté completada o cancelada
        if (task.getStatus().equals(TaskStatus.COMPLETED) || task.getStatus().equals(TaskStatus.CANCELLED)) {
            throw new BusinessLogicException(
                    "No se puede asignar productos a una tarea completada o cancelada",
                    "INVALID_TASK_STATE"
            );
        }

        // Validar que no existe ya una asignación
        if (taskProductRepository.findByTaskIdAndProductId(taskId, requestDto.getProductId()).isPresent()) {
            throw new BusinessLogicException(
                    "Este producto ya está asignado a esta tarea",
                    "DUPLICATE_ASSIGNMENT"
            );
        }

        // Validar que hay stock disponible
        Stock stock = product.getStock();
        if (stock == null) {
            throw new BusinessLogicException(
                    "El producto no tiene registro de stock",
                    "NO_STOCK_AVAILABLE"
            );
        }

        if (stock.getQuantityAvailable() < requestDto.getQuantity()) {
            throw new BusinessLogicException(
                    "Stock insuficiente. Disponible: " + stock.getQuantityAvailable() +
                    ", requerido: " + requestDto.getQuantity(),
                    "INSUFFICIENT_STOCK"
            );
        }

        // Reservar el stock
        stockService.reserveStock(stock.getId(), requestDto.getQuantity());

        // Crear asignación
        TaskProduct taskProduct = TaskProduct.builder()
                .task(task)
                .product(product)
                .quantity(requestDto.getQuantity())
                .quantityUsed(0)
                .notes(requestDto.getNotes())
                .build();

        TaskProduct savedTaskProduct = taskProductRepository.save(taskProduct);
        log.info("Producto asignado exitosamente a la tarea");

        return convertToDto(savedTaskProduct);
    }

    /**
     * Actualiza una asignación de producto a tarea
     * LÓGICA DE NEGOCIO:
     * - No se puede cambiar la cantidad si la tarea está completada
     */
    public TaskProductResponseDto updateTaskProduct(Long taskProductId, TaskProductRequestDto requestDto) {
        log.info("Actualizando asignación de producto ID: {}", taskProductId);

        TaskProduct taskProduct = taskProductRepository.findById(taskProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Asignación de producto a tarea", taskProductId));

        // Validar que la tarea no esté completada
        if (taskProduct.getTask().getStatus().equals(TaskStatus.COMPLETED)) {
            throw new BusinessLogicException(
                    "No se puede modificar un producto en una tarea completada",
                    "INVALID_TASK_STATE"
            );
        }

        // Si cambia la cantidad, ajustar el stock
        if (!taskProduct.getQuantity().equals(requestDto.getQuantity())) {
            Stock stock = taskProduct.getProduct().getStock();
            int quantityDifference = requestDto.getQuantity() - taskProduct.getQuantity();

            if (quantityDifference > 0) {
                // Necesita más stock, validar disponibilidad
                if (stock.getQuantityAvailable() < quantityDifference) {
                    throw new BusinessLogicException(
                            "Stock insuficiente para aumentar la cantidad. Disponible: " + stock.getQuantityAvailable(),
                            "INSUFFICIENT_STOCK"
                    );
                }
                // Reservar stock adicional
                stockService.reserveStock(stock.getId(), quantityDifference);
            } else {
                // Liberar stock sobrante
                stockService.releaseReservedStock(stock.getId(), Math.abs(quantityDifference));
            }

            taskProduct.setQuantity(requestDto.getQuantity());
        }

        taskProduct.setNotes(requestDto.getNotes());

        TaskProduct updatedTaskProduct = taskProductRepository.save(taskProduct);
        log.info("Asignación de producto actualizada exitosamente");

        return convertToDto(updatedTaskProduct);
    }

    /**
     * Registra la cantidad utilizada de un producto en una tarea
     * LÓGICA DE NEGOCIO:
     * - No se puede usar más de la cantidad asignada
     */
    public TaskProductResponseDto useProduct(Long taskProductId, int quantityUsed) {
        log.info("Registrando uso de {} unidades para asignación ID: {}", quantityUsed, taskProductId);

        TaskProduct taskProduct = taskProductRepository.findById(taskProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Asignación de producto a tarea", taskProductId));

        if (quantityUsed < 0 || quantityUsed > taskProduct.getQuantity()) {
            throw new BusinessLogicException(
                    "La cantidad utilizada no puede ser negativa o mayor a la cantidad asignada (" + taskProduct.getQuantity() + ")",
                    "INVALID_QUANTITY"
            );
        }

        taskProduct.setQuantityUsed(quantityUsed);

        TaskProduct updatedTaskProduct = taskProductRepository.save(taskProduct);
        log.info("Cantidad utilizada registrada exitosamente");

        return convertToDto(updatedTaskProduct);
    }

    /**
     * Elimina un producto de una tarea
     * LÓGICA DE NEGOCIO:
     * - Libera el stock reservado para ese producto
     * - No se puede eliminar de una tarea completada
     */
    public void removeProductFromTask(Long taskProductId) {
        log.info("Eliminando asignación de producto ID: {}", taskProductId);

        TaskProduct taskProduct = taskProductRepository.findById(taskProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Asignación de producto a tarea", taskProductId));

        // Validar que la tarea no esté completada
        if (taskProduct.getTask().getStatus().equals(TaskStatus.COMPLETED)) {
            throw new BusinessLogicException(
                    "No se puede eliminar un producto de una tarea completada",
                    "INVALID_TASK_STATE"
            );
        }

        // Liberar el stock reservado
        Stock stock = taskProduct.getProduct().getStock();
        int quantityToRelease = taskProduct.getQuantity() - taskProduct.getQuantityUsed();
        stockService.releaseReservedStock(stock.getId(), quantityToRelease);

        taskProductRepository.delete(taskProduct);
        log.info("Asignación de producto eliminada exitosamente");
    }

    /**
     * Obtiene productos con discrepancias (quantity != quantityUsed)
     */
    public List<TaskProductResponseDto> getProductsWithDiscrepancies() {
        log.info("Obteniendo productos con discrepancias de cantidad");
        List<TaskProduct> taskProducts = taskProductRepository.findWithQuantityDiscrepancies();
        return taskProducts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene productos no utilizados en una tarea
     */
    public List<TaskProductResponseDto> getUnusedProductsByTask(Long taskId) {
        log.info("Obteniendo productos no utilizados en tarea ID: {}", taskId);

        // Validar que la tarea existe
        taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", taskId));

        List<TaskProduct> taskProducts = taskProductRepository.findUnusedProductsByTask(taskId);
        return taskProducts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene productos utilizados en una tarea
     */
    public List<TaskProductResponseDto> getUsedProductsByTask(Long taskId) {
        log.info("Obteniendo productos utilizados en tarea ID: {}", taskId);

        // Validar que la tarea existe
        taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", taskId));

        List<TaskProduct> taskProducts = taskProductRepository.findUsedProductsByTask(taskId);
        return taskProducts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Calcula la cantidad total reservada de un producto
     */
    @Transactional(readOnly = true)
    public Integer calculateTotalReservedQuantity(Long productId) {
        log.info("Calculando cantidad total reservada para producto ID: {}", productId);

        // Validar que el producto existe
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", productId));

        return taskProductRepository.calculateTotalReservedQuantity(productId);
    }

    /**
     * Convierte una entidad TaskProduct a TaskProductResponseDto
     */
    private TaskProductResponseDto convertToDto(TaskProduct taskProduct) {
        return TaskProductResponseDto.builder()
                .id(taskProduct.getId())
                .quantity(taskProduct.getQuantity())
                .quantityUsed(taskProduct.getQuantityUsed())
                .notes(taskProduct.getNotes())
                .createdAt(taskProduct.getCreatedAt())
                .product(convertProductToDto(taskProduct.getProduct()))
                .build();
    }

    private ProductResponseDto convertProductToDto(Product product) {
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
                .build();
    }
}
