package com.geststore.models.entities;

/**
 * Enum que representa los niveles de severidad de una incidencia.
 * He definido tres niveles para clasificar la urgencia de cada reporte:
 * - LOW: Problemas menores que no afectan la operación
 * - MEDIUM: Situaciones que requieren atención pero no son críticas
 * - HIGH: Incidencias graves que necesitan solución inmediata
 */
public enum IssueSeverity {
    LOW,
    MEDIUM,
    HIGH
}
