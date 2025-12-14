package com.geststore.models.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Enum que define los roles disponibles en el sistema.
 * Los roles determinar el nivel de permisos y acceso.
 */
@Getter
@AllArgsConstructor
public enum Role {
    ADMIN("Administrador", "Acceso completo al sistema"),
    MANAGER("Gestor", "Puede crear y asignar tareas"),
    WORKER("Trabajador", "Puede ver y ejecutar tareas asignadas");

    private final String displayName;
    private final String description;
}
