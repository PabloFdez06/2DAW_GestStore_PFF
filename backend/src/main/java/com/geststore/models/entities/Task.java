package com.geststore.models.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entidad Task - Representa las tareas del sistema
 * Cada tarea puede ser asignada a trabajadores y requerir productos del almacén.
 *
 * Relaciones:
 * - N:1 con User (trabajador asignado)
 * - N:1 con User (usuario que la creó)
 * - N:M con Product (a través de TaskProduct)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "tasks")
public class Task {

    @Id
    private String id;

    private String title;

    private String description;

    private TaskStatus status = TaskStatus.PENDING;

    private TaskPriority priority = TaskPriority.MEDIUM;

    private LocalDateTime dueDate;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String notes;

    private Boolean completed = false;

    private Boolean important = false;

    /**
     * Imagen de la tarea (Data URL base64)
     */
    private String imageUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /**
     * Usuario asignado para ejecutar la tarea
     */
    @DBRef
    private User assignedUser;

    /**
     * Usuario que creó la tarea
     */
    @DBRef
    private User createdByUser;

    /**
     * Productos requeridos para esta tarea
     */
    @DBRef
    @Builder.Default
    private Set<TaskProduct> taskProducts = new HashSet<>();

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
