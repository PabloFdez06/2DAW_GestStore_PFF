package com.geststore.models.dtos;

import com.geststore.models.entities.IssueSeverity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear una nueva incidencia
 * 
 * He mantenido esto simple: solo recibimos el título, descripción y severidad
 * del cliente. La fecha de creación y el usuario que reporta se establecerán
 * automáticamente en el backend desde la autenticación.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueRequestDto {
    private String title;
    private String description;
    private IssueSeverity severity;
}
