package com.geststore.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear/actualizar la relación entre tarea y producto
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskProductRequestDto {
    private Integer quantity;
    private Integer quantityUsed;
    private String notes;
    private String productId;
}
