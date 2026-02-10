package com.geststore.controllers;

import com.geststore.models.dtos.IssueRequestDto;
import com.geststore.models.dtos.IssueResponseDto;
import com.geststore.services.IssueService;
import com.geststore.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

/**
 * Controlador REST para operaciones con incidencias de inventario
 * 
 * He diseñado dos endpoints principales:
 * - POST /api/issues: Cualquier usuario autenticado puede reportar una incidencia
 * - GET /api/issues: Solo ADMIN y MANAGER pueden ver todas las incidencias
 * 
 * Esto permite que los trabajadores reporten problemas pero solo los managers
 * tengan acceso a toda la información para poder priorizarlas y gestionarlas.
 */
@Slf4j
@RestController
@RequestMapping("/issues")
@RequiredArgsConstructor
@Validated
public class IssueController {

    private final IssueService issueService;

    /**
     * Crear una nueva incidencia
     * Cualquier usuario autenticado puede reportar una incidencia.
     * Extraigo el username del token JWT para registrar quién reportó.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<IssueResponseDto>> createIssue(
            @Valid @RequestBody IssueRequestDto requestDto,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        
        if (userId == null || userId.isEmpty()) {
            log.error("No se proporcionó el ID del usuario");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<IssueResponseDto>builder()
                            .success(false)
                            .message("Se requiere el ID del usuario para crear una incidencia")
                            .timestamp(java.time.LocalDateTime.now())
                            .build());
        }
        
        log.info("POST /api/issues - Usuario {} creando nueva incidencia", userId);
        
        IssueResponseDto issue = issueService.createIssue(requestDto, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Incidencia creada exitosamente", issue));
    }

    /**
     * Obtener todas las incidencias
     * Solo accesible para ADMIN y MANAGER para revisar y priorizar incidencias
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<IssueResponseDto>>> getAllIssues() {
        log.info("GET /api/issues - Obteniendo todas las incidencias");
        
        List<IssueResponseDto> issues = issueService.getAllIssues();
        return ResponseEntity.ok(
                ApiResponse.success("Incidencias obtenidas exitosamente", issues));
    }

    /**
     * Obtener una incidencia por ID
     * Accesible para todos los roles autenticados
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<IssueResponseDto>> getIssueById(@PathVariable String id) {
        log.info("GET /api/issues/{} - Obteniendo incidencia", id);
        
        IssueResponseDto issue = issueService.getIssueById(id);
        return ResponseEntity.ok(
                ApiResponse.success("Incidencia obtenida exitosamente", issue));
    }

    /**
     * Obtener las incidencias reportadas por el usuario actual
     * Permite a cada trabajador ver su historial de reportes
     */
    @GetMapping("/my-issues")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<List<IssueResponseDto>>> getMyIssues(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        
        if (userId == null || userId.isEmpty()) {
            log.error("No se proporcionó el ID del usuario");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<List<IssueResponseDto>>builder()
                            .success(false)
                            .message("Se requiere el ID del usuario")
                            .timestamp(java.time.LocalDateTime.now())
                            .build());
        }
        
        log.info("GET /api/issues/my-issues - Obteniendo incidencias de {}", userId);
        
        List<IssueResponseDto> issues = issueService.getIssuesByUser(userId);
        return ResponseEntity.ok(
                ApiResponse.success("Tus incidencias obtenidas exitosamente", issues));
    }
}