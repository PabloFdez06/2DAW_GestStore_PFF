# Documentacion de Interactividad del Cliente - GestStore

## Indice

1. [Introduccion](#introduccion)
2. [Arquitectura de Eventos](#arquitectura-de-eventos)
3. [Manipulacion del DOM](#manipulacion-del-dom)
4. [Componentes Interactivos](#componentes-interactivos)
   - [Theme Switcher](#theme-switcher)
   - [Menu Hamburguesa](#menu-hamburguesa)
   - [Modal](#modal)
   - [Acordeon](#acordeon)
   - [Tabs](#tabs)
   - [Tooltip](#tooltip)
5. [Sistema de Temas](#sistema-de-temas)
6. [Diagrama de Flujo de Eventos](#diagrama-de-flujo-de-eventos)
7. [Compatibilidad de Navegadores](#compatibilidad-de-navegadores)
8. [Conclusiones](#conclusiones)

---

## Introduccion

Este documento describe la implementacion de la capa de interactividad del cliente en la aplicacion GestStore, desarrollada con Angular. El objetivo principal ha sido crear una experiencia de usuario fluida e interactiva, implementando manipulacion del DOM, sistema de eventos, y componentes interactivos accesibles.

He seguido las mejores practicas de Angular para la gestion de eventos y manipulacion del DOM, utilizando decoradores como `@ViewChild`, `@HostListener`, y servicios inyectables para mantener una arquitectura limpia y mantenible.

---

## Arquitectura de Eventos

### Estructura General

La arquitectura de eventos de GestStore se basa en los siguientes principios:

1. **Event Binding de Angular**: Utilizo la sintaxis `(evento)="metodo()"` para vincular eventos del DOM a metodos del componente.

2. **HostListener**: Para eventos a nivel de documento (como tecla ESC o clicks fuera de elementos), utilizo el decorador `@HostListener`.

3. **Signals de Angular**: Para el estado reactivo de los componentes, implemento Angular Signals que permiten una actualizacion eficiente de la vista.

4. **Servicios Inyectables**: Para funcionalidades compartidas como el tema de la aplicacion, utilizo servicios singleton que mantienen el estado global.

### Tipos de Eventos Implementados

| Tipo de Evento | Uso | Componente |
|----------------|-----|------------|
| `click` | Interacciones de usuario | Todos |
| `keydown` | Navegacion con teclado | Modal, Tabs, Accordion |
| `keydown.escape` | Cierre de elementos | Modal, Menu, Tooltip |
| `mouseenter/mouseleave` | Hover para tooltips | TooltipDirective |
| `focus/blur` | Accesibilidad con teclado | Tooltip, Tabs |

---

## Manipulacion del DOM

### ViewChild y ElementRef

He utilizado `ViewChild` y `ElementRef` para acceder a elementos del DOM de forma segura dentro del contexto de Angular:

```typescript
@ViewChild('hamburgerButton') hamburgerButton!: ElementRef<HTMLButtonElement>;
@ViewChild('mobileMenu') mobileMenuRef!: ElementRef<HTMLElement>;
```

### Modificacion Dinamica de Propiedades

En el ThemeService, modifico propiedades del documento dinamicamente:

```typescript
private applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}
```

### Creacion y Eliminacion de Elementos

En la directiva TooltipDirective, creo y elimino elementos del DOM programaticamente usando el Renderer2 de Angular:

```typescript
private tooltipElement: HTMLElement | null = null;

private showTooltip(): void {
  this.tooltipElement = this.renderer.createElement('div');
  this.renderer.addClass(this.tooltipElement, 'tooltip');
  this.renderer.appendChild(document.body, this.tooltipElement);
}

private removeTooltip(): void {
  if (this.tooltipElement && this.tooltipElement.parentNode) {
    this.renderer.removeChild(document.body, this.tooltipElement);
    this.tooltipElement = null;
  }
}
```

---

## Componentes Interactivos

### Theme Switcher

**Ubicacion**: `src/app/components/atoms/theme-switcher/`

**Funcionalidades implementadas**:
- Deteccion de preferencia del sistema mediante `prefers-color-scheme`
- Toggle entre tema claro y oscuro
- Persistencia en localStorage
- Aplicacion automatica del tema al cargar la aplicacion
- Animacion visual en el toggle

**Eventos utilizados**:
- `click`: Para alternar el tema
- `keydown.enter` y `keydown.space`: Accesibilidad con teclado

**Implementacion del servicio ThemeService**:

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  currentTheme = signal<Theme>('light');
  
  private initializeTheme(): void {
    const savedTheme = this.getThemeFromStorage();
    if (savedTheme) {
      this.currentTheme.set(savedTheme);
    } else {
      const systemTheme = this.getSystemPreference();
      this.currentTheme.set(systemTheme);
    }
  }
  
  private getSystemPreference(): Theme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
```

---

### Menu Hamburguesa

**Ubicacion**: `src/app/components/layout/header/`

**Funcionalidades implementadas**:
- Apertura y cierre con animacion CSS (transformacion a X)
- Cierre automatico al hacer click fuera del menu
- Cierre con tecla ESC
- Overlay oscuro que bloquea la interaccion con el contenido
- Prevencion del scroll del body cuando esta abierto
- Focus trap para navegacion accesible

**Eventos utilizados**:

```typescript
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  if (!this.isMenuOpen()) return;
  const target = event.target as HTMLElement;
  const clickedInsideMenu = this.elementRef.nativeElement.contains(target);
  if (!clickedInsideMenu) {
    this.closeMenu();
  }
}

@HostListener('document:keydown.escape', ['$event'])
onEscapeKey(event: KeyboardEvent): void {
  if (this.isMenuOpen()) {
    event.preventDefault();
    this.closeMenu();
    this.hamburgerButton?.nativeElement?.focus();
  }
}
```

---

### Modal

**Ubicacion**: `src/app/components/molecules/modal/`

**Funcionalidades implementadas**:
- Apertura y cierre programatico mediante metodos `open()` y `close()`
- Cierre con tecla ESC
- Cierre al hacer click en el overlay (configurable)
- Focus trap para navegacion con teclado
- Animaciones de entrada y salida
- Multiples tamanos (small, medium, large)
- Soporte para footer opcional
- Atributos ARIA para accesibilidad

**Focus Trap**:

```typescript
@HostListener('document:keydown.tab', ['$event'])
onTabKey(event: KeyboardEvent): void {
  if (!this.isOpen() || !this.modalContent) return;
  
  this.updateFocusableElements();
  const firstElement = this.focusableElements[0];
  const lastElement = this.focusableElements[this.focusableElements.length - 1];
  
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}
```

---

### Acordeon

**Ubicacion**: `src/app/components/molecules/accordion/`

**Funcionalidades implementadas**:
- Expandir y colapsar secciones individuales
- Modo de expansion unica (solo un item abierto a la vez)
- Animacion suave de expansion/colapso
- Navegacion con teclado (Arrow Up/Down, Home, End)
- Atributos ARIA (`aria-expanded`, `aria-controls`)

**Componentes**:
- `AccordionComponent`: Contenedor principal
- `AccordionItemComponent`: Items individuales

**Navegacion con teclado**:

```typescript
onKeyDown(event: KeyboardEvent): void {
  const itemsArray = this.items.toArray();
  const currentIndex = itemsArray.findIndex(
    item => document.activeElement?.id === item.headerId
  );
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      targetIndex = (currentIndex + 1) % itemsArray.length;
      break;
    case 'ArrowUp':
      event.preventDefault();
      targetIndex = currentIndex === 0 ? itemsArray.length - 1 : currentIndex - 1;
      break;
    case 'Home':
      event.preventDefault();
      targetIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      targetIndex = itemsArray.length - 1;
      break;
  }
}
```

---

### Tabs

**Ubicacion**: `src/app/components/molecules/tabs/`

**Funcionalidades implementadas**:
- Cambio entre pestanas con click
- Navegacion con teclado (Arrow Left/Right, Home, End)
- Soporte para pestanas deshabilitadas
- Multiples variantes visuales (default, pills, underline)
- Indicador animado que sigue la pestana activa
- Animacion de contenido al cambiar
- Atributos ARIA completos

**Componentes**:
- `TabsComponent`: Contenedor de pestanas
- `TabPanelComponent`: Panel de contenido individual

**Navegacion con teclado**:

```typescript
onKeyDown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault();
      targetIndex = this.findNextEnabledTab(currentIndex, 1);
      break;
    case 'ArrowLeft':
      event.preventDefault();
      targetIndex = this.findNextEnabledTab(currentIndex, -1);
      break;
  }
}
```

---

### Tooltip

**Ubicacion**: `src/app/directives/tooltip.directive.ts`

**Funcionalidades implementadas**:
- Mostrar al hover y focus (accesibilidad)
- Ocultar al salir o perder focus
- Cierre con tecla ESC
- Cuatro posiciones (top, bottom, left, right)
- Delay configurable
- Posicionamiento automatico respetando bordes de pantalla
- Animacion de entrada/salida
- Creacion dinamica del elemento en el DOM

**Uso**:

```html
<button 
  appTooltip="Texto del tooltip"
  tooltipPosition="top"
  [tooltipDelay]="200">
  Hover me
</button>
```

**Eventos**:

```typescript
@HostListener('mouseenter')
onMouseEnter(): void {
  if (this.tooltipDisabled || !this.tooltipText) return;
  this.scheduleShow();
}

@HostListener('mouseleave')
onMouseLeave(): void {
  this.scheduleHide();
}

@HostListener('focus')
onFocus(): void {
  if (this.tooltipDisabled || !this.tooltipText) return;
  this.scheduleShow();
}

@HostListener('blur')
onBlur(): void {
  this.scheduleHide();
}
```

---

## Sistema de Temas

### Implementacion

El sistema de temas se basa en CSS Custom Properties (variables CSS) que se modifican segun el atributo `data-theme` del elemento raiz:

**Variables CSS** (`_css-variables.scss`):

```scss
:root {
  --bg-default: #{$bg-default};
  --text-default: #{$text-default};
  --border-default: #{$border-default};
}

[data-theme='dark'] {
  --bg-default: #{$gray-900};
  --text-default: #{$gray-50};
  --border-default: #{$gray-700};
}

[data-theme='light'] {
  --bg-default: #{$bg-default};
  --text-default: #{$text-default};
  --border-default: #{$border-default};
}
```

### Flujo de Inicializacion

1. Al cargar la aplicacion, ThemeService verifica localStorage
2. Si no hay preferencia guardada, detecta `prefers-color-scheme`
3. Aplica el tema mediante `document.documentElement.setAttribute('data-theme', theme)`
4. Se suscribe a cambios en la preferencia del sistema

### Persistencia

```typescript
private saveThemeToStorage(theme: Theme): void {
  localStorage.setItem(this.STORAGE_KEY, theme);
}

private getThemeFromStorage(): Theme | null {
  const stored = localStorage.getItem(this.STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return null;
}
```

---

## Diagrama de Flujo de Eventos

### Flujo del Theme Switcher

```
Usuario hace click en toggle
         |
         v
ThemeSwitcherComponent.toggleTheme()
         |
         v
ThemeService.toggleTheme()
         |
         v
currentTheme signal se actualiza
         |
         v
Effect detecta cambio
         |
         v
applyTheme() -> document.documentElement.setAttribute('data-theme', theme)
         |
         v
saveThemeToStorage() -> localStorage.setItem()
         |
         v
CSS Custom Properties se actualizan
         |
         v
UI refleja el nuevo tema
```

### Flujo del Menu Hamburguesa

```
Usuario hace click en boton hamburguesa
         |
         v
toggleMenu() es llamado
         |
         v
isMenuOpen signal se actualiza a true
         |
         v
Menu se renderiza con @if
         |
         v
disableBodyScroll() previene scroll
         |
         v
Focus se mueve al primer link del menu
         |
         |--- Usuario hace click fuera --->  @HostListener('document:click') detecta
         |                                            |
         |                                            v
         |                                   closeMenu() es llamado
         |
         |--- Usuario presiona ESC -------->  @HostListener('document:keydown.escape')
         |                                            |
         |                                            v
         |                                   closeMenu() es llamado
         |
         v
closeMenu() -> isMenuOpen.set(false)
         |
         v
enableBodyScroll() restaura scroll
         |
         v
Focus vuelve al boton hamburguesa
```

### Flujo del Modal

```
openModal() es llamado
         |
         v
Guardar elemento con focus actual
         |
         v
isOpen signal = true
         |
         v
Modal se renderiza
         |
         v
disableBodyScroll()
         |
         v
Focus al primer elemento focusable
         |
         |
         |--- Click en overlay -----------> closeOnOverlayClick? -> close()
         |
         |--- Presionar ESC -------------> closeOnEscape? -> close()
         |
         |--- Tab key -------------------> Focus trap mantiene focus dentro
         |
         v
close() es llamado
         |
         v
isClosing = true (animacion de salida)
         |
         v
setTimeout (esperar animacion)
         |
         v
isOpen = false, isClosing = false
         |
         v
enableBodyScroll()
         |
         v
Restaurar focus al elemento previo
```

---

## Compatibilidad de Navegadores

### Eventos y APIs Utilizados

| Caracteristica | Chrome | Firefox | Safari | Edge |
|----------------|--------|---------|--------|------|
| `click` event | Si | Si | Si | Si |
| `keydown` event | Si | Si | Si | Si |
| `focus`/`blur` events | Si | Si | Si | Si |
| `mouseenter`/`mouseleave` | Si | Si | Si | Si |
| `KeyboardEvent.key` | 51+ | 44+ | 10.1+ | 79+ |
| `prefers-color-scheme` | 76+ | 67+ | 12.1+ | 79+ |
| `localStorage` | Si | Si | Si | Si |
| `matchMedia` | Si | Si | Si | Si |
| CSS Custom Properties | 49+ | 31+ | 9.1+ | 16+ |
| `getBoundingClientRect()` | Si | Si | Si | Si |
| `Element.closest()` | 41+ | 35+ | 6+ | 15+ |
| `ResizeObserver` | 64+ | 69+ | 13.1+ | 79+ |
| Angular Signals | N/A (Angular 16+) | N/A | N/A | N/A |

### Notas de Compatibilidad

1. **prefers-color-scheme**: Para navegadores que no soportan esta media query, el sistema utiliza el tema claro por defecto y permite cambio manual.

2. **CSS Custom Properties**: Ampliamente soportadas en navegadores modernos. No se requiere fallback para los navegadores objetivo.

3. **KeyboardEvent.key**: Utilizado en lugar de `keyCode` (deprecated) para mejor semantica y compatibilidad.

4. **localStorage**: Disponible en todos los navegadores modernos. Implementada gestion de errores para casos donde este deshabilitado.

---

## Conclusiones

He implementado un sistema completo de interactividad del cliente que incluye:

1. **Manipulacion segura del DOM** utilizando ViewChild, ElementRef y Renderer2 de Angular.

2. **Sistema de eventos robusto** con HostListeners para eventos globales y event binding para interacciones locales.

3. **Componentes interactivos accesibles** con soporte completo para navegacion con teclado y atributos ARIA.

4. **Theme Switcher funcional** que detecta preferencias del sistema, permite cambio manual y persiste la eleccion del usuario.

5. **Menu mobile completo** con apertura/cierre animado, cierre al click fuera y con ESC.

6. **Componentes adicionales**: Modal, Acordeon, Tabs y Tooltip, todos con accesibilidad y navegacion por teclado.

La arquitectura implementada sigue las mejores practicas de Angular y garantiza una experiencia de usuario consistente y accesible en todos los navegadores modernos.
