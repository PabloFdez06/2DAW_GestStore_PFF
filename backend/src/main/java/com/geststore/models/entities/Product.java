package com.geststore.models.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad Product - Representa los productos disponibles en el almacén
 * Contiene información de cada producto y su disponibilidad.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String sku;

    private String description;

    private BigDecimal unitPrice;

    private String category;

    private Boolean active = true;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Stock embebido en el producto (simplificación)
    private Integer stockQuantity = 0;

    private Integer minStockLevel = 0;

    private String locationInWarehouse;

    // Métodos de ciclo de vida
    public void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
