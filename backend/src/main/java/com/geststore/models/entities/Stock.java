package com.geststore.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entidad Stock - Representa el inventario de cada producto
 * Mantiene el control de las cantidades disponibles y reservadas.
 *
 * Relaciones:
 * - 1:1 con Product (el producto del que se mantiene stock)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "stock", indexes = {
    @Index(name = "idx_product_id", columnList = "product_id")
})
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Cantidad total disponible en almacén
     */
    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer quantityAvailable = 0;

    /**
     * Cantidad reservada para tareas asignadas
     */
    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer quantityReserved = 0;

    /**
     * Nivel mínimo de stock recomendado
     */
    @Column(nullable = false, columnDefinition = "INT DEFAULT 10")
    private Integer minimumLevel = 10;

    /**
     * Ubicación en el almacén (ej: Pasillo A, Estantería 3)
     */
    @Column(length = 100)
    private String location;

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;

    /**
     * Producto asociado a este stock
     * Relación 1:1
     */
    @OneToOne(optional = false)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    /**
     * Cantidad total = disponible + reservado
     */
    @Transient
    public Integer getTotalQuantity() {
        return quantityAvailable + quantityReserved;
    }

    /**
     * Verifica si el stock está por debajo del nivel mínimo
     */
    @Transient
    public Boolean isLowStock() {
        return quantityAvailable < minimumLevel;
    }

    @PrePersist
    protected void onCreate() {
        this.lastUpdated = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }
}
