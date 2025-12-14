package com.geststore.models.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Enum que define los niveles de prioridad de las tareas.
 * Permite ordenar tareas por urgencia y importancia.
 */
@Getter
@AllArgsConstructor
public enum TaskPriority {
    LOW("Baja", 1, "Tarea de baja prioridad"),
    MEDIUM("Media", 2, "Tarea de prioridad normal"),
    HIGH("Alta", 3, "Tarea urgente");

    private final String displayName;
    private final int level;
    private final String description;
}
