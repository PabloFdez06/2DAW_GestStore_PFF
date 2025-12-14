package com.geststore.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entidad Product - Representa los productos disponibles en el almacén
 * Contiene información de cada producto y su disponibilidad.
 *
 * Relaciones:
 * - 1:1 con Stock (inventario del producto)
 * - N:M con Task (a través de TaskProduct)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_sku", columnList = "sku", unique = true),
    @Index(name = "idx_name", columnList = "name")
})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(length = 50)
    private String category;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Información de inventario del producto
     * Relación 1:1 - Un producto tiene un único registro de stock
     */
    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, optional = false)
    private Stock stock;

    /**
     * Tareas que utilizan este producto
     * Relación N:M a través de TaskProduct
     */
    @OneToMany(mappedBy = "product", cascade = CascadeType.REFRESH)
    @Builder.Default
    private Set<TaskProduct> taskProducts = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
