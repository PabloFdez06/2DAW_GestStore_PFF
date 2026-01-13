package com.geststore.models.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;

/**
 * Entidad TaskProduct - Relación N:M entre Task y Product
 * Permite asignar múltiples productos a una tarea con cantidades específicas.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "task_products")
public class TaskProduct {

    @Id
    private String id;

    private Integer quantity = 1;

    private Integer quantityUsed = 0;

    private String notes;

    private LocalDateTime createdAt;

    @DBRef
    private Task task;

    @DBRef
    private Product product;

    public void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
