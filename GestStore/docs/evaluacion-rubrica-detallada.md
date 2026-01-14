# Rubrica completa y evaluacion

Fecha: 2026-01-14

## Criterios del cliente (texto completo)

### Bloque 1

MANIPULACIÓN DEL DOM (CE6.c + CE6.d) 1.1 Acceso a Elementos del DOM - ViewChild y ElementRef	
No implementa ViewChild ni ElementRef. No accede al DOM desde componentes.
0 puntos
Código que intenta acceder al DOM pero sin usar ViewChild/ElementRef (usa document.querySelector directamente).
1 puntos
ViewChild/ElementRef presente en código pero no funcional o mal usado.
2 puntos
Intenta usar ViewChild/ElementRef pero con errores de implementación significativos (no funciona correctamente, referencias incorrectas).
3 puntos
Solo 1 componente con ViewChild/ElementRef implementado correctamente.
4 puntos
Implementa ViewChild/ElementRef en 2 componentes con errores menores o accesos inseguros (sin verificación de null/undefined).
5 puntos
Implementa ViewChild/ElementRef en 2 componentes. Funcionalidad básica operativa. Falta refinamiento técnico.
6 puntos
Implementa ViewChild/ElementRef en 3 componentes pero con alguna implementación mejorable (acceso antes de ngAfterViewInit, sin verificación de existencia del elemento).
7 puntos
Implementa ViewChild/ElementRef en 3 componentes. Funcionalidad correcta. Documentación básica. Todos los casos funcionan sin errores.
8 puntos
Implementa ViewChild/ElementRef en 4 componentes. Acceso correcto al DOM nativo. Usa ngAfterViewInit. Algún comentario faltante pero código funcional.
9 puntos
Implementa ViewChild y ElementRef en 5 o más componentes diferentes. Usa correctamente @ViewChild('nombre') con referencias de template. Accede a nativeElement cuando es necesario. Implementa ngAfterViewInit() correctamente. Código documentado con comentarios explicativos. Ejemplo: @ViewChild('menuToggle') menuToggle!: ElementRef;
10 puntos
1.2 Modificación Dinámica de Propiedades y Estilos	
No modifica propiedades ni estilos dinámicamente.
0 puntos
Intenta modificar propiedades/estilos pero el código falla o no produce el efecto esperado.
1 puntos
Modificaciones muy básicas y con errores. Código no funcional en varios casos.
2 puntos
Intenta modificar estilos pero con errores o de forma inconsistente. Algunas modificaciones no funcionan.
3 puntos
Solo manipulación directa del DOM. No usa Renderer2. Modifica estilos pero de forma insegura.
4 puntos
Usa Renderer2 solo 1 vez o principalmente manipulación directa (nativeElement.style.property = value). Funciona pero no sigue mejores prácticas.
5 puntos
Usa Renderer2 en 2 ocasiones. Varias manipulaciones directas del DOM. Funcionalidad básica operativa.
6 puntos
Usa Renderer2 en 2-3 ocasiones pero con algunas manipulaciones directas del DOM (nativeElement.style). Funciona pero no es completamente seguro.
7 puntos
Usa Renderer2 en 3 ocasiones. Modificaciones dinámicas funcionales. Código limpio y funcional.
8 puntos
Usa Renderer2 en 4 ocasiones correctamente. Modifica estilos y propiedades dinámicamente. Alguna manipulación directa menor pero mayormente seguro.
9 puntos
Usa Renderer2 para manipulación segura en 5+ ocasiones: setStyle(), addClass(), removeClass(), setAttribute(), removeAttribute(). Modifica propiedades y estilos dinámicamente según eventos o estado. Ejemplo: this.renderer.setStyle(element, 'color', 'red'). Código SSR-safe verificado. No usa manipulación directa del DOM.
10 puntos
1.3 Creación y Eliminación de Elementos del DOM	
No crea ni elimina elementos del DOM programáticamente.
0 puntos
Código que intenta crear/eliminar elementos pero no funciona correctamente.
1 puntos
Creación/eliminación muy básica con múltiples errores. Funcionalidad limitada.
2 puntos
Intenta crear/eliminar elementos pero con errores (memory leaks, elementos no eliminados correctamente).
3 puntos
Crea elementos de forma básica y directa. Elimina elementos pero sin gestión adecuada del ciclo de vida.
4 puntos
Crea elementos usando innerHTML o insertAdjacentHTML sin Renderer2. Funciona pero no sigue mejores prácticas Angular.
5 puntos
Crea elementos en 1 componente. Principalmente manipulación directa (innerHTML). Funcionalidad básica operativa.
6 puntos
Crea y elimina elementos en 1-2 componentes. Usa createElement/appendChild pero también manipulación directa. Funciona correctamente.
7 puntos
Crea y elimina elementos en 2 componentes correctamente. Usa Renderer2 consistentemente.
8 puntos
Crea y elimina elementos en 2-3 componentes con Renderer2. Gestión correcta del ciclo de vida. Alguna operación menor directa.
9 puntos
Crea elementos con createElement() y appendChild() usando Renderer2 en 3+ componentes. Elimina elementos con removeChild(). Implementa clonación de nodos. Ejemplo: const div = this.renderer.createElement('div'); this.renderer.appendChild(parent, div);. Gestiona correctamente la limpieza en ngOnDestroy().
10 puntos
(CE6.e)2.1 Event Binding en Componentes Interactivos	
No implementa event binding. Usa onclick en HTML o no maneja eventos.
0 puntos
Intenta implementar event binding pero no funciona correctamente en la mayoría de casos.
1 puntos
Event binding presente pero con múltiples errores. Funcionalidad limitada.
2 puntos
Implementa pocos eventos (1-2 tipos) o con errores en la sintaxis. Algunos handlers no funcionan.
3 puntos
Solo 2-3 tipos de eventos. Implementación muy básica (solo click y algún otro).
4 puntos
Implementa 3-4 tipos de eventos básicos. Principalmente click y submit. Eventos de teclado o mouse limitados.
5 puntos
Implementa 4-5 tipos de eventos. Funcionalidad básica. Falta uso de algunos eventos esperados (como focus/blur).
6 puntos
Implementa 5-6 tipos de eventos. Algún handler sin objeto $event cuando sería necesario. Funciona correctamente.
7 puntos
Implementa 6-7 tipos de eventos. Sintaxis correcta. Funcionalidad completa. Documentación presente pero mejorable.
8 puntos
Implementa 7-8 tipos de eventos correctamente. Event binding limpio en templates. Acceso correcto al objeto evento. Documentación casi completa.
9 puntos
Implementa event binding completo en templates: (click), (keydown), (keyup), (mouseenter), (mouseleave), (focus), (blur), (submit). Usa 8+ tipos de eventos diferentes en el proyecto. Sintaxis correcta: (evento)="handler($event)". Acceso al objeto evento cuando es necesario. Tabla en README documentando todos los eventos implementados.
10 puntos
2.2 Manejo de Eventos Específicos (Teclado, Mouse, Focus)	
No implementa eventos de teclado, mouse ni focus. Solo click básico o nada.
0 puntos
Intenta implementar eventos diversos pero no funcionan o están mal implementados.
1 puntos
Muy pocos eventos (1-2). Implementación muy limitada.
2 puntos
Solo 2-3 eventos básicos. Poca variedad. No cubre adecuadamente teclado, mouse y focus.
3 puntos
Implementa 3-4 eventos. Principalmente click y algún evento de teclado básico. Falta diversidad.
4 puntos
Implementa 4-5 eventos. Falta cobertura completa de alguna categoría (ej: sin eventos de focus).
5 puntos
Implementa 5-6 eventos. Categorías básicas cubiertas (algunos de teclado, mouse y focus).
6 puntos
Implementa 6-7 eventos. Cubre las categorías principales pero con menor variedad.
7 puntos
Implementa 7-8 eventos diversos. Buena cobertura de teclado, mouse y focus.
8 puntos
Implementa 9-10 eventos de teclado, mouse y focus correctamente. Contextos apropiados. Funcionalidad completa.
9 puntos
Implementa eventos de teclado: (keydown.enter), (keydown.escape), (keydown.arrowup), (keydown.arrowdown), (keyup). Eventos de mouse: (mouseenter), (mouseleave), (click). Eventos de focus: (focus), (blur), (focusin), (focusout). Mínimo 10 eventos diferentes bien implementados en contextos apropiados.
10 puntos
2.3 Prevención y Control de Propagación de Eventos	
No implementa prevención ni control de propagación de eventos.
0 puntos
No usa preventDefault ni stopPropagation donde es necesario, causando comportamientos no deseados.
1 puntos
Código presente pero no funcional. No previene comportamientos cuando debería.
2 puntos
Intenta prevenir comportamientos por defecto pero no funciona correctamente. Errores de implementación.
3 puntos
Implementa preventDefault o stopPropagation 1 vez pero de forma incompleta o en contexto no óptimo.
4 puntos
Implementa solo preventDefault en formulario, pero no controla propagación en otros componentes.
5 puntos
Implementa preventDefault al menos 1 vez (formulario). Usa stopPropagation en 1 contexto (menú o modal).
6 puntos
Implementa en 2 contextos. Funciona correctamente pero podría aplicarse en más situaciones.
7 puntos
Implementa en 2-3 contextos correctamente. Previene comportamientos por defecto donde es necesario.
8 puntos
Implementa preventDefault y stopPropagation en 3 contextos correctamente. Funcionalidad perfecta. Comentarios explicativos.
9 puntos
Implementa event.preventDefault() en formularios para prevenir recarga de página. Implementa event.stopPropagation() en modales/menús para evitar cierre al click interno. Usa correctamente en 3+ contextos diferentes. Ejemplo: onSubmit(event: Event) { event.preventDefault(); }. Documentado en código.
10 puntos
2.4 Eventos Globales con @HostListener	
No implementa eventos globales. Menú/modal no responden a ESC ni click fuera.
0 puntos
Intenta implementar eventos globales sin usar @HostListener (addEventListener directo, no recomendado en Angular).
1 puntos
Código de @HostListener no funcional. Errores de sintaxis o lógica.
2 puntos
@HostListener presente pero con errores. No captura eventos correctamente.
3 puntos
Intenta usar @HostListener pero con implementación incompleta. Funciona parcialmente.
4 puntos
Implementa @HostListener 1 vez correctamente pero de forma limitada.
5 puntos
Implementa @HostListener en 1-2 componentes. Funcionalidad básica (al menos document:click para "click fuera").
6 puntos
Implementa @HostListener en 2 componentes. Funciona correctamente. Algún evento global faltante.
7 puntos
Implementa @HostListener en 2-3 componentes. Funcionalidad completa. Maneja document:click y keydown.escape.
8 puntos
Implementa @HostListener en 3 componentes correctamente. Eventos globales funcionan perfectamente. Código limpio.
9 puntos
Implementa @HostListener para eventos globales en 3+ componentes: @HostListener('document:click', ['$event']), @HostListener('document:keydown.escape'), @HostListener('window:resize'). Maneja correctamente eventos de documento/window. Implementa lógica de "click fuera" en menú/modal. Ejemplo completo: @HostListener('document:keydown.escape') onEscape() { this.close(); }
10 puntos
(CE6.e + CE6.d)3.1 Menú Hamburguesa Mobile	
No implementa menú hamburguesa mobile.
0 puntos
Intento de menú hamburguesa pero no funciona.
1 puntos
Menú presente pero mayormente no funcional. Abre pero no cierra correctamente.
2 puntos
Menú implementado pero con errores (no cierra correctamente, animación rota, no responsive).
3 puntos
Menú que abre/cierra pero sin animación. No responde a click fuera ni ESC. Funcionalidad muy básica.
4 puntos
Menú básico funcional: abre/cierra con botón. Animación simple o ausente. No cierra con click fuera ni ESC.
5 puntos
Menú funcional: toggle y animación. Falta click fuera y/o ESC. Responsive correcto.
6 puntos
Menú funcional: toggle, animación, click fuera. Falta cierre con ESC o accesibilidad.
7 puntos
Menú funcional: toggle, animación, click fuera, ESC. Accesibilidad básica. Alguna animación mejorable.
8 puntos
Menú con todas las funcionalidades pero sin algún detalle menor (icono no animado o aria-labels incompletos).
9 puntos
Menú mobile 100% funcional: Toggle abrir/cerrar con botón hamburguesa. Animación CSS suave (transform/transition). Cierre con click fuera (usando @HostListener). Cierre con ESC (keydown.escape). Icono animado (hamburguesa ↔ X). Accesible (aria-expanded, aria-label). Responsive (< 768px).
10 puntos
3.2 Modal (Cuadro de Diálogo)	
No implementa modal.
0 puntos
Intento de modal pero no funciona correctamente.
1 puntos
Modal presente pero mayormente no funcional. Abre pero problemas al cerrar.
2 puntos
Modal implementado pero con errores significativos (no cierra correctamente, overlay no funciona).
3 puntos
Modal que abre/cierra con botón. No responde a ESC ni click en overlay. Funcionalidad mínima.
4 puntos
Modal funcional básico: abre y cierra con botón. Responde a ESC. Sin overlay funcional o sin animación.
5 puntos
Modal básico funcional: abre y cierra con botón y ESC. Overlay presente. Falta click en overlay o animaciones.
6 puntos
Modal funcional: abrir, cerrar con X y ESC. Click en overlay funciona. Falta animación o bloqueo de scroll.
7 puntos
Modal funcional: abrir, cerrar con X, ESC y overlay. Animación presente. Bloqueo de scroll. Accesibilidad básica.
8 puntos
Modal con todas las funcionalidades principales. Falta algún detalle menor (focus trap o aria-modal).
9 puntos
Modal completamente funcional: Abrir con botón/evento. Cerrar con botón X. Cerrar con ESC (@HostListener). Cerrar con click en overlay (stopPropagation en contenido). Animación de entrada/salida (fade-in). Overlay oscuro (backdrop). Bloqueo scroll del body. Accesibilidad (role="dialog", aria-modal="true", focus trap).
10 puntos
3.3 Componente Adicional 1 - Accordion	
No implementa accordion.
0 puntos
Intento de accordion pero no funciona.
1 puntos
Accordion presente pero mayormente no funcional.
2 puntos
Accordion implementado con errores (animaciones rotas, no colapsa correctamente).
3 puntos
Accordion básico que expande/colapsa pero sin animación ni accesibilidad.
4 puntos
Accordion funcional sin animación. Click funciona pero sin refinamiento.
5 puntos
Accordion básico funcional: expandir/colapsar secciones. Animación simple. Sin navegación por teclado.
6 puntos
Accordion funcional: expandir/colapsar con click, animación. Falta navegación completa por teclado.
7 puntos
Accordion funcional: expandir/colapsar, navegación por teclado parcial, animación, iconos.
8 puntos
Accordion con todas las funcionalidades. Falta algún detalle menor de accesibilidad.
9 puntos
Accordion 100% funcional: Expandir/colapsar secciones con click. Navegación por teclado (arrows, Home, End). Solo una sección abierta a la vez (accordion mode) o múltiples (independence mode). Animación smooth (max-height transition). Iconos indicadores (chevron rotado). Accesibilidad (aria-expanded, aria-controls).
10 puntos
3.4 Componente Adicional 2 - Tabs (Pestañas)	
No implementa tabs.
0 puntos
Intento de tabs pero no funciona.
1 puntos
Tabs presente pero mayormente no funcional.
2 puntos
Tabs implementado con errores (no cambia contenido correctamente, indicador roto).
3 puntos
Tabs básico que cambia contenido pero sin indicador visual claro o con errores menores.
4 puntos
Tabs funcional sin navegación por teclado ni transiciones. Cambio básico con click.
5 puntos
Tabs básico funcional: cambio con click, indicador de pestaña activa. Sin navegación por teclado.
6 puntos
Tabs funcional: cambio con click, indicador visual. Navegación por teclado incompleta.
7 puntos
Tabs funcional: cambio con click, navegación por teclado parcial, indicador visual, transición.
8 puntos
Tabs con todas las funcionalidades principales. Falta algún detalle menor de accesibilidad.
9 puntos
Tabs completamente funcional: Cambio entre pestañas con click. Navegación por teclado (arrow left/right, Home, End). Indicador visual de pestaña activa (border-bottom, background). Transición de contenido. Accesibilidad (role="tablist", role="tab", aria-selected, aria-controls). Estado persistente opcional.
10 puntos
3.5 Componente Adicional 3 - Tooltip	
No implementa tooltip.
0 puntos
Intento de tooltip pero no funciona.
1 puntos
Tooltip presente pero mayormente no funcional.
2 puntos
Tooltip implementado con errores (posición incorrecta, no oculta bien).
3 puntos
Tooltip que muestra con hover pero sin ocultar correctamente o con delay excesivo.
4 puntos
Tooltip funcional solo con hover. Sin soporte de focus ni animación.
5 puntos
Tooltip básico funcional: muestra con hover. Oculta con mouseleave. Sin soporte de focus.
6 puntos
Tooltip funcional: hover y focus. Posicionamiento básico. Animación simple.
7 puntos
Tooltip funcional: mouseenter/leave, focusin/out, posicionamiento, animación.
8 puntos
Tooltip con todas las funcionalidades. Falta algún detalle menor (flecha o delay configurable).
9 puntos
Tooltip completamente funcional: Muestra con mouseenter/hover. Oculta con mouseleave. Muestra con focusin. Oculta con focusout. Delay configurable (300ms). Posicionamiento dinámico (top, bottom, left, right). Flecha indicadora. Accesibilidad (aria-describedby). Animación fade-in/out.
10 puntos
(CE6.e + CE6.h) 4.1 Theme Switcher Completo	
No implementa theme switcher.
0 puntos
Intento de theme switcher pero no funciona.
1 puntos
Theme Switcher presente pero mayormente no funcional.
2 puntos
Toggle implementado con errores (no cambia correctamente, localStorage no funciona).
3 puntos
Toggle funciona pero sin persistencia. Tema se pierde al recargar página.
4 puntos
Toggle funcional con localStorage. No se aplica automáticamente al cargar o requiere acción del usuario. Sin detección del sistema.
5 puntos
Theme Switcher básico funcional: toggle y localStorage. Se aplica al cargar. Sin detección de preferencia del sistema.
6 puntos
Theme Switcher funcional: toggle, localStorage, aplicación al cargar. Detección básica de prefers-color-scheme sin listener de cambios.
7 puntos
Theme Switcher funcional: detección prefers-color-scheme, toggle, localStorage, aplicación al cargar, CSS variables.
8 puntos
Theme Switcher con todas las funcionalidades. Falta detección de cambios del sistema en tiempo real o icono animado.
9 puntos
Theme Switcher 100% funcional: Detecta prefers-color-scheme del sistema automáticamente con window.matchMedia('(prefers-color-scheme: dark)'). Toggle claro/oscuro con botón. Persistencia en localStorage. Tema se aplica al cargar la aplicación. Usa CSS Custom Properties (--color-primary, --bg-color). Implementa matchMedia.addEventListener('change') para detectar cambios del sistema en tiempo real. Signal/BehaviorSubject para estado reactivo. Icono cambia (sol ↔ luna).
10 puntos
(CE6.a + CE6.h) 5.1 Sección de Arquitectura de Eventos en README	
No documenta arquitectura de eventos en README.
0 puntos
Apenas menciona eventos. Sin explicación de arquitectura.
1 puntos
Documentación muy limitada. Información incorrecta o irrelevante.
2 puntos
Mención de eventos en README pero sin sección dedicada. Información dispersa y confusa.
3 puntos
Sección muy breve (<150 palabras). Explicación incompleta. Sin estructura clara.
4 puntos
Sección mínima (150-250 palabras). Explicación superficial. Sin ejemplos de código o muy básicos.
5 puntos
Sección básica (200-300 palabras). Explica conceptos principales sin profundizar. Pocos ejemplos.
6 puntos
Sección adecuada (250-350 palabras). Cubre puntos principales. Algunos ejemplos. Estructura correcta pero mejorable.
7 puntos
Sección completa (300-400 palabras). Explica arquitectura, tipos de binding, ejemplos. Estructura clara.
8 puntos
Sección completa (400-500 palabras). Todos los puntos cubiertos. Código de ejemplo. Buena estructura. Falta algún detalle menor.
9 puntos
README con sección dedicada a arquitectura de eventos (mínimo 500 palabras). Explica: patrón de manejo de eventos, tipos de event binding, uso de @HostListener, manipulación del DOM. Código de ejemplo con sintaxis correcta. Estructura clara con subtítulos. Tabla de componentes con eventos asignados. Explicación del flujo de datos unidireccional Angular. Buenas prácticas documentadas.
10 puntos
5.2 Diagrama de Flujo de Eventos	
No incluye diagrama de flujo de eventos.
0 puntos
Esquema textual sin formato visual. No es realmente un diagrama.
1 puntos
Intento de diagrama pero incomprensible o mayormente incorrecto.
2 puntos
Diagrama muy básico o erróneo. No representa correctamente el flujo de eventos.
3 puntos
Diagrama presente pero confuso o incompleto. Difícil de seguir el flujo.
4 puntos
Diagrama muy simple. Flujo básico sin detalles. Formato mejorable.
5 puntos
Diagrama básico presente. Muestra flujo simplificado. Formato simple. Falta detalle.
6 puntos
Diagrama funcional. Muestra flujo básico. Formato simple pero comprensible. Falta algún paso intermedio.
7 puntos
Diagrama claro del flujo principal. Incluye los pasos esenciales. Formato adecuado (ASCII art o similar).
8 puntos
Diagrama completo y claro. Todos los pasos del flujo. Formato profesional. Falta algún detalle menor (leyenda o ejemplo específico).
9 puntos
Diagrama visual completo del flujo de eventos principales: Usuario → Evento DOM → Template Binding → Component Handler → Service/State → View Re-render. Formato profesional (ASCII art, Mermaid, draw.io). Incluye ejemplos específicos del proyecto. Muestra propagación y prevención de eventos. Leyenda explicativa.
10 puntos
5.3 Tabla de Compatibilidad de Navegadores	
No incluye tabla ni información de compatibilidad de navegadores.
0 puntos
Apenas menciona compatibilidad. Sin datos específicos.
1 puntos
Mención de compatibilidad sin estructura. Información muy limitada o incorrecta.
2 puntos
Lista de compatibilidad sin formato tabla o muy incompleta. Información confusa.
3 puntos
Tabla muy básica. 2-3 navegadores. Pocos eventos (2-4). Información limitada.
4 puntos
Tabla simple. 3 navegadores. 3-5 eventos. Formato básico.
5 puntos
Tabla básica. 3-4 navegadores. 4-6 eventos documentados. Sin versiones.
6 puntos
Tabla funcional. 4 navegadores. Sin versiones específicas o solo en algunos casos. 5-7 eventos.
7 puntos
Tabla completa. 4 navegadores principales. Versiones generales (ej: Chrome 76+). 6-8 eventos.
8 puntos
Tabla completa. Todos los navegadores. Versiones específicas. 7-8 eventos documentados. Formato profesional.
9 puntos
Tabla completa de compatibilidad: Lista todos los eventos implementados (click, keydown, mouseenter, focus, blur, etc.). Columnas para Chrome, Firefox, Safari, Edge con versiones específicas. Símbolo de soporte (✓ / ✗). Incluye eventos especiales (prefers-color-scheme, matchMedia). Notas sobre fallbacks o polyfills. Formato Markdown correcto. Mínimo 8 eventos documentados.
10 puntos
(CE6.h) 6.1 Independencia de Contenido, Aspecto y Comportamiento	
Sin separación. Estilos inline, onclick en HTML, lógica mezclada con presentación.
0 puntos
Apenas hay separación. Código monolítico.
1 puntos
Separación muy deficiente. Estilos, contenido y comportamiento significativamente mezclados.
2 puntos
Separación pobre. Más del 40% inline styles. Onclick común. Lógica y presentación mezcladas.
3 puntos
Separación limitada. 30-40% inline styles. Onclick frecuente en HTML. Lógica mezclada.
4 puntos
Separación básica. 20-30% inline styles. Varios onclick en HTML. Lógica mayormente en componentes.
5 puntos
Separación básica. Archivos separados pero con 10-20% inline styles. Mezcla de event binding y onclick. Lógica distribuida entre componentes y servicios.
6 puntos
Separación correcta. Archivos separados. 5-10% inline styles. Event binding con algún onclick ocasional. Lógica parcialmente en servicios.
7 puntos
Buena separación. Archivos independientes. Menos del 5% inline styles. Event binding mayoritario. Lógica principalmente en servicios.
8 puntos


Bloque 2:

FASE 4: Sistemas de rutas y navegación (CE7.g, CE7.h)
FASE 5: Servicios y comunicación HTTP (CE7.a, CE7.b, CE7.c, CE7.d, CE7.e, CE7.f, CE7.g)
Rúbrica
4.1 Configuración de rutas	
No hay sistema de rutas real (o solo enlaces estáticos sin router).
0 puntos
Intento mínimo de configurar rutas, con numerosos errores de navegación.
1 puntos
Configuración muy limitada, con 1–2 rutas poco funcionales.
2 puntos
La configuración de rutas presenta errores (rutas que no cargan, colisiones, orden incorrecto).
3 puntos
Máximo 3 rutas con navegación básica y sin manejo de rutas inexistentes.
4 puntos
Solo 3–4 rutas simples, sin parámetros avanzados ni ruta 404, aunque la navegación elemental funciona.
5 puntos
Se definen 4 rutas básicas con navegación correcta, sin rutas hijas ni 404.
6 puntos
Se definen al menos 4 rutas, incluyendo alguna con parámetro dinámico. La navegación es funcional, pero falta ruta 404 o la documentación es muy incompleta.
7 puntos
Hay al menos 5 rutas bien configuradas, incluyendo alguna ruta con parámetro dinámico y una ruta 404. La navegación entre ellas es estable, aunque la documentación es más básica.
8 puntos
Existen 5 o más rutas principales con parámetros dinámicos y ruta 404. La navegación funciona de forma correcta y la documentación solo presenta pequeños detalles mejorables.
9 puntos
Implementa un sistema de rutas completo con mínimo 5 rutas principales (home, listado, detalle /producto/:id, formularios, about). Rutas con parámetros dinámicos funcionales, rutas hijas anidadas y ruta wildcard ** al final para 404. Todo está correctamente descrito en la documentación de rutas.
10 puntos
4.2 Navegación programática	
No hay navegación con el sistema de rutas.
0 puntos
No se usa navegación programática, solo enlaces declarativos.
1 puntos
Hay intentos de usar navegación desde código pero con errores graves.
2 puntos
La navegación programática falla en varios casos (rutas mal construidas, parámetros no pasados).
3 puntos
Solo se usa navegación básica sin parámetros, o parte del código no funciona como se espera.
4 puntos
Navegación programática presente pero con algunos errores menores o repetición de lógica.
5 puntos
Uso correcto de navegación programática simple (navigate) para cambiar de rutas.
6 puntos
Navegación programática básica combinada con parámetros de ruta. La lectura de datos en destino funciona aunque es limitada.
7 puntos
Realiza navegación programática con parámetros y lectura correcta usando las utilidades de ruta.
8 puntos
Cubre navegación básica, con parámetros y con queryParams, leyendo correctamente los valores en destino. Solo falta el uso de estado o fragmentos.
9 puntos
Utiliza el servicio de enrutamiento para navegación programática completa: navegación básica, con parámetros de ruta (/producto/:id), con queryParams, fragment y estado de navegación. Los parámetros se leen correctamente con las APIs de ruta en los componentes destino.
10 puntos
4.3 Lazy loading	
Carga todo el código de la aplicación sin segmentación alguna.
0 puntos
No se intenta ninguna optimización de carga.
1 puntos
Intentos de configuración que rompen la compilación o el enrutado.
2 puntos
No se ha implementado lazy loading; toda la app se carga en un único bundle.
3 puntos
Configuración de lazy loading con errores (módulos que no cargan, rutas rotas).
4 puntos
Intento de implementar lazy loading que funciona, pero con configuración incompleta o poco clara.
5 puntos
Lazy loading solo en una parte de la aplicación y sin verificación de build.
6 puntos
Lazy loading configurado y funcional, aunque sin precarga ni explicación detallada.
7 puntos
Al menos un módulo o conjunto de rutas se cargan de forma perezosa, y la aplicación funciona correctamente con esta estrategia.
8 puntos
Usa lazy loading en uno o más módulos principales, con precarga configurada; la segmentación del código está verificada.
9 puntos
Implementa carga perezosa en al menos un módulo de funcionalidad, configurando correctamente la carga diferida y una estrategia de precarga. Se ha comprobado la generación de distintos chunks en el build de producción y se documenta la estrategia.
10 puntos
4.4 Route guards	
No se usa ningún mecanismo de protección de rutas.
0 puntos
No hay guards operativos en la aplicación.
1 puntos
Intento de guard con errores graves o sin efecto real.
2 puntos
Implementación incompleta: el guard no protege realmente las rutas o no interviene cuando debería.
3 puntos
Los guards existen pero su lógica es pobre o se aplican incorrectamente.
4 puntos
Se ha creado al menos un guard que funciona, aunque su uso en las rutas es limitado.
5 puntos
Solo hay un guard bien implementado (habitualmente CanActivate o CanDeactivate) y se usa de forma coherente.
6 puntos
Dos guards implementados; al menos uno de ellos (CanActivate o CanDeactivate) está bien resuelto, el otro es más simple o limitado.
7 puntos
Existen los dos tipos de guards y se aplican en las rutas adecuadas, garantizando protección básica y confirmación en formularios.
8 puntos
Tanto CanActivate como CanDeactivate funcionan correctamente, controlando acceso y salida de rutas sensibles, con redirecciones y mensajes adecuados al usuario.
9 puntos
Implementa CanActivate para proteger rutas que requieren autenticación (simulada o real), redirigiendo a una ruta pública (por ejemplo login) en caso de no estar autorizado y conservando la URL de retorno. Implementa CanDeactivate en formularios con cambios sin guardar, mostrando un diálogo de confirmación antes de salir. Los guards se integran de forma consistente en las rutas definidas.
10 puntos
4.5 Resolvers	
La carga de datos siempre se hace en ngOnInit sin usar resolvers.
0 puntos
No se utiliza esta característica de Angular.
1 puntos
Se define un resolver pero no se llega a usar correctamente.
2 puntos
No hay resolvers en el enrutado.
3 puntos
Resolver presente pero con fallos de integración o sin utilizar su resultado correctamente.
4 puntos
Se ve un intento de resolver que funciona en casos simples.
5 puntos
Resolver implementado y enlazado con la ruta, aunque su utilidad es limitada.
6 puntos
Resolver básico que devuelve datos válidos, aunque sin estados de carga diferenciados.
7 puntos
Resolver que obtiene los datos requeridos para la ruta, evitando flashes de vista sin datos.
8 puntos
Resolver totalmente funcional que precarga datos, con gestión explícita del estado de carga y algún manejo de error.
9 puntos
Implementa un resolver en al menos una ruta (por ejemplo, detalle de un recurso) que obtiene los datos antes de activar el componente. Se muestra un estado de carga mientras resuelve y, en caso de error, se gestiona redirección o mensaje sin dejar la vista en un estado inconsistente.
10 puntos
4.6 Breadcrumbs dinámicos	
No se ha contemplado este elemento de navegación.
0 puntos
Sin breadcrumbs visibles en la interfaz.
1 puntos
Estructura parcial que apenas aporta valor al usuario.
2 puntos
No se han implementado breadcrumbs dinámicos.
3 puntos
Breadcrumbs con errores (rutas mal representadas, enlaces que no llevan donde deben).
4 puntos
Breadcrumbs estáticos que solo cubren algunos casos o rutas.
5 puntos
Breadcrumbs básicos que muestran la posición actual de forma estática o semidinámica.
6 puntos
Breadcrumbs parcialmente dinámicos, actualizados en las rutas principales.
7 puntos
Breadcrumbs que cambian según la ruta actual y que permiten al usuario orientarse y volver a rutas superiores.
8 puntos
Breadcrumbs dinámicos correctos, que cambian con la ruta y permiten navegación hacia atrás, con pequeños detalles mejorables.
9 puntos
Implementa un sistema de breadcrumbs dinámicos que se construyen a partir de la configuración de rutas (por ejemplo usando data en las rutas). Los breadcrumbs se actualizan automáticamente cuando el usuario navega, reflejan correctamente el camino actual e incluyen enlaces navegables a cada nivel.
10 puntos
4.7 Documentación de rutas	
No existe documentación sobre el sistema de rutas.
0 puntos
README sin referencia clara a la navegación.
1 puntos
La documentación no ayuda a comprender el sistema de rutas.
2 puntos
No hay un apartado dedicado a rutas, solo menciones dispersas.
3 puntos
Documentación muy parcial, que no permite entender bien la navegación.
4 puntos
Solo se documentan algunas rutas o aspectos del enrutado.
5 puntos
Lista de rutas en la documentación con información básica.
6 puntos
Documentación suficiente que describe las rutas principales y su propósito.
7 puntos
Mapa de rutas documentado junto a una explicación clara sobre lazy loading y rutas especiales.
8 puntos
Documentación muy completa que cubre el mapa de rutas y la mayor parte de detalles de lazy loading, guards y resolvers.
9 puntos
Incluye en la documentación un mapa completo de rutas (tabla con path, descripción, parámetros, guards, resolvers), explicación de la estrategia de lazy loading y descripción de los guards y resolvers usados. Opcionalmente, se aporta diagrama de arquitectura de rutas.
10 puntos
5.1 Configuración de HttpClient	
No se utiliza el cliente HTTP del framework.
0 puntos
No hay configuración reconocible del cliente HTTP.
1 puntos
Errores que impiden algunas peticiones HTTP.
2 puntos
Falta de configuración correcta del módulo HTTP.
3 puntos
Configuración con problemas (duplicidades, mala organización).
4 puntos
Configuración básica sin errores graves pero sin centralización clara.
5 puntos
Cliente HTTP funcionando con configuración mínima necesaria.
6 puntos
Cliente HTTP y servicio base correctamente definidos.
7 puntos
HttpClient configurado y al menos un interceptor activo (p. ej. cabeceras).
8 puntos
Cliente HTTP bien configurado con servicio base e interceptores activos, con detalles menores mejorables.
9 puntos
Configura correctamente el cliente HTTP: módulo/import adecuado, creación de un servicio base HTTP y configuración de interceptores para cabeceras comunes (por ejemplo, JSON por defecto, idioma). La configuración es coherente y reutilizable en toda la app.
10 puntos
5.2 Operaciones CRUD completas	
No se implementa CRUD en el proyecto.
0 puntos
Prácticamente no hay operaciones CRUD útiles.
1 puntos
CRUD muy incompleto, con operaciones que fallan con frecuencia.
2 puntos
Las operaciones CRUD tienen errores importantes de funcionamiento.
3 puntos
Solo lectura de datos (GET) sin modificación ni creación.
4 puntos
CRUD básico: lectura y creación de recursos funcionando.
5 puntos
Dos operaciones (por ejemplo, listar y crear) más listado general funcional.
6 puntos
Al menos tres operaciones CRUD funcionando para el recurso principal.
7 puntos
CRUD completo implementado y probado para un recurso principal.
8 puntos
CRUD casi completo, con 3–4 operaciones bien integradas y conectadas a una API.
9 puntos
En al menos un recurso, se implementan las cuatro operaciones: listar y obtener detalle (GET), crear (POST), actualizar (PUT/PATCH) y eliminar (DELETE), contra una API REST real o simulada (json-server) con integración completa en la UI.
10 puntos
5.3 Manejo de respuestas	
Las respuestas no se manejan de forma explícita.
0 puntos
No se considera el contrato de datos ni los errores de la API.
1 puntos
Errores HTTP sin tratamiento; el usuario no recibe feedback adecuado.
2 puntos
No se usa catchError y los errores pueden romper la ejecución.
3 puntos
Pocas interfaces; la mayoría de respuestas se tratan como tipo any.
4 puntos
Manejo de errores puntual sin mucha sistematización ni tipado completo.
5 puntos
Algún tipado y manejo de errores en puntos clave.
6 puntos
Uso de interfaces para la mayoría de respuestas y manejo básico de errores.
7 puntos
Todas las respuestas están tipadas y se manejan los errores más habituales mediante catchError.
8 puntos
Interfaces bien diseñadas, transformación de datos adecuada y catchError en todos los servicios.
9 puntos
Define interfaces TypeScript para todas las respuestas de la API, utiliza operadores de transformación (map) para adaptar la estructura de datos a la vista, y maneja errores sistemáticamente con catchError y, cuando procede, reintentos (retry). Se diferencian claramente errores de red, servidor y validación.
10 puntos
5.4 Diferentes formatos	
No hay un tratamiento consciente del formato de datos.
0 puntos
Únicamente se realizan peticiones mínimas sin configurar formatos.
1 puntos
Cabeceras o parámetros se configuran de forma incorrecta.
2 puntos
Errores al usar FormData o parámetros que impiden algunas operaciones.
3 puntos
No se usan query params ni otros formatos; la API está infrautilizada.
4 puntos
JSON básico sin aprovechar otras posibilidades del cliente HTTP.
5 puntos
Solo JSON, pero correctamente manejado.
6 puntos
JSON y query params establecidos para filtros básicos.
7 puntos
JSON combinado con algún uso avanzado de FormData o query params.
8 puntos
JSON + FormData y uso correcto de query params para filtrar/paginar.
9 puntos
Maneja JSON como formato principal, soporta FormData para subida de archivos y utiliza query parameters para filtros y paginación (ej. ?page=2&limit=20&type=...). Se configuran cabeceras personalizadas cuando la API lo requiere (autenticación, versión, etc.).
10 puntos
5.5 Estados de carga, error y empty	
El usuario no sabe si la aplicación está cargando, ha fallado, o simplemente no tiene datos.
0 puntos
No se contemplan estos estados en el diseño.
1 puntos
El usuario apenas recibe información sobre lo que está ocurriendo con las peticiones.
2 puntos
La experiencia de usuario ante errores y cargas es confusa.
3 puntos
Sin estados diferenciados; la UI solo cambia de golpe entre vacío y datos.
4 puntos
Se manejan algunos estados pero de forma irregular o limitada.
5 puntos
Al menos hay feedback visual de carga mientras se esperan datos.
6 puntos
Se muestra un estado de carga y se informa de errores al usuario.
7 puntos
Hay estados diferenciados de carga y error, más un manejo básico del estado vacío.
8 puntos
Los estados de carga, error y vacío están correctamente reflejados en la UI, con mensajes claros y consistentes.
9 puntos
Implementa un estado de carga visual (spinner, skeleton) durante las peticiones, estado de error con mensajes claros al usuario, estado vacío cuando no hay datos (con mensaje y acción sugerida) y mensajes de éxito tras operaciones (por ejemplo, toast tras crear o actualizar).
10 puntos
5.6 Interceptores HTTP	
Toda la lógica que podría ir en interceptores está duplicada manualmente en cada servicio.
0 puntos
No se utilizan interceptores en el proyecto.
1 puntos
Configuración de interceptores incorrecta o fuera del flujo de peticiones.
2 puntos
Interceptores que causan errores en la comunicación HTTP.
3 puntos
No hay interceptores activos, aunque podrían estar definidos.
4 puntos
Interceptores parcialmente implementados o con uso limitado.
5 puntos
Hay un interceptor que realiza correctamente una tarea clave (auth, errores o logging).
6 puntos
Existen al menos dos interceptores bien implementados.
7 puntos
Se usan interceptores para autenticación y errores de forma adecuada.
8 puntos
Los tres interceptores están presentes y funcionan de forma coherente.
9 puntos
Implementa tres interceptores: uno para añadir token de autenticación a las peticiones, otro para el manejo global de errores (con mensajes o redirecciones) y otro para log de peticiones/respuestas en desarrollo. Están bien organizados y registrados.
10 puntos
5.7 Documentación de API	
No hay documentación sobre la API ni en README ni en comentarios.
0 puntos
README sin referencias claras a la API utilizada.
1 puntos
La información sobre endpoints es confusa o contradictoria.
2 puntos
Prácticamente no hay documentación técnica de la API. 1
3 puntos
La documentación omite partes importantes de la comunicación HTTP.
4 puntos
Documentación limitada que obliga a revisar código para comprender la API.
5 puntos
Se mencionan endpoints clave, aunque de forma breve. 1
6 puntos
Documentación razonable del uso principal de la API.
7 puntos
Lista de endpoints con su descripción y modelos de datos principales.
8 puntos

## Evaluacion otorgada

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
