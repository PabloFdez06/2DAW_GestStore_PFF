package com.geststore.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entidad TaskProduct - Relación N:M entre Task y Product
 * Permite asignar múltiples productos a una tarea con cantidades específicas.
 *
 * Relaciones:
 * - N:1 con Task
 * - N:1 con Product
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "task_products", indexes = {
    @Index(name = "idx_task_id", columnList = "task_id"),
    @Index(name = "idx_product_id", columnList = "product_id"),
    @Index(name = "idx_task_product", columnList = "task_id, product_id", unique = true)
})
public class TaskProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Cantidad de producto requerido para la tarea
     */
    @Column(nullable = false, columnDefinition = "INT DEFAULT 1")
    private Integer quantity = 1;

    /**
     * Cantidad utilizada/consumida en la tarea
     */
    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer quantityUsed = 0;

    /**
     * Observaciones sobre el producto en la tarea
     */
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Tarea que requiere este producto
     * Relación N:1
     */
    @ManyToOne(optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    /**
     * Producto requerido para la tarea
     * Relación N:1
     */
    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
