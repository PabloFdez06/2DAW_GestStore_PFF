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

### Página de Incidencias (COMPLETA)
- **Ubicación**: `GestStore/src/app/pages/issues/`
- **Ruta**: `/incidencias` (protegida con authGuard)
- **Funcionalidades**:
  - Vista completa con layout y sidebar
  - Listado de incidencias en grid con issue-cards
  - Estadísticas por severidad (solo ADMIN/MANAGER)
  - Buscador de incidencias por título/descripción
  - Filtros por severidad (todas, alta, media, baja)
  - Modal para reportar nuevas incidencias
  - Formulario reactivo con validación
  - Estados: loading, empty, error
- **Enlace en menú**: Añadido automáticamente al sidebar con icono `alert-circle`

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

## Acceso a la aplicación

Una vez que ejecutes el proyecto, la página de incidencias está accesible en:

1. **Navega a**: `http://localhost:4200/incidencias` (o tu URL de desarrollo)
2. **O usa el menú lateral**: Haz clic en "Incidencias" en el sidebar (icono de alerta)

La página detecta automáticamente tu rol:
- **ADMIN/MANAGER**: Ve todas las incidencias del sistema con estadísticas
- **WORKER**: Ve solo sus propias incidencias reportadas

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
✓ **Backend**: Lombok, MongoDB, Spring Security con @PreAuthorize  
✓ **Frontend**: Signals de Angular, Standalone Components, RxJS  
✓ **Estilos**: ITCSS, Atomic Design, Mixins SCSS, Variables CSS  
✓ **Página completa**: Grid responsive, filtros, búsqueda, modal  
✓ **Routing**: Integrado en app.routes.ts con lazy loading  
✓ **Navegación**: Enlace añadido al sidebar principal  
✓ **Testing**: Archivos spec incluidos para componente y página  
✓ **Documentación**: JSDoc en código, comentarios explicativos

## Archivos creados

### Backend (7 archivos)
- `Issue.java` - Entidad
- `IssueSeverity.java` - Enum
- `IssueRepository.java` - Repositorio MongoDB
- `IssueService.java` - Lógica de negocio
- `IssueController.java` - API REST
- `IssueRequestDto.java` - DTO entrada
- `IssueResponseDto.java` - DTO salida

### Frontend (9 archivos)
- `issue.model.ts` - Interfaces y enums
- `issue.service.ts` - Servicio con signals
- `issue-card.component.ts` - Componente card
- `issue-card.component.html` - Template card
- `issue-card.component.scss` - Estilos card
- `issue-card.component.spec.ts` - Tests card
- `issues.component.ts` - Página completa
- `issues.component.html` - Template página
- `issues.component.scss` - Estilos página
- `issues.component.spec.ts` - Tests página

### Configuración (2 archivos modificados)
- `app.routes.ts` - Ruta añadida
- `sidebar-layout.component.ts` - Enlace en menú

---

  next: (issues) => console.log('Incidencias:', issues)
});
```

## Características técnicas aplicadas

**Backend**: Lombok, MongoDB, Spring Security con @PreAuthorize
**Frontend**: Signals de Angular, Standalone Components, RxJS
**Estilos**: ITCSS, Atomic Design, Mixins SCSS, Variables CSS
**Testing**: Archivo spec incluido
**Documentación**: JSDoc en código, comentarios explicativos

