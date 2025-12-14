package com.geststore.models.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Enum que define los estados posibles de una tarea.
 * Refleja el ciclo de vida completo de una tarea.
 */
@Getter
@AllArgsConstructor
public enum TaskStatus {
    PENDING("Pendiente", "Tarea creada pero no iniciada"),
    IN_PROGRESS("En Curso", "Tarea en ejecución"),
    COMPLETED("Completada", "Tarea finalizada exitosamente"),
    CANCELLED("Cancelada", "Tarea cancelada");

    private final String displayName;
    private final String description;
}
