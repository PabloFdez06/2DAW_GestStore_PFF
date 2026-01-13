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

        TaskProduct taskProduct = TaskProduct.builder()
                .task(task)
                .product(product)
                .quantity(requestDto.getQuantity() != null ? requestDto.getQuantity() : 1)
                .quantityUsed(0)
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

        if (requestDto.getQuantity() != null) {
            taskProduct.setQuantity(requestDto.getQuantity());
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
     * Registra uso de producto
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

        taskProduct.setQuantityUsed(newQuantityUsed);
        TaskProduct updatedTaskProduct = taskProductRepository.save(taskProduct);
        log.info("Uso registrado exitosamente");

        return convertToDto(updatedTaskProduct);
    }

    /**
     * Elimina la asignación de un producto
     */
    public void removeProductFromTask(String id) {
        log.info("Eliminando asignación con ID: {}", id);

        TaskProduct taskProduct = taskProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asignación", id));

        if (taskProduct.getQuantityUsed() > 0) {
            throw new BusinessLogicException(
                    "No se puede eliminar una asignación con productos ya utilizados",
                    "PRODUCTS_ALREADY_USED"
            );
        }

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
