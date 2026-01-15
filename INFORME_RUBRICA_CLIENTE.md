# Informe de evaluación (Rúbrica Cliente)

Proyecto revisado: GestStore (cliente Angular)

Fecha de revisión: 2026-01-15

Metodología: revisión estática del código (no ejecución). Las notas se basan en evidencias encontradas en el repo y en el cumplimiento observable de cada criterio.

---

## Resumen ejecutivo

- El bloque de **DOM/Eventos (Bloque 1)** está muy bien trabajado: se observan `@ViewChild`/`ElementRef`, `Renderer2`, creación/eliminación de nodos, `@HostListener`, accesibilidad y teclado en varios componentes.
- El bloque de **Rutas/HTTP (Bloque 2)** es sólido en routing, guards y resolver; se han reforzado interceptores (incluyendo logging en desarrollo) y el manejo sistemático de errores en servicios (`catchError`, `retry`). La parte de **documentación de rutas y API** sigue siendo el principal punto a mejorar.

---

# BLOQUE 1 (CE6): DOM, eventos e interacción

## 1.1 Acceso a Elementos del DOM (ViewChild + ElementRef) — **10/10**

Evidencias:
- Se usa `@ViewChild` / `@ViewChildren` en múltiples componentes (muy por encima de 5):
  - GestStore/src/app/components/layout/header/header.component.ts
  - GestStore/src/app/components/molecules/add-task-modal/add-task-modal.component.ts
  - GestStore/src/app/components/molecules/tabs/tabs.component.ts
  - GestStore/src/app/components/molecules/accordion/accordion.component.ts
  - GestStore/src/app/pages/tasks/tasks.component.ts
  - GestStore/src/app/components/shared/form-input/form-input.component.ts
  - GestStore/src/app/components/shared/form-textarea/form-textarea.component.ts
  - GestStore/src/app/components/shared/form-select/form-select.component.ts
- Se usa `ngAfterViewInit()` donde corresponde (header/tabs/accordion/modal) para evitar acceso prematuro.

Feedback (mejoras):
- Mantener la verificación null/undefined (se hace correctamente en la mayoría).

## 1.2 Modificación dinámica de propiedades y estilos (Renderer2) — **9/10**

Evidencias:
- Uso consistente de `Renderer2` para clases/atributos/estilos:
  - Tooltip: `setStyle`, `addClass`, `removeClass`, `setAttribute`, `removeAttribute` en GestStore/src/app/directives/tooltip.directive.ts
  - Menú hamburguesa: `addClass/removeClass`, `setAttribute` en GestStore/src/app/components/layout/header/header.component.ts
  - Tabs: `setStyle` para el indicador dinámico en GestStore/src/app/components/molecules/tabs/tabs.component.ts
  - Accordion: `setStyle(maxHeight)` y `addClass/removeClass` en GestStore/src/app/components/molecules/accordion/accordion.component.ts
- No se ha encontrado uso de `nativeElement.style...`.

Motivo del 9 (no 10):
- Aún existen accesos puntuales a APIs globales del navegador (por ejemplo `document.activeElement` y `querySelector` para focusables), que no son “malos” en un proyecto frontend clásico, pero en una rúbrica estricta se suele premiar la minimización de accesos directos a `document/window`.

## 1.3 Creación y eliminación de elementos del DOM — **10/10**

Evidencias (Renderer2 + limpieza):
- Tooltip crea y elimina nodos (tooltip + flecha) y limpia timers en destroy: GestStore/src/app/directives/tooltip.directive.ts
- Header crea y elimina backdrop, y elimina listener en destroy: GestStore/src/app/components/layout/header/header.component.ts
- Tabs crea y elimina el indicador dinámico en destroy: GestStore/src/app/components/molecules/tabs/tabs.component.ts
- Modal crea y elimina “focus guards” + listeners: GestStore/src/app/components/molecules/add-task-modal/add-task-modal.component.ts

Feedback:
- Está muy alineado con mejores prácticas: crear con `Renderer2.createElement()` y eliminar con `removeChild()`.

---

## 2.1 Event Binding en componentes interactivos — **10/10**

Evidencias:
- Se usan muchos tipos de eventos en templates: `(click)`, `(keydown)`, `(keyup)`, `(focus)`, `(blur)`, `(input)`, `(change)`, `(submit)` y `(ngSubmit)`.
- Ejemplos representativos:
  - Tabs: `(keydown)` con navegación por teclado en GestStore/src/app/components/molecules/tabs/tabs.component.html
  - Formularios: `(ngSubmit)` en login/register y modal de tarea.
  - Inputs: focus/blur/keyup en componentes de formulario.

Feedback:
- Muy buen uso de `(keydown.enter)` en algunos botones para accesibilidad.

## 2.2 Manejo de eventos específicos (teclado/mouse/focus) — **10/10**

Evidencias:
- Teclado:
  - Tabs soporta `ArrowLeft/ArrowRight`, `Home`, `End` en GestStore/src/app/components/molecules/tabs/tabs.component.ts
  - Accordion soporta `ArrowUp/ArrowDown`, `Home`, `End` en GestStore/src/app/components/molecules/accordion/accordion.component.ts
  - Cierre con `Escape` en páginas y directiva tooltip.
- Focus:
  - Tooltip muestra/oculta en `focusin/focusout`.
  - Inputs/select/textarea manejan `focus/blur`.

## 2.3 Prevención y control de propagación — **9/10**

Evidencias:
- Prevención en formularios: `preventDefault()` (por ejemplo login/register y formularios de páginas).
- Control de propagación en overlays: `(click)="$event.stopPropagation()"` dentro del contenido de los modales (cierre por click fuera) en:
  - GestStore/src/app/pages/tasks/tasks.component.html
  - GestStore/src/app/pages/dashboard/dashboard.component.html
  - GestStore/src/app/pages/task-detail/task-detail.component.html

Motivo del 9:
- Está bien implementado y repetido en varios contextos; para un 10 “de libro”, sería ideal que el proyecto documente explícitamente 3+ contextos con ejemplos (más allá de la implementación).

## 2.4 Eventos globales con @HostListener — **10/10**

Evidencias:
- `document:click` y `document:keydown.escape` para cierre de overlays/menús:
  - GestStore/src/app/pages/tasks/tasks.component.ts
  - GestStore/src/app/components/layout/header/header.component.ts
  - GestStore/src/app/pages/dashboard/dashboard.component.ts
- `window:resize` (menú) y `window:scroll` / `window:resize` (tooltip):
  - GestStore/src/app/components/layout/header/header.component.ts
  - GestStore/src/app/directives/tooltip.directive.ts

---

## 3.1 Menú hamburguesa mobile — **10/10**

Evidencias:
- Toggle abrir/cerrar con botón + icono animado mediante clase `is-open`.
- Cierre con click fuera (`document:click`) y con ESC (`document:keydown.escape`).
- Accesibilidad:
  - `aria-expanded` y `aria-controls` en el botón.
  - Ajuste de `aria-label` según estado.
- Backdrop overlay creado dinámicamente con `Renderer2`.

Archivos:
- GestStore/src/app/components/layout/header/header.component.ts
- GestStore/src/app/components/layout/header/header.component.html
- GestStore/src/app/components/layout/header/header.component.scss

## 3.2 Modal (cuadro de diálogo) — **9/10**

Evidencias:
- Overlays con click fuera para cerrar y stopPropagation en contenido.
- Cierre con ESC implementado en páginas (HostListener).
- Bloqueo de scroll del body con clase CSS (Renderer2) en páginas como tareas.
- El componente AddTaskModal incorpora focus trap (guards + listener de Tab).

Motivo del 9:
- Aunque hay mucha accesibilidad, no se ve un “focus trap” universal para todos los modales ni una abstracción común (cada página gestiona su overlay). No es obligatorio, pero suele sumar para “modal perfecto”.

## 3.3 Componente adicional 1: Accordion — **9/10**

Evidencias:
- Expandir/colapsar por click.
- Navegación por teclado (arrows/home/end) en cabeceras.
- `aria-expanded`, `aria-controls`, `role="region"`.
- Animación con `maxHeight` calculado.

Archivo:
- GestStore/src/app/components/molecules/accordion/accordion.component.ts

Motivo del 9:
- Se podría añadir cierre con Enter/Space explícito (aunque el botón ya lo hace), y/o controlar mejor el “focus management” al abrir.

## 3.4 Componente adicional 2: Tabs — **9/10**

Evidencias:
- Roles ARIA (`tablist/tab/tabpanel`), `aria-selected`, `aria-controls`, `tabindex`.
- Navegación por teclado: arrows/home/end.
- Indicador visual creado dinámicamente.

Archivo:
- GestStore/src/app/components/molecules/tabs/tabs.component.ts

Motivo del 9:
- Persistencia del tab activo (localStorage o queryParam) sería un extra opcional.

## 3.5 Tooltip — **10/10**

Evidencias:
- Hover y focus, hide con mouseleave/focusout.
- Escape para cerrar.
- Delay configurable.
- Posicionamiento dinámico top/bottom/left/right + flecha.
- `aria-describedby` + `role="tooltip"`.

Archivo:
- GestStore/src/app/directives/tooltip.directive.ts

---

## 4.1 Theme Switcher completo — **10/10**

Evidencias:
- `matchMedia('(prefers-color-scheme: dark)')` y escucha de cambios.
- Persistencia en localStorage.
- Aplicación del tema con `data-theme` en `<html>`.
- Estado reactivo con signals.

Archivos:
- GestStore/src/app/services/theme.service.ts
- GestStore/src/app/app.ts

---

## 5.1 Sección de arquitectura de eventos en README — **10/10**

Evidencias:
- Sección extensa y estructurada sobre eventos, DOM y buenas prácticas.
- Incluye tabla de componentes/eventos.

Archivo:
- GestStore/README.md

## 5.2 Diagrama de flujo de eventos — **10/10**

Evidencias:
- Diagrama Mermaid con flujo Usuario → DOM → Template Binding → Handler → Servicios/Estado → Re-render.

Archivo:
- GestStore/README.md

## 5.3 Tabla de compatibilidad de navegadores — **9/10**

Evidencias:
- Tabla con navegadores y versiones orientativas, cubriendo eventos y `matchMedia`.

Motivo del 9:
- Podría incluir algún evento adicional “de proyecto” (por ejemplo `focusin/focusout` y `submit`) para llegar al máximo de completitud.

---

## 6.1 Independencia de contenido, aspecto y comportamiento — **9/10**

Puntos fuertes:
- Estilos en SCSS, estructura HTML limpia, lógica en TS.
- Event binding Angular en vez de `onclick`.

Motivo del 9:
- Se ha corregido el caso principal de lógica inline moviendo el `submit` a un método TS (`(ngSubmit)="onSubmit()"`), pero aún existen pequeñas asignaciones inline en templates (por ejemplo en `(change)` de checkbox) que, aunque comunes en Angular, en una rúbrica muy estricta pueden considerarse “comportamiento en plantilla”.

---

# BLOQUE 2 (CE7): Rutas y HTTP

## 4.1 Configuración de rutas — **10/10**

Evidencias:
- 5+ rutas principales, wildcard `**` a 404.
- Parámetros dinámicos (`/tareas/:id`, `/tareas/:id/editar`).
- Rutas hijas/segmentación del bloque de tareas vía `loadChildren`.

Archivos:
- GestStore/src/app/app.routes.ts
- GestStore/src/app/routes/tasks.routes.ts

## 4.2 Navegación programática — **9/10**

Evidencias:
- Navegación con parámetros de ruta, queryParams y fragment:
  - En edición: navegación a detalle con `queryParams` + `fragment` en GestStore/src/app/pages/task-edit/task-edit.component.ts

Motivo del 9:
- No se aprecia uso de `state` en navegación (extra para el 10).

## 4.3 Lazy loading — **9/10**

Evidencias:
- Lazy loading activo al menos para el bloque `/tareas`.

Mejora aplicada:
- Se ha configurado una estrategia de precarga para módulos lazy (`withPreloading(PreloadAllModules)`) en GestStore/src/app/app.config.ts.

Motivo del 9:
- No se ha documentado explícitamente la estrategia ni se aporta evidencia “de build” en el propio README (aunque el build genera chunks lazy), por eso no se asigna el máximo.

## 4.4 Route guards — **9/10**

Evidencias:
- `authGuard` para rutas privadas.
- `guestGuard` para login/register.
- `pendingChangesGuard` (CanDeactivate) para evitar perder cambios.
- Redirección a login con `returnUrl`.

Archivos:
- GestStore/src/app/guards/auth.guard.ts
- GestStore/src/app/guards/guest.guard.ts
- GestStore/src/app/guards/pending-changes.guard.ts

Motivo del 9:
- El confirm es funcional pero básico (no modal propio).

## 4.5 Resolvers — **8/10**

Evidencias:
- `taskResolver` precarga datos antes de activar detalle/edición.
- Manejo de error redirigiendo a not-found.

Archivos:
- GestStore/src/app/resolvers/task.resolver.ts
- GestStore/src/app/routes/tasks.routes.ts

Motivo del 8:
- No se observa un “loading state” específico ligado al resolver (p. ej. skeleton durante la resolución) ni una estrategia de reintento.

## 4.6 Breadcrumbs dinámicos — **9/10**

Evidencias:
- Breadcrumbs derivados de `route.data.breadcrumb`.
- En detalle/edición puede usar título resuelto de la tarea.

Archivo:
- GestStore/src/app/services/breadcrumbs.service.ts

## 4.7 Documentación de rutas — **3/10**

Evidencias:
- La documentación existente se centra sobre todo en eventos/DOM.

Motivo del 3:
- No se aprecia una sección dedicada con mapa de rutas (tabla), explicación de lazy loading/guards/resolvers en el README.

---

## 5.1 Configuración de HttpClient — **10/10**

Evidencias:
- `provideHttpClient(withInterceptors(...))` configurado.
- Interceptores activos: auth + error + logging (en desarrollo).

Archivo:
- GestStore/src/app/app.config.ts

## 5.2 Operaciones CRUD completas — **10/10**

Evidencias:
- Recurso “tareas” con GET listado/detalle, POST crear, PUT actualizar, DELETE eliminar.

Archivo:
- GestStore/src/app/services/task.service.ts

## 5.3 Manejo de respuestas (tipado, transformación, catchError) — **8/10**

Evidencias:
- Tipado presente (`ApiResponse<T>`, modelos Task/Auth) y transformaciones con `map()`.
- Manejo sistemático de errores en el servicio de tareas con `catchError`.
- Uso de `retry(1)` en llamadas GET idempotentes.

Motivo del 8:
- El `catchError` actual estandariza el flujo (captura y re-lanza), pero no normaliza mensajes/errores a un modelo propio de dominio; esa capa podría mejorar para llegar al máximo.

## 5.4 Diferentes formatos (JSON, query params, FormData) — **8/10**

Evidencias:
- JSON como formato principal.
- Uso de query params (`HttpParams`) para búsqueda.
- Uso de `FormData` (multipart/form-data) para subida de avatar:
  - Cliente: `UserService.uploadMyAvatar(file)`
  - UI: `ProfileComponent.onAvatarSelected()` sube el archivo y mantiene fallback a Data URL.
  - Backend: endpoint `PUT /api/users/me/avatar` que acepta `multipart/form-data` y persiste el avatar como Data URL base64.

Motivo del 8:
- Ya existe evidencia real de envío multipart con `FormData` (subida de archivo).
- Los query params se utilizan para búsqueda; como mejora opcional para llegar al máximo, se podría añadir paginación/filtrado avanzado también en tareas (además de la búsqueda) y documentar los parámetros soportados.

## 5.5 Estados de carga, error y empty — **8/10**

Evidencias:
- Loading/error/empty en páginas principales (ej: tareas y dashboard).
- Mensajes de éxito en pantallas de perfil/cambio de contraseña.

Motivo del 8:
- No hay un componente de feedback global (toast/snackbar) reutilizable; el feedback es más “por pantalla”.

## 5.6 Interceptores HTTP — **10/10**

Evidencias:
- Hay tres interceptores: auth, error y logging.
- La inyección de headers de autenticación se centraliza en el interceptor (sin duplicación en TaskService).

Motivo del 10:
- Cumple el patrón de 3 interceptores y centraliza la autenticación en el interceptor.

Archivos:
- GestStore/src/app/interceptors/auth.interceptor.ts
- GestStore/src/app/interceptors/error.interceptor.ts
- GestStore/src/app/interceptors/logging.interceptor.ts

## 5.7 Documentación de API — **4/10**

Motivo del 4:
- No se aprecia un catálogo explícito de endpoints consumidos (método/URL/parámetros), ni un apartado dedicado a modelos/contratos y estrategia de errores.

---

# Recomendaciones prioritarias para mejorar nota (sin re-arquitectura)

Aplicado en esta iteración (correcciones de código):
1. Añadido interceptor de logging (solo en desarrollo).
2. Activada precarga de módulos lazy (`PreloadAllModules`).
3. Estandarizado manejo de errores en TaskService (`catchError`) y `retry(1)` en GET.
4. Eliminada lógica inline del submit en edición de tarea.

Pendiente (principalmente documentación, a realizar por el alumno):
1. Documentar rutas en README: tabla de rutas, guards y resolver + lazy loading.
2. Documentar API en README: endpoints consumidos, modelos y estrategia de errores.
3. Añadir patrón de feedback global (toast/snackbar) para éxito/error.

