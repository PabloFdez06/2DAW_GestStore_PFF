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
import org.springframework.security.core.Authentication;
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
            Authentication authentication) {
        
        String username = authentication.getName();
        log.info("POST /api/issues - Usuario {} creando nueva incidencia", username);
        
        IssueResponseDto issue = issueService.createIssue(requestDto, username);
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
    public ResponseEntity<ApiResponse<List<IssueResponseDto>>> getMyIssues(Authentication authentication) {
        String username = authentication.getName();
        log.info("GET /api/issues/my-issues - Obteniendo incidencias de {}", username);
        
        List<IssueResponseDto> issues = issueService.getIssuesByReportedBy(username);
        return ResponseEntity.ok(
                ApiResponse.success("Tus incidencias obtenidas exitosamente", issues));
    }
}