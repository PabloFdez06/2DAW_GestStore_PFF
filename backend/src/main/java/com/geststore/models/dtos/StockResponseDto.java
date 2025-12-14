package com.geststore.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO para responder información de stock
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockResponseDto {
    private Long id;
    private Integer quantityAvailable;
    private Integer quantityReserved;
    private Integer minimumLevel;
    private String location;
    private Integer totalQuantity;
    private Boolean lowStock;
    private LocalDateTime lastUpdated;
}
