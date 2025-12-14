package com.geststore.utils;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO para respuestas exitosas de la API
 * @param <T> tipo de dato en el payload
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private ApiPagination pagination;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return success("Operación exitosa", data);
    }

    public static <T> ApiResponse<T> successWithPagination(String message, T data, long totalElements, int page, int size) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .pagination(ApiPagination.builder()
                        .totalElements(totalElements)
                        .pageNumber(page)
                        .pageSize(size)
                        .totalPages((int) Math.ceil((double) totalElements / size))
                        .build())
                .timestamp(LocalDateTime.now())
                .build();
    }
}
