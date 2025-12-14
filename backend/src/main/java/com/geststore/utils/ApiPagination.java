package com.geststore.utils;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Información de paginación para respuestas de API
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiPagination {
    private long totalElements;
    private int pageNumber;
    private int pageSize;
    private int totalPages;
}
