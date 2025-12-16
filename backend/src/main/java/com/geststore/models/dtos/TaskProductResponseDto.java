package com.geststore.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO para responder información de la relación entre tarea y producto
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskProductResponseDto {
    private Long id;
    private Integer quantity;
    private Integer quantityUsed;
    private String notes;
    private LocalDateTime createdAt;
    private ProductResponseDto product;
}
