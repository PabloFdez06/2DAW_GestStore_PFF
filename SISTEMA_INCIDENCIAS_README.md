# Sistema de Incidencias de Inventario

## Descripción

He implementado un sistema completo para que los trabajadores puedan reportar incidencias en el inventario, como estantes dañados o productos defectuosos. El sistema sigue la misma arquitectura del resto del proyecto GestStore.

## Backend (Spring Boot + MongoDB)

### Entidad Issue
- **Ubicación**: `backend/src/main/java/com/geststore/models/entities/Issue.java`
- **Campos**: id, title, description, severity, createdAt, reportedBy
- **Severidades**: LOW, MEDIUM, HIGH

### Repositorio
- **Ubicación**: `backend/src/main/java/com/geststore/repositories/IssueRepository.java`
- Extiende `MongoRepository<Issue, String>`
- Query methods para buscar por severidad, usuario reportante, y título

### Servicio
- **Ubicación**: `backend/src/main/java/com/geststore/services/IssueService.java`
- Lógica de negocio centralizada
- Métodos: createIssue, getAllIssues, getIssueById, getIssuesBySeverity

### Controlador
- **Ubicación**: `backend/src/main/java/com/geststore/controllers/IssueController.java`
- **Endpoints**:
  - `POST /api/issues` - Crear incidencia (todos los roles autenticados)
  - `GET /api/issues` - Listar todas (ADMIN, MANAGER)
  - `GET /api/issues/{id}` - Ver una específica (todos los roles)
  - `GET /api/issues/my-issues` - Ver mis reportes (todos los roles)

## Frontend (Angular + Signals)

### Modelo
- **Ubicación**: `GestStore/src/app/models/issue.model.ts`
- Define interfaces: Issue, IssueRequest, IssueApiResponse
- Enum IssueSeverity para los niveles de urgencia

### Servicio
- **Ubicación**: `GestStore/src/app/services/issue.service.ts`
- Usa **Signals** para el estado reactivo
- Signals disponibles:
  - `issues()` - Lista de incidencias
  - `isLoading()` - Estado de carga
  - `highSeverityCount()` - Contador de urgentes
- Métodos: createIssue(), getIssues(), getIssueById(), getMyIssues()

### Componente IssueCard
- **Ubicación**: `GestStore/src/app/components/molecules/issue-card/`
- Componente standalone (Atomic Design - Molécula)
- **Props**:
  - `issue`: Objeto Issue (requerido)
  - `clickable`: Boolean para interactividad
- **HTML**: Semántico con etiquetas `<article>`, `<header>`, `<footer>`, `<time>`
- **SCSS**: Usa el sistema completo de estilos:
  - Mixins: `@include text-style()`, `@include themed-shadow()`, `@include transition()`
  - Variables: `$spacing-*`, `$color-*`, etc.
  - Colores según severidad:
    - HIGH → Rojo (var(--color-error))
    - MEDIUM → Azul ($color-accent-5)
    - LOW → Verde (var(--color-success))

## Uso del componente

```typescript
import { IssueCardComponent } from './components/molecules/issue-card/issue-card.component';

// En la plantilla
<app-issue-card 
  [issue]="issue" 
  [clickable]="true"
  (click)="handleClick(issue)">
</app-issue-card>
```

## Ejemplo de creación de incidencia

```typescript
// En componente
constructor(private issueService: IssueService) {}

crearIncidencia() {
  const nueva: IssueRequest = {
    title: 'Estante B3 dañado',
    description: 'Presenta grietas en el soporte',
    severity: IssueSeverity.HIGH
  };

  this.issueService.createIssue(nueva).subscribe({
    next: (issue) => console.log('Incidencia creada:', issue),
    error: (err) => console.error('Error:', err)
  });
}

// Para listar todas (solo ADMIN/MANAGER)
this.issueService.getIssues().subscribe({
  next: (issues) => console.log('Incidencias:', issues)
});
```

## Características técnicas aplicadas

**Backend**: Lombok, MongoDB, Spring Security con @PreAuthorize
**Frontend**: Signals de Angular, Standalone Components, RxJS
**Estilos**: ITCSS, Atomic Design, Mixins SCSS, Variables CSS
**Testing**: Archivo spec incluido
**Documentación**: JSDoc en código, comentarios explicativos

