# Evaluacion segun Rubrica Cliente

Fecha: 2026-01-14

## Bloque 1 (DOM, eventos, UI)

| Criterio | Nota | Evidencia breve |
| --- | --- | --- |
| 1.1 ViewChild/ElementRef | 0 | No aparece uso de @ViewChild/ElementRef en el codigo. |
| 1.2 Modificacion dinamica/Renderer2 | 3 | Solo bindings de clase/atributos; sin Renderer2 ni manipulacion directa (p.ej. prioridades y estados en src/app/pages/dashboard/dashboard.component.html). |
| 1.3 Crear/eliminar nodos | 0 | No hay creacion/eliminacion programatica de elementos. |
| 2.1 Event binding (variedad) | 4 | Se usan (click), (ngSubmit), (change), (input); sin mas tipos en formularios y vistas. |
| 2.2 Teclado/mouse/focus | 3 | Solo eventos de click y formularios; no hay keydown/keyup/focus/blur. |
| 2.3 preventDefault/stopPropagation | 7 | Uso correcto en logout y menus (dashboard.component.ts, task-card.component.ts, overlays). |
| 2.4 @HostListener global | 5 | Un @HostListener para cerrar menus con click global en dashboard.component.ts. |
| 3.1 Menu hamburguesa mobile | 5 | Toggle basico sin cierre por click fuera ni ESC, sin animacion ni aria avanzada. |
| 3.2 Modal | 5 | Modal de tareas abre/cierra por boton y overlay; sin ESC, sin bloqueo de scroll, sin focus trap. |
| 3.3 Accordion | 0 | No implementado. |
| 3.4 Tabs | 0 | No implementado. |
| 3.5 Tooltip | 0 | No implementado. |
| 4.1 Theme switcher | 0 | No hay cambio de tema claro/oscuro. |
| 5.1 Arquitectura de eventos en README | 0 | README sin seccion de eventos. |
| 5.2 Diagrama de flujo de eventos | 0 | No existe diagrama. |
| 5.3 Tabla compatibilidad navegadores | 0 | No existe. |
| 6.1 Separacion contenido/estilo/comportamiento | 7 | Buen uso de componentes + SCSS; casi sin estilos inline ni atributos onclick; logica en TS. |

## Bloque 2 (Rutas, servicios HTTP)

| Criterio | Nota | Evidencia breve |
| --- | --- | --- |
| 4.1 Configuracion de rutas | 4 | Solo 3 rutas (dashboard/login/register), sin parametros ni 404. |
| 4.2 Navegacion programatica | 5 | Navegacion basica con Router.navigate en login/register/header. Sin params/query/fragment. |
| 4.3 Lazy loading | 0 | No hay modulos/rutas cargadas perezosamente. |
| 4.4 Route guards | 5 | Un CanActivate funcional para dashboard. |
| 4.5 Resolvers | 0 | No hay resolvers. |
| 4.6 Breadcrumbs dinamicos | 0 | No existen breadcrumbs. |
| 4.7 Documentacion de rutas | 0 | README sin mapa de rutas. |
| 5.1 Configuracion HttpClient | 8 | provideHttpClient con interceptor global; TaskService centraliza peticiones. |
| 5.2 CRUD completo | 8 | TaskService expone GET/POST/PUT/PATCH/DELETE y se usan crear, completar, borrar en dashboard. Falta edicion en UI. |
| 5.3 Manejo de respuestas | 6 | Tipos e interfaces, manejo de error en suscripciones; sin catchError/reintentos sistematicos. |
| 5.4 Formatos | 6 | JSON y query params en busqueda; no hay FormData ni cabeceras avanzadas. |
| 5.5 Estados loading/error/empty | 8 | Estados diferenciados en dashboard (loading, error, empty). |
| 5.6 Interceptores HTTP | 5 | Solo interceptor de auth/headers; faltan error/logging. |
| 5.7 Documentacion de API | 1 | README menciona API pero no lista endpoints ni modelos. |

## Nota final

Nota media aritmetica: **3.1 / 10**.

## Recomendaciones rapidas

- Añadir @ViewChild/ElementRef y Renderer2 en componentes que manipulan DOM (menu hamburguesa, modales, tooltips).
- Implementar modales accesibles: cierre con ESC (@HostListener), click fuera, bloqueo de scroll, focus trap.
- Agregar componentes faltantes (accordion, tabs, tooltip) y theme switcher con persistencia/localStorage y matchMedia.
- Ampliar eventos: teclado (keydown.enter/escape), foco (focus/blur), mouse (mouseenter/leave) y documentarlo.
- Sistema de rutas completo: 404, rutas con parametros, lazy loading, breadcrumbs dinamicos, resolvers, documentacion en README.
- Interceptores adicionales para errores y logging; catchError y retry donde aplique; documentar endpoints.
