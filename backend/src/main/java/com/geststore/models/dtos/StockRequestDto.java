package com.geststore.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO para crear/actualizar stock
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockRequestDto {
    private Integer quantityAvailable;
    private Integer quantityReserved;
    private Integer minimumLevel;
    private String location;
}
