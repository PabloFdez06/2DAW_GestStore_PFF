package com.geststore.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para respuesta de carga de archivo
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileUploadResponseDto {

    private String filename;
    private String filepath;
    private long size;
    private String contentType;
    private LocalDateTime uploadedAt;
}
