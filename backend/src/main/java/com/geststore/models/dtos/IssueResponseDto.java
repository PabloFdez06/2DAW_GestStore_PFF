package com.geststore.models.dtos;

import com.geststore.models.entities.IssueSeverity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO para devolver información de una incidencia
 * 
 * Incluye todos los campos para que el frontend pueda mostrar
 * la información completa: quién reportó, cuándo, y todos los detalles.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueResponseDto {
    private String id;
    private String title;
    private String description;
    private IssueSeverity severity;
    private LocalDateTime createdAt;
    private String reportedBy;
}
