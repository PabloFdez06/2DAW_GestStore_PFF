package com.geststore.repositories;

import com.geststore.models.entities.Issue;
import com.geststore.models.entities.IssueSeverity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio para la entidad Issue
 * 
 * Proporciona los métodos CRUD básicos heredados de MongoRepository y he añadido
 * algunas consultas personalizadas útiles. Por ejemplo, buscar por nivel de severidad
 * para filtrar solo las incidencias críticas.
 * 
 * Spring Data MongoDB generará automáticamente las implementaciones en base
 * a los nombres de los métodos.
 */
@Repository
public interface IssueRepository extends MongoRepository<Issue, String> {

    /**
     * Busca todas las incidencias con un nivel de severidad específico
     * Útil para filtrar solo las urgentes o las de baja prioridad
     */
    List<Issue> findBySeverity(IssueSeverity severity);

    /**
     * Busca incidencias por el usuario que las reportó
     * Permite ver el historial de reportes de cada trabajador
     */
    List<Issue> findByReportedBy(String reportedBy);

    /**
     * Busca incidencias que contengan un texto en el título
     * Útil para búsquedas rápidas tipo "estante" o "producto"
     */
    List<Issue> findByTitleContainingIgnoreCase(String title);
}
