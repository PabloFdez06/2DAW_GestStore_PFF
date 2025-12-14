package com.geststore.controllers;

import com.geststore.models.dtos.FileUploadResponseDto;
import com.geststore.services.FileStorageService;
import com.geststore.utils.ApiResponse;
import com.geststore.exceptions.ValidationException;
import com.geststore.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

/**
 * Controlador de archivos
 * Endpoints: /api/files
 * Maneja carga, descarga y eliminación de archivos
 */
@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class FileController {

    private final FileStorageService fileStorageService;

    /**
     * POST /api/files/upload/image - Cargar imagen
     * Solo usuarios autenticados pueden subir imágenes
     * Acceso: Autenticado
     */
    @PostMapping("/upload/image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FileUploadResponseDto>> uploadImage(
            @RequestParam("file") MultipartFile file) {
        log.info("POST /api/files/upload/image - Cargando imagen: {}", file.getOriginalFilename());

        try {
            String filepath = fileStorageService.storeFile(file, "images");

            FileUploadResponseDto response = FileUploadResponseDto.builder()
                    .filename(file.getOriginalFilename())
                    .filepath(filepath)
                    .size(file.getSize())
                    .contentType(file.getContentType())
                    .uploadedAt(LocalDateTime.now())
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Imagen cargada correctamente", response));

        } catch (ValidationException e) {
            log.warn("Validación fallida al cargar imagen: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Validación fallida: " + e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    /**
     * POST /api/files/upload/document - Cargar documento
     * Solo usuarios autenticados pueden subir documentos
     * Acceso: Autenticado
     */
    @PostMapping("/upload/document")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FileUploadResponseDto>> uploadDocument(
            @RequestParam("file") MultipartFile file) {
        log.info("POST /api/files/upload/document - Cargando documento: {}", file.getOriginalFilename());

        try {
            String filepath = fileStorageService.storeFile(file, "documents");

            FileUploadResponseDto response = FileUploadResponseDto.builder()
                    .filename(file.getOriginalFilename())
                    .filepath(filepath)
                    .size(file.getSize())
                    .contentType(file.getContentType())
                    .uploadedAt(LocalDateTime.now())
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Documento cargado correctamente", response));

        } catch (ValidationException e) {
            log.warn("Validación fallida al cargar documento: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Validación fallida: " + e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    /**
     * GET /api/files/download/image/{filename} - Descargar imagen
     * Acceso: Público
     */
    @GetMapping("/download/image/{filename}")
    public ResponseEntity<?> downloadImage(@PathVariable String filename) {
        log.info("GET /api/files/download/image/{} - Descargando imagen", filename);

        try {
            byte[] fileBytes = fileStorageService.getFileBytes("images/" + filename);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(fileBytes);

        } catch (ResourceNotFoundException e) {
            log.warn("Imagen no encontrada: {}", filename);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/files/download/document/{filename} - Descargar documento
     * Acceso: Público
     */
    @GetMapping("/download/document/{filename}")
    public ResponseEntity<?> downloadDocument(@PathVariable String filename) {
        log.info("GET /api/files/download/document/{} - Descargando documento", filename);

        try {
            byte[] fileBytes = fileStorageService.getFileBytes("documents/" + filename);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(fileBytes);

        } catch (ResourceNotFoundException e) {
            log.warn("Documento no encontrado: {}", filename);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE /api/files/{filepath} - Eliminar archivo
     * Solo administradores pueden eliminar archivos
     * Acceso: ADMIN
     */
    @DeleteMapping("/{filepath}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable String filepath) {
        log.info("DELETE /api/files/{} - Eliminando archivo", filepath);

        try {
            fileStorageService.deleteFile(filepath);
            return ResponseEntity.ok(ApiResponse.success("Archivo eliminado correctamente", null));

        } catch (Exception e) {
            log.error("Error al eliminar archivo {}: {}", filepath, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al eliminar: " + e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }
}
