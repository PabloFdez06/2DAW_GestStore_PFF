package com.geststore.services;

import com.geststore.exceptions.ResourceNotFoundException;
import com.geststore.models.dtos.IssueRequestDto;
import com.geststore.models.dtos.IssueResponseDto;
import com.geststore.models.entities.Issue;
import com.geststore.models.entities.IssueSeverity;
import com.geststore.models.entities.User;
import com.geststore.repositories.IssueRepository;
import com.geststore.repositories.UserRepository;
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
    private final UserRepository userRepository;

    /**
     * Crea una nueva incidencia en el sistema
     * Busca el usuario por su ID para obtener su nombre y establecerlo como reportedBy
     */
    public IssueResponseDto createIssue(IssueRequestDto requestDto, String userId) {
        log.info("Creando nueva incidencia con título: {}", requestDto.getTitle());
        
        // Busco el usuario por ID para obtener su nombre
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", userId));
        String reportedByName = user.getName() + " " + user.getLastName();
        
        Issue issue = Issue.builder()
                .title(requestDto.getTitle())
                .description(requestDto.getDescription())
                .severity(requestDto.getSeverity() != null ? requestDto.getSeverity() : IssueSeverity.MEDIUM)
                .createdAt(LocalDateTime.now())
                .reportedBy(reportedByName)
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
     * Busca las incidencias reportadas por un usuario específico (por nombre)
     */
    public List<IssueResponseDto> getIssuesByReportedBy(String reportedBy) {
        log.info("Buscando incidencias reportadas por: {}", reportedBy);
        List<Issue> issues = issueRepository.findByReportedBy(reportedBy);
        return issues.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca las incidencias de un usuario por su ID
     * Primero busca el usuario para obtener su nombre y luego filtra por ese nombre
     */
    public List<IssueResponseDto> getIssuesByUser(String userId) {
        log.info("Buscando incidencias del usuario con ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", userId));
        String reportedByName = user.getName() + " " + user.getLastName();
        return getIssuesByReportedBy(reportedByName);
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