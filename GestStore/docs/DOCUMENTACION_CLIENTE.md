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

---

# Fase 2: Servicios de Comunicación y Gestión de Estado

## Indice Fase 2

9. [Arquitectura de Servicios](#arquitectura-de-servicios)
10. [Sistema de Notificaciones/Toasts](#sistema-de-notificacionestoasts)
11. [Gestión de Estados de Carga](#gestion-de-estados-de-carga)
12. [Bus de Eventos](#bus-de-eventos)
13. [Servicio de Estado Global](#servicio-de-estado-global)
14. [Patrones de Comunicación](#patrones-de-comunicacion)
15. [Diagrama de Arquitectura de Servicios](#diagrama-de-arquitectura-de-servicios)
16. [Conclusiones Fase 2](#conclusiones-fase-2)

---

## Arquitectura de Servicios

### Principios Implementados

En esta fase he implementado una arquitectura de servicios basada en los siguientes principios:

1. **Separación de responsabilidades**: Los componentes se encargan únicamente de la presentación, mientras que los servicios gestionan la lógica de negocio y el estado.

2. **Patrón Observable/Subject**: Utilizo RxJS para implementar comunicación reactiva entre componentes.

3. **Angular Signals**: Para estado local y computaciones eficientes, combino Signals con Observables.

4. **Inyección de dependencias**: Todos los servicios están disponibles mediante `providedIn: 'root'` para ser singletons a nivel de aplicación.

### Estructura de Servicios

```
services/
├── theme.service.ts         # Gestión del tema de la aplicación
├── notification.service.ts  # Sistema de notificaciones/toasts
├── loading.service.ts       # Estados de carga global/local
├── event-bus.service.ts     # Comunicación entre componentes
├── state.service.ts         # Estado global de la aplicación
└── index.ts                 # Barrel exports
```

---

## Sistema de Notificaciones/Toasts

### NotificationService

**Ubicación**: `src/app/services/notification.service.ts`

He implementado un servicio centralizado para gestionar notificaciones toast en toda la aplicación. Este servicio utiliza el patrón Subject de RxJS para emitir notificaciones que cualquier componente puede escuchar.

**Características implementadas**:
- Múltiples tipos de notificación: `success`, `error`, `warning`, `info`
- Auto-dismiss configurable con duración personalizada
- Límite máximo de notificaciones visibles
- ID único para cada notificación
- Dismissible opcional

**Implementación del servicio**:

```typescript
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSubject = new Subject<Notification>();
  private activeNotifications = signal<Notification[]>([]);
  
  readonly notifications$ = this.notificationsSubject.asObservable();
  readonly notifications = this.activeNotifications.asReadonly();

  success(message: string, title?: string, duration?: number): string {
    return this.notify({ type: 'success', message, title, duration });
  }

  error(message: string, title?: string, duration?: number): string {
    return this.notify({ type: 'error', message, title, duration });
  }

  warning(message: string, title?: string, duration?: number): string {
    return this.notify({ type: 'warning', message, title, duration });
  }

  info(message: string, title?: string, duration?: number): string {
    return this.notify({ type: 'info', message, title, duration });
  }
}
```

**Uso del servicio**:

```typescript
// En cualquier componente
private notificationService = inject(NotificationService);

onSave(): void {
  this.notificationService.success('Datos guardados correctamente', 'Éxito');
}

onError(): void {
  this.notificationService.error('No se pudieron guardar los datos', 'Error');
}
```

### ToastContainerComponent

**Ubicación**: `src/app/components/molecules/toast/`

He creado un componente contenedor que se subscribe al NotificationService y renderiza las notificaciones activas.

**Características**:
- Posicionamiento configurable (top-right, top-left, bottom-right, bottom-left, etc.)
- Animaciones de entrada y salida suaves
- Barra de progreso visual para auto-dismiss
- Iconos según el tipo de notificación
- Botón de cierre para dismiss manual

**Template del componente**:

```html
<div class="toast-container" [class]="'toast-container--' + position">
  @for (notification of notificationService.notifications(); track notification.id) {
    <div 
      class="toast"
      [class]="'toast--' + notification.type"
      [class.toast--dismissing]="dismissingIds.has(notification.id)"
      role="alert"
      aria-live="polite">
      <div class="toast__icon">
        <!-- Icono según tipo -->
      </div>
      <div class="toast__content">
        @if (notification.title) {
          <strong class="toast__title">{{ notification.title }}</strong>
        }
        <p class="toast__message">{{ notification.message }}</p>
      </div>
      @if (notification.dismissible !== false) {
        <button class="toast__close" (click)="dismiss(notification.id)">×</button>
      }
    </div>
  }
</div>
```

---

## Gestión de Estados de Carga

### LoadingService

**Ubicación**: `src/app/services/loading.service.ts`

He implementado un servicio para gestionar estados de carga tanto a nivel global como local (por componente o por operación específica).

**Características implementadas**:
- **Loading global**: Para operaciones que afectan toda la aplicación
- **Loading local**: Mediante claves únicas para operaciones específicas
- **Contador de referencias**: Permite múltiples operaciones concurrentes
- **Mensaje personalizado**: Cada estado de carga puede tener su mensaje
- **Wrappers async**: Funciones helper para envolver promesas automáticamente

**Implementación**:

```typescript
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private globalLoadingCount = signal<number>(0);
  private globalMessage = signal<string | undefined>(undefined);
  private localLoadingMap = signal<Map<string, LoadingState>>(new Map());

  readonly isGlobalLoading = computed(() => this.globalLoadingCount() > 0);
  readonly globalLoadingMessage = this.globalMessage.asReadonly();

  // Loading global
  startGlobalLoading(message?: string): void {
    this.globalLoadingCount.update(count => count + 1);
    if (message) this.globalMessage.set(message);
  }

  stopGlobalLoading(): void {
    this.globalLoadingCount.update(count => Math.max(0, count - 1));
    if (this.globalLoadingCount() === 0) {
      this.globalMessage.set(undefined);
    }
  }

  // Loading local
  startLocalLoading(key: string, message?: string): void {
    this.localLoadingMap.update(map => {
      const newMap = new Map(map);
      const current = newMap.get(key);
      newMap.set(key, {
        isLoading: true,
        count: (current?.count ?? 0) + 1,
        message
      });
      return newMap;
    });
  }

  // Wrapper para operaciones async
  async withGlobalLoading<T>(operation: () => Promise<T>, message?: string): Promise<T> {
    this.startGlobalLoading(message);
    try {
      return await operation();
    } finally {
      this.stopGlobalLoading();
    }
  }
}
```

**Uso del servicio**:

```typescript
// Loading global automático con wrapper
async loadData(): Promise<void> {
  const data = await this.loadingService.withGlobalLoading(
    () => this.apiService.fetchData(),
    'Cargando datos...'
  );
}

// Loading local para un botón específico
async submitForm(): Promise<void> {
  await this.loadingService.withLocalLoading(
    'submit-button',
    () => this.apiService.submit(this.formData),
    'Guardando...'
  );
}
```

### SpinnerComponent

**Ubicación**: `src/app/components/atoms/spinner/`

He creado un componente de spinner reutilizable que puede funcionar en modo global o local.

**Características**:
- **Modo global**: Se sincroniza automáticamente con LoadingService
- **Modo local**: Control mediante clave de loading o manualmente
- **Overlay opcional**: Bloquea la interacción con el contenido subyacente
- **Tamaños**: small, medium, large
- **Mensaje personalizable**
- **Accesible**: Incluye `role="status"` y `aria-live`

**Template del componente**:

```typescript
@Component({
  selector: 'app-spinner',
  template: `
    @if (shouldShow()) {
      <div 
        class="spinner-wrapper"
        [class.spinner-wrapper--overlay]="overlay"
        [class.spinner-wrapper--fullscreen]="fullscreen"
        role="status"
        aria-live="polite">
        
        <div class="spinner" [class]="'spinner--' + size">
          <svg class="spinner__svg" viewBox="0 0 50 50">
            <circle class="spinner__track" cx="25" cy="25" r="20" fill="none" stroke-width="4"/>
            <circle class="spinner__circle" cx="25" cy="25" r="20" fill="none" stroke-width="4"/>
          </svg>
          
          @if (displayMessage()) {
            <span class="spinner__message">{{ displayMessage() }}</span>
          }
        </div>
      </div>
    }
  `
})
export class SpinnerComponent {
  @Input() mode: 'global' | 'local' = 'local';
  @Input() loadingKey?: string;
  @Input() show: boolean = false;
  @Input() overlay: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  shouldShow = computed(() => {
    if (this.mode === 'global') {
      return this.loadingService.isGlobalLoading();
    }
    if (this.loadingKey) {
      return this.loadingService.isLocalLoading(this.loadingKey);
    }
    return this.show;
  });
}
```

**ButtonSpinnerComponent**: También he creado un spinner pequeño para usar dentro de botones durante operaciones de carga.

---

## Bus de Eventos

### EventBusService

**Ubicación**: `src/app/services/event-bus.service.ts`

He implementado un bus de eventos para permitir comunicación desacoplada entre componentes hermanos o cualquier parte de la aplicación sin necesidad de crear dependencias directas.

**Patrón Publish/Subscribe**:

```typescript
@Injectable({ providedIn: 'root' })
export class EventBusService {
  private eventSubject = new Subject<EventBusMessage>();

  // Emitir un evento
  emit<T>(type: string, payload?: T, source?: string): void {
    const message: EventBusMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
      source
    };
    this.eventSubject.next(message);
  }

  // Escuchar eventos de un tipo específico
  on<T>(eventType: string): Observable<EventBusMessage<T>> {
    return this.eventSubject.asObservable().pipe(
      filter(event => event.type === eventType),
      map(event => event as EventBusMessage<T>)
    );
  }

  // Escuchar eventos por prefijo
  onPrefix<T>(prefix: string): Observable<EventBusMessage<T>> {
    return this.eventSubject.asObservable().pipe(
      filter(event => event.type.startsWith(prefix))
    );
  }
}
```

**Eventos del Sistema Predefinidos**:

```typescript
export enum SystemEvents {
  USER_LOGIN = 'auth:user_login',
  USER_LOGOUT = 'auth:user_logout',
  SESSION_EXPIRED = 'auth:session_expired',
  ROUTE_CHANGE = 'nav:route_change',
  MENU_TOGGLE = 'nav:menu_toggle',
  DATA_REFRESH = 'data:refresh',
  DATA_UPDATED = 'data:updated',
  MODAL_OPEN = 'ui:modal_open',
  MODAL_CLOSE = 'ui:modal_close',
  FORM_SUBMITTED = 'form:submitted'
}
```

**Uso del EventBus**:

```typescript
// Componente emisor
this.eventBus.emit('user:selected', { userId: 123 });

// Componente receptor
this.eventBus.on<{ userId: number }>('user:selected')
  .pipe(takeUntil(this.destroy$))
  .subscribe(event => {
    console.log('Usuario seleccionado:', event.payload.userId);
  });

// Escuchar todos los eventos de autenticación
this.eventBus.onPrefix('auth:')
  .pipe(takeUntil(this.destroy$))
  .subscribe(event => {
    console.log('Evento de auth:', event.type);
  });
```

---

## Servicio de Estado Global

### StateService

**Ubicación**: `src/app/services/state.service.ts`

He implementado un store centralizado para gestionar el estado compartido de la aplicación, utilizando Angular Signals para reactividad y BehaviorSubject para compatibilidad con RxJS.

**Estructura del Estado**:

```typescript
export interface AppState {
  user: UserState | null;
  ui: UIState;
  data: DataState;
  preferences: PreferencesState;
}

export interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeModal: string | null;
  breadcrumbs: BreadcrumbItem[];
  pageTitle: string;
}

export interface PreferencesState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  itemsPerPage: number;
  notifications: boolean;
}
```

**Selectores con Signals**:

```typescript
@Injectable({ providedIn: 'root' })
export class StateService {
  private _state = signal<AppState>(initialState);

  // Selectores computados
  readonly state = this._state.asReadonly();
  readonly user = computed(() => this._state().user);
  readonly isAuthenticated = computed(() => this._state().user?.isAuthenticated ?? false);
  readonly sidebarOpen = computed(() => this._state().ui.sidebarOpen);
  readonly theme = computed(() => this._state().preferences.theme);

  // Actualización del estado
  setState(partialState: Partial<AppState>): void {
    const newState = this.deepMerge(this._state(), partialState);
    this._state.set(newState);
  }

  // Selección con Observable
  select<R>(selector: (state: AppState) => R): Observable<R> {
    return this.state$.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }
}
```

**Métodos de UI**:

```typescript
toggleSidebar(): void {
  this.setState({
    ui: { ...this._state().ui, sidebarOpen: !this._state().ui.sidebarOpen }
  });
}

setActiveModal(modalId: string | null): void {
  this.setState({
    ui: { ...this._state().ui, activeModal: modalId }
  });
}

setBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
  this.setState({
    ui: { ...this._state().ui, breadcrumbs }
  });
}
```

**Sistema de Caché**:

```typescript
// Guardar datos en caché con timestamp
setCacheData<T>(key: string, data: T): void {
  this.setState({
    data: {
      cache: { ...this._state().data.cache, [key]: data },
      lastUpdated: { ...this._state().data.lastUpdated, [key]: Date.now() }
    }
  });
}

// Verificar si el caché está fresco
isCacheFresh(key: string, maxAge: number): boolean {
  const lastUpdated = this._state().data.lastUpdated[key];
  return lastUpdated ? Date.now() - lastUpdated < maxAge : false;
}
```

**Persistencia en localStorage**:

```typescript
enablePersistence(): void {
  this.persistenceEnabled = true;
}

private saveToStorage(state: AppState): void {
  const toPersist = {
    preferences: state.preferences,
    ui: { sidebarCollapsed: state.ui.sidebarCollapsed }
  };
  localStorage.setItem(this.storageKey, JSON.stringify(toPersist));
}
```

---

## Patrones de Comunicación

### Resumen de Patrones Implementados

| Patrón | Servicio | Caso de Uso |
|--------|----------|-------------|
| **Subject** | NotificationService | Emisión de notificaciones one-way |
| **BehaviorSubject** | StateService, LoadingService | Estado que necesita valor inicial |
| **Signal** | Todos | Estado reactivo local con change detection eficiente |
| **Computed** | Todos | Valores derivados del estado |
| **EventBus** | EventBusService | Comunicación desacoplada entre componentes hermanos |

### Comunicación Padre-Hijo

Utilizo `@Input()` y `@Output()` de Angular para comunicación directa:

```typescript
// Componente hijo
@Input() data: string;
@Output() dataChange = new EventEmitter<string>();

// Componente padre
<app-child [data]="parentData" (dataChange)="onDataChange($event)"></app-child>
```

### Comunicación Entre Hermanos

Utilizo el EventBusService:

```typescript
// Hermano A emite
this.eventBus.emit('item:selected', { id: 1 });

// Hermano B escucha
this.eventBus.on('item:selected').subscribe(event => {
  this.selectedItem = event.payload;
});
```

### Estado Global Compartido

Utilizo el StateService:

```typescript
// Componente A actualiza
this.stateService.setUser({ name: 'John', isAuthenticated: true });

// Componente B reacciona
readonly user = this.stateService.user; // Signal computed
```

---

## Diagrama de Arquitectura de Servicios

```
┌─────────────────────────────────────────────────────────────────────┐
│                        COMPONENTES DE UI                             │
├──────────────┬──────────────┬──────────────┬───────────────────────┤
│   Header     │   Sidebar    │   Content    │   Toast Container      │
│              │              │              │                         │
└──────┬───────┴──────┬───────┴──────┬───────┴───────────┬────────────┘
       │              │              │                   │
       │   @Input/@Output (Padre-Hijo)                   │
       │              │              │                   │
       ▼              ▼              ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CAPA DE SERVICIOS                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐                       │
│  │   StateService   │◄───│  EventBusService │                       │
│  │                  │    │                  │                       │
│  │ • Estado global  │    │ • Pub/Sub        │                       │
│  │ • Signals        │    │ • Desacoplado    │                       │
│  │ • Persistencia   │    │ • Tipado         │                       │
│  └────────┬─────────┘    └──────────────────┘                       │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────┐    ┌──────────────────┐                       │
│  │ NotificationSvc  │    │  LoadingService  │                       │
│  │                  │    │                  │                       │
│  │ • Toasts         │    │ • Global loading │                       │
│  │ • Subject        │    │ • Local loading  │                       │
│  │ • Auto-dismiss   │    │ • Async wrappers │                       │
│  └──────────────────┘    └──────────────────┘                       │
│                                                                      │
│  ┌──────────────────┐                                               │
│  │  ThemeService    │                                               │
│  │                  │                                               │
│  │ • Light/Dark     │                                               │
│  │ • Persistencia   │                                               │
│  │ • System detect  │                                               │
│  └──────────────────┘                                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         PERSISTENCIA                                 │
├─────────────────────────────────────────────────────────────────────┤
│                        localStorage                                  │
│   • Tema preferido                                                   │
│   • Preferencias de usuario                                          │
│   • Estado del sidebar                                               │
└─────────────────────────────────────────────────────────────────────┘
```

### Flujo de Notificación

```
Acción del Usuario
       │
       ▼
Componente llama notificationService.success()
       │
       ▼
NotificationService crea notificación con ID único
       │
       ▼
Subject.next() emite la notificación
       │
       ▼
ToastContainerComponent recibe vía subscription
       │
       ▼
Toast se renderiza con animación
       │
       │──── setTimeout ────▶ Auto-dismiss después de X segundos
       │
       ▼
Usuario puede cerrar manualmente
       │
       ▼
Animación de salida
       │
       ▼
notificationService.dismiss() elimina del array
```

### Flujo de Loading

```
Operación Async Iniciada
       │
       ▼
loadingService.startGlobalLoading('Cargando...')
       │
       ▼
globalLoadingCount signal incrementa
       │
       ▼
isGlobalLoading computed retorna true
       │
       ▼
SpinnerComponent (mode="global") detecta cambio
       │
       ▼
Spinner fullscreen se muestra con overlay
       │
       │
       │──── Operación completa ────▶ stopGlobalLoading()
       │
       ▼
globalLoadingCount decrementa
       │
       ▼
Si count === 0, isGlobalLoading = false
       │
       ▼
Spinner se oculta
```

---

## Conclusiones Fase 2

En esta fase he implementado una arquitectura de servicios completa que incluye:

1. **NotificationService**: Sistema de toasts con Subject para emisión de notificaciones, soporte para múltiples tipos, auto-dismiss y un componente visual con animaciones.

2. **LoadingService**: Gestión de estados de carga tanto globales como locales, con contadores de referencia para operaciones concurrentes y wrappers async para simplificar el uso.

3. **SpinnerComponent**: Componente reutilizable que se integra automáticamente con LoadingService en modo global, o puede controlarse manualmente para casos específicos.

4. **EventBusService**: Implementación del patrón Publish/Subscribe para comunicación desacoplada entre componentes hermanos, con tipado genérico y eventos del sistema predefinidos.

5. **StateService**: Store centralizado con Angular Signals y BehaviorSubject para compatibilidad, incluyendo persistencia en localStorage, sistema de caché con timestamps, y selectores eficientes.

La arquitectura implementada sigue el principio de separación de responsabilidades:
- **Componentes**: Solo presentación y delegación a servicios
- **Servicios**: Lógica de negocio, estado y comunicación
- **Signals/Observables**: Reactividad eficiente

Todos los servicios están correctamente tipados con TypeScript, documentados y exportados mediante barrel exports para facilitar su importación.

