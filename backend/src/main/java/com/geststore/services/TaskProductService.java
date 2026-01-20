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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para relación Task-Product
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TaskProductService {

    private final TaskProductRepository taskProductRepository;
    private final TaskRepository taskRepository;
    private final ProductRepository productRepository;

    /**
     * Obtiene todos los productos asignados a una tarea
     */
    public List<TaskProductResponseDto> getProductsByTaskId(String taskId) {
        log.info("Obteniendo productos de la tarea ID: {}", taskId);

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
    public List<TaskProductResponseDto> getTasksByProductId(String productId) {
        log.info("Obteniendo tareas que usan el producto ID: {}", productId);

        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", productId));

        List<TaskProduct> taskProducts = taskProductRepository.findByProductId(productId);
        return taskProducts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Asigna un producto a una tarea
     */
    public TaskProductResponseDto assignProductToTask(String taskId, TaskProductRequestDto requestDto) {
        log.info("Asignando producto ID: {} a tarea ID: {}", requestDto.getProductId(), taskId);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea", taskId));

        Product product = productRepository.findById(requestDto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto", requestDto.getProductId()));

        // Validar que la tarea no esté completada o cancelada
        if (task.getStatus() == TaskStatus.COMPLETED || task.getStatus() == TaskStatus.CANCELLED) {
            throw new BusinessLogicException(
                    "No se pueden asignar productos a tareas completadas o canceladas",
                    "INVALID_TASK_STATE"
            );
        }

        // Validar que no exista ya la asignación
        if (taskProductRepository.findByTaskIdAndProductId(taskId, requestDto.getProductId()).isPresent()) {
            throw new BusinessLogicException(
                    "El producto ya está asignado a esta tarea",
                    "DUPLICATE_ASSIGNMENT"
            );
        }

        int quantityToAssign = requestDto.getQuantity() != null ? requestDto.getQuantity() : 1;

        // Validar y descontar el stock del producto
        int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        if (currentStock < quantityToAssign) {
            throw new BusinessLogicException(
                    "No hay suficiente stock del producto. Stock actual: " + currentStock + ", cantidad solicitada: " + quantityToAssign,
                    "INSUFFICIENT_STOCK"
            );
        }

        // Descontar el stock
        product.setStockQuantity(currentStock - quantityToAssign);
        product.onUpdate();
        productRepository.save(product);
        log.info("Stock del producto {} decrementado de {} a {}", product.getId(), currentStock, currentStock - quantityToAssign);

        TaskProduct taskProduct = TaskProduct.builder()
                .task(task)
                .product(product)
                .quantity(quantityToAssign)
                .quantityUsed(0)  // Cantidad usada inicia en 0
                .notes(requestDto.getNotes())
                .build();

        taskProduct.onCreate();
        TaskProduct savedTaskProduct = taskProductRepository.save(taskProduct);
        log.info("Producto asignado exitosamente");

        return convertToDto(savedTaskProduct);
    }

    /**
     * Actualiza la asignación de un producto
     */
    public TaskProductResponseDto updateTaskProduct(String id, TaskProductRequestDto requestDto) {
        log.info("Actualizando asignación con ID: {}", id);

        TaskProduct taskProduct = taskProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asignación", id));

        // Ajustar stock si cambia la cantidad asignada
        if (requestDto.getQuantity() != null) {
            int oldQuantity = taskProduct.getQuantity();
            int newQuantity = requestDto.getQuantity();
            int difference = oldQuantity - newQuantity;
            
            if (difference != 0) {
                Product product = taskProduct.getProduct();
                int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                
                if (difference > 0) {
                    // Se reduce la cantidad asignada -> devolver stock al almacén
                    product.setStockQuantity(currentStock + difference);
                    log.info("Stock del producto {} incrementado de {} a {} (devueltas {} unidades)", 
                            product.getId(), currentStock, currentStock + difference, difference);
                } else {
                    // Se aumenta la cantidad asignada -> restar stock del almacén
                    int quantityToSubtract = Math.abs(difference);
                    if (currentStock < quantityToSubtract) {
                        throw new BusinessLogicException(
                                "No hay suficiente stock del producto. Stock actual: " + currentStock + ", requerido: " + quantityToSubtract,
                                "INSUFFICIENT_STOCK"
                        );
                    }
                    product.setStockQuantity(currentStock - quantityToSubtract);
                    log.info("Stock del producto {} decrementado de {} a {} (asignadas {} unidades adicionales)", 
                            product.getId(), currentStock, currentStock - quantityToSubtract, quantityToSubtract);
                }
                
                product.onUpdate();
                productRepository.save(product);
            }
            
            taskProduct.setQuantity(newQuantity);
        }
        if (requestDto.getQuantityUsed() != null) {
            taskProduct.setQuantityUsed(requestDto.getQuantityUsed());
        }
        if (requestDto.getNotes() != null) {
            taskProduct.setNotes(requestDto.getNotes());
        }

        TaskProduct updatedTaskProduct = taskProductRepository.save(taskProduct);
        log.info("Asignación actualizada exitosamente");

        return convertToDto(updatedTaskProduct);
    }

    /**
     * Registra uso de producto y decrementa el stock del producto
     */
    public TaskProductResponseDto useProduct(String id, int quantity) {
        log.info("Registrando uso de {} unidades en asignación ID: {}", quantity, id);

        TaskProduct taskProduct = taskProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asignación", id));

        int newQuantityUsed = taskProduct.getQuantityUsed() + quantity;
        if (newQuantityUsed > taskProduct.getQuantity()) {
            throw new BusinessLogicException(
                    "La cantidad utilizada no puede superar la cantidad asignada",
                    "QUANTITY_EXCEEDED"
            );
        }

        // Decrementar el stock del producto
        Product product = taskProduct.getProduct();
        int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        int newStock = currentStock - quantity;
        
        if (newStock < 0) {
            throw new BusinessLogicException(
                    "No hay suficiente stock del producto. Stock actual: " + currentStock,
                    "INSUFFICIENT_STOCK"
            );
        }
        
        product.setStockQuantity(newStock);
        product.onUpdate();
        productRepository.save(product);
        log.info("Stock del producto {} decrementado de {} a {}", product.getId(), currentStock, newStock);

        taskProduct.setQuantityUsed(newQuantityUsed);
        TaskProduct updatedTaskProduct = taskProductRepository.save(taskProduct);
        log.info("Uso registrado exitosamente");

        return convertToDto(updatedTaskProduct);
    }

    /**
     * Elimina la asignación de un producto y devuelve el stock al almacén
     */
    public void removeProductFromTask(String id) {
        log.info("Eliminando asignación con ID: {}", id);

        TaskProduct taskProduct = taskProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asignación", id));

        // Devolver el stock al almacén
        Product product = taskProduct.getProduct();
        int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        int quantityToReturn = taskProduct.getQuantity();
        
        product.setStockQuantity(currentStock + quantityToReturn);
        product.onUpdate();
        productRepository.save(product);
        log.info("Stock del producto {} incrementado de {} a {}", product.getId(), currentStock, currentStock + quantityToReturn);

        taskProductRepository.delete(taskProduct);
        log.info("Asignación eliminada exitosamente");
    }

    /**
     * Convierte TaskProduct a DTO
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
                .stockQuantity(product.getStockQuantity())
                .minStockLevel(product.getMinStockLevel())
                .locationInWarehouse(product.getLocationInWarehouse())
                .build();
    }
}
