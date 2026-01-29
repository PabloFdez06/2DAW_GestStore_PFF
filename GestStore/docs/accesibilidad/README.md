# Documentación de Accesibilidad - GestStore

## Proyecto Órbita 4: Diseñar para todos

---

## 1. Fundamentos de accesibilidad web

### ¿Por qué es necesaria la accesibilidad?

La accesibilidad web significa que todas las personas puedan usar una página web sin problemas, independientemente de sus capacidades. Esto incluye a personas con discapacidades visuales (ceguera, baja visión, daltonismo), auditivas (sordera parcial o total), motoras (dificultad para usar ratón o teclado) y cognitivas (dislexia, TDAH, dificultades de aprendizaje). Pero no solo beneficia a personas con discapacidad: un sitio accesible también ayuda a usuarios mayores, personas con conexiones lentas, o cualquiera que use el móvil en situaciones difíciles como bajo el sol.

### Marco legal en España y Europa

En España y en la Unión Europea la accesibilidad web no es opcional sino obligatoria. La Directiva Europea 2016/2102 obliga a todas las webs del sector público a cumplir con el nivel AA de WCAG 2.1. En España esto se transpuso con el Real Decreto 1112/2018. Además, el European Accessibility Act (2019) extiende estas obligaciones al sector privado para productos y servicios digitales a partir de 2025.

### Los 4 principios de WCAG 2.1

Las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.1 se organizan en 4 principios fundamentales que he aplicado en mi proyecto:

#### 1. Perceptible

El contenido debe poder ser percibido por todos los usuarios, aunque no puedan ver o escuchar.

**Ejemplo en mi proyecto:** Todas las imágenes decorativas del hero tienen `alt=""` y las que son informativas tienen descripciones. Los iconos del acordeón tienen `aria-hidden="true"` porque son decorativos y el título del servicio ya transmite la información.

#### 2. Operable

La interfaz debe poder usarse con diferentes dispositivos de entrada, no solo con ratón.

**Ejemplo en mi proyecto:** Mi acordeón funciona completamente con teclado. Puedo navegar con Tab entre los servicios, abrirlos con Enter o Space, y moverme rápido con las flechas. El foco siempre es visible con un outline azul de 2px.

#### 3. Comprensible

La información y el funcionamiento de la interfaz deben ser fáciles de entender.

**Ejemplo en mi proyecto:** Cada panel del acordeón tiene un título claro ("Gestión de Inventario", "Gestión de Tareas"...) que indica exactamente qué contenido hay dentro. El estado abierto/cerrado se comunica visualmente con el chevron y para lectores de pantalla con `aria-expanded`.

#### 4. Robusto

El contenido debe ser compatible con tecnologías actuales y futuras, incluyendo productos de apoyo.

**Ejemplo en mi proyecto:** He usado HTML semántico con `<button>` para los triggers en vez de `<div>` con JavaScript. Esto hace que el acordeón funcione correctamente con lectores de pantalla como NVDA. Los atributos ARIA complementan el HTML, no lo sustituyen.

### Niveles de conformidad: A, AA, AAA

WCAG define tres niveles de conformidad que indican el grado de accesibilidad:

- **Nivel A**: Es el mínimo imprescindible. Sin cumplir estos criterios hay barreras muy graves que impiden el acceso.
- **Nivel AA**: Es el nivel recomendado y el que exige la ley en España/Europa. Elimina la mayoría de barreras para la mayoría de usuarios.
- **Nivel AAA**: Es el nivel más alto pero no siempre es posible cumplirlo para todo el contenido. Se recomienda para sitios especializados.

**Mi objetivo en este proyecto es alcanzar el nivel AA**, que es el estándar legal y el que me permite asegurar que mi web es usable para la gran mayoría de personas con discapacidad.

---

## 2. Componente multimedia/interactivo implementado

**Tipo de componente:** Acordeón interactivo

### Descripción

He implementado un acordeón en la página Home de GestStore que muestra los 6 servicios principales de la aplicación. Cada servicio tiene una cabecera con icono y título que se puede expandir para ver la descripción completa. Al final decidí hacerlo "multiselect" para que el usuario pueda abrir varios paneles a la vez sin que se cierren los demás.

### Características de accesibilidad implementadas

1. **Navegación completa por teclado**: He añadido soporte para `Tab` para moverse entre los botones del acordeón, `Enter` y `Space` para abrir/cerrar cada panel, y las flechas `ArrowDown/ArrowUp` para navegar rápido entre items. También funcionan `Home` y `End` para ir al primer o último servicio directamente.

2. **Atributos ARIA para estados**: Cada botón del acordeón tiene `aria-expanded="true"` o `"false"` dependiendo de si está abierto o cerrado. He puesto también `aria-controls` apuntando al ID del panel correspondiente para que el lector de pantalla sepa qué controla cada botón.

3. **Paneles vinculados con aria-labelledby**: Los paneles tienen `role="region"` y `aria-labelledby` que apunta al ID del trigger, así NVDA y JAWS anuncian correctamente qué panel pertenece a qué cabecera.

4. **Ocultación correcta de paneles cerrados**: He usado `[attr.hidden]` dinámico para que cuando un panel está cerrado los lectores de pantalla no lo lean. Antes solo tenía `max-height: 0` y eso no los ocultaba del árbol de accesibilidad.

5. **Anuncio de posición en la lista**: He añadido un `<span class="sr-only">` dentro de cada botón que dice "Servicio 1 de 6", "Servicio 2 de 6", etc. Así el usuario de lector de pantalla sabe en qué posición está.

6. **Foco visible bien marcado**: He usado el mixin `:focus-visible` que pone un outline azul de 2px con offset de 2px. El foco se ve clarito y no molesta cuando usas el ratón porque solo aparece con teclado.

7. **Sin trampas de teclado**: He comprobado que con Tab puedes salir del acordeón sin problemas hacia la siguiente sección de la página. No hay ningún bucle infinito ni nada raro.

8. **Prevención de scroll con Space**: He añadido `event.preventDefault()` para la tecla espacio en el handler de teclado para que no haga scroll de página cuando pulsas Space sobre un botón del acordeón.

### Código implementado

El acordeón está en el componente `HomeComponent`:

- **HTML**: `src/app/pages/home/home.component.html` (líneas 185-220)
- **TypeScript**: `src/app/pages/home/home.component.ts` (métodos `toggleService`, `onServiceKeydown`, `isServiceOpen`)
- **SCSS**: `src/app/pages/home/home.component.scss` (clases `.service-accordion__*`)

### Estructura HTML del acordeón

```html
<ul class="services__grid" role="list">
  <li class="service-accordion" role="listitem">
    <article class="service-accordion__item">
      <header class="service-accordion__header">
        <button
          type="button"
          class="service-accordion__trigger"
          [attr.aria-expanded]="isServiceOpen(i)"
          [attr.aria-controls]="'service-panel-' + service.id"
          [attr.id]="'service-trigger-' + service.id">
          <span class="sr-only">Servicio {{ i + 1 }} de {{ services.length }}:</span>
          <!-- icono y título -->
        </button>
      </header>
      <section
        role="region"
        [attr.id]="'service-panel-' + service.id"
        [attr.aria-labelledby]="'service-trigger-' + service.id"
        [attr.hidden]="!isServiceOpen(i) ? '' : null">
        <!-- contenido del panel -->
      </section>
    </article>
  </li>
</ul>
```

---

## 3. Criterios WCAG 2.1 AA cumplidos

He revisado mi acordeón contra las pautas WCAG 2.1 nivel AA y estos son los criterios que cumple:

### 3.1 Perceptible

| Criterio | Nivel | ¿Cumple? | Cómo lo he implementado |
|----------|-------|----------|-------------------------|
| 1.3.1 Información y relaciones | A | Sí | He usado estructura semántica correcta: `<button>` para triggers, `<section role="region">` para paneles, y `aria-controls`/`aria-labelledby` para vincularlos. |
| 1.3.2 Secuencia significativa | A | Sí | El orden del DOM coincide con el orden visual. Los servicios van del 1 al 6 en orden lógico. |
| 1.4.3 Contraste mínimo | AA | Sí | El texto de los títulos tiene contraste de 4.5:1 contra el fondo (he usado las variables CSS del tema que ya cumplen). |
| 1.4.11 Contraste no textual | AA | Sí | El borde activo y el foco tienen contraste suficiente (el outline azul de 2px se ve bien sobre blanco y sobre el fondo gris). |

### 3.2 Operable

| Criterio | Nivel | ¿Cumple? | Cómo lo he implementado |
|----------|-------|----------|-------------------------|
| 2.1.1 Teclado | A | Sí | Todo funciona con teclado: Tab para navegar, Enter/Space para activar, flechas para moverse entre items. |
| 2.1.2 Sin trampas de teclado | A | Sí | He probado varias veces que puedo salir del acordeón con Tab hacia adelante y Shift+Tab hacia atrás. |
| 2.4.3 Orden del foco | A | Sí | El orden de tabulación sigue el orden visual de los servicios. |
| 2.4.6 Encabezados y etiquetas | AA | Sí | Cada item tiene un `<h3>` con el título del servicio que describe claramente su contenido. |
| 2.4.7 Foco visible | AA | Sí | He aplicado `&:focus-visible` con outline azul de 2px y offset de 2px. Solo aparece cuando navegas con teclado. |

### 3.3 Comprensible

| Criterio | Nivel | ¿Cumple? | Cómo lo he implementado |
|----------|-------|----------|-------------------------|
| 3.2.1 Al recibir el foco | A | Sí | Cuando un botón recibe el foco no pasa nada raro, solo se marca visualmente. No hay cambios de contexto. |
| 3.2.2 Al recibir entradas | A | Sí | Cuando haces clic o pulsas Enter solo se expande/contrae el panel. No hay redirecciones ni popups. |

### 3.4 Robusto

| Criterio | Nivel | ¿Cumple? | Cómo lo he implementado |
|----------|-------|----------|-------------------------|
| 4.1.2 Nombre, función, valor | A | Sí | Los botones tienen nombre accesible (el texto del título + sr-only), función (button con aria-expanded), y valor (true/false). NVDA lo lee como "Gestión de Inventario, botón expandido" o "contraído". |

### Pruebas realizadas

He probado el acordeón de estas formas:

1. **Navegación solo con teclado**: He desconectado el ratón y he navegado todo el acordeón solo con Tab, Enter, flechas, Home y End. Todo funciona.

2. **Lector de pantalla NVDA**: He activado NVDA y he navegado el acordeón. Anuncia correctamente "botón contraído" y "botón expandido", y lee el contenido del panel cuando lo abro.

3. **Contraste con Wave**: He pasado la extensión Wave y no me ha dado ningún error de contraste en el acordeón.

4. **Validación HTML**: El HTML del acordeón pasa el validador del W3C sin errores.

---

## Herramientas usadas para testing

- **NVDA 2024.1**: Para probar con lector de pantalla real
- **Wave Extension**: Para verificar contrastes y errores ARIA
- **axe DevTools**: Para auditoría automática de accesibilidad
- **Navegación manual con teclado**: Tab, Shift+Tab, Enter, Space, flechas

---

