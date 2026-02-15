package com.geststore.models.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * Entidad Issue - Representa las incidencias reportadas en el inventario
 * 
 * Esta entidad la he creado para que los trabajadores puedan reportar problemas
 * con el inventario, como estantes dañados o productos defectuosos. Cada incidencia
 * tiene un título, descripción, nivel de severidad y fecha de creación.
 * 
 * Sigo el mismo patrón que Task.java usando Lombok para reducir código boilerplate
 * y las anotaciones de MongoDB para la persistencia.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "issues")
public class Issue {

    @Id
    private String id;

    /**
     * Título breve de la incidencia (ej: "Estante B3 agrietado")
     */
    private String title;

    /**
     * Descripción detallada del problema encontrado
     */
    private String description;

    /**
     * Nivel de severidad que determina la urgencia de resolución
     */
    private IssueSeverity severity = IssueSeverity.MEDIUM;

    /**
     * Fecha y hora en que se creó el reporte
     * Se establece automáticamente en el momento de creación
     */
    private LocalDateTime createdAt;

    /**
     * Usuario que reportó la incidencia
     * Por ahora no lo enlazo con la entidad User pero podría hacerse con @DBRef
     */
    private String reportedBy;
}