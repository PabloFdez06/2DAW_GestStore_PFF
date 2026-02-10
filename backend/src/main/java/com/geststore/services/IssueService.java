package com.geststore.services;

import com.geststore.exceptions.ResourceNotFoundException;
import com.geststore.models.dtos.IssueRequestDto;
import com.geststore.models.dtos.IssueResponseDto;
import com.geststore.models.entities.Issue;
import com.geststore.models.entities.IssueSeverity;
import com.geststore.repositories.IssueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de lógica de negocio para incidencias
 * 
 * Aquí centralizo toda la lógica relacionada con las incidencias.
 * He mantenido la misma estructura que TaskService para ser consistente
 * con el resto del proyecto: métodos para crear, listar y buscar incidencias.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class IssueService {

    private final IssueRepository issueRepository;

    /**
     * Crea una nueva incidencia en el sistema
     * Establezco la fecha de creación automáticamente y asigno el usuario desde el contexto
     */
    public IssueResponseDto createIssue(IssueRequestDto requestDto, String username) {
        log.info("Creando nueva incidencia con título: {}", requestDto.getTitle());
        
        Issue issue = Issue.builder()
                .title(requestDto.getTitle())
                .description(requestDto.getDescription())
                .severity(requestDto.getSeverity() != null ? requestDto.getSeverity() : IssueSeverity.MEDIUM)
                .createdAt(LocalDateTime.now())
                .reportedBy(username)
                .build();

        Issue savedIssue = issueRepository.save(issue);
        log.info("Incidencia creada con ID: {}", savedIssue.getId());
        
        return convertToDto(savedIssue);
    }

    /**
     * Obtiene todas las incidencias del sistema
     * Este método solo debería ser accesible para administradores y managers
     */
    public List<IssueResponseDto> getAllIssues() {
        log.info("Obteniendo todas las incidencias");
        List<Issue> issues = issueRepository.findAll();
        return issues.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene una incidencia por su ID
     */
    public IssueResponseDto getIssueById(String id) {
        log.info("Buscando incidencia con ID: {}", id);
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidencia", id));
        return convertToDto(issue);
    }

    /**
     * Busca incidencias por nivel de severidad/importancia
     * Útil para priorizar qué incidencias atender primero
     */
    public List<IssueResponseDto> getIssuesBySeverity(IssueSeverity severity) {
        log.info("Buscando incidencias con severidad: {}", severity);
        List<Issue> issues = issueRepository.findBySeverity(severity);
        return issues.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca las incidencias reportadas por un usuario específico
     */
    public List<IssueResponseDto> getIssuesByReportedBy(String username) {
        log.info("Buscando incidencias reportadas por: {}", username);
        List<Issue> issues = issueRepository.findByReportedBy(username);
        return issues.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Convierte una entidad Issue a su DTO de respuesta
     */
    private IssueResponseDto convertToDto(Issue issue) {
        return IssueResponseDto.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .severity(issue.getSeverity())
                .createdAt(issue.getCreatedAt())
                .reportedBy(issue.getReportedBy())
                .build();
    }
}