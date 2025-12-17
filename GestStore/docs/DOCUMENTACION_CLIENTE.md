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

---

# Fase 3: Formularios Reactivos y Validación Avanzada

## Índice Fase 3

17. [Introducción a Formularios Reactivos](#introduccion-a-formularios-reactivos)
18. [Arquitectura de Validadores](#arquitectura-de-validadores)
19. [Validadores Síncronos Personalizados](#validadores-sincronos-personalizados)
20. [Validadores Asíncronos con Debounce](#validadores-asincronos-con-debounce)
21. [Formulario de Login Reactivo](#formulario-de-login-reactivo)
22. [Formulario de Registro Completo](#formulario-de-registro-completo)
23. [Formulario de Perfil con FormArray](#formulario-de-perfil-con-formarray)
24. [Feedback Visual de Validación](#feedback-visual-de-validacion)
25. [Demostración en Style Guide](#demostracion-en-style-guide)
26. [Conclusiones Fase 3](#conclusiones-fase-3)

---

## Introducción a Formularios Reactivos

En esta fase he implementado un sistema completo de formularios reactivos utilizando **ReactiveFormsModule** de Angular. He convertido los formularios existentes de template-driven a reactive forms y he creado una biblioteca exhaustiva de validadores personalizados tanto síncronos como asíncronos.

### Ventajas de los Formularios Reactivos

Los formularios reactivos proporcionan:

1. **Control total**: Toda la lógica de validación está en TypeScript, no en el template
2. **Testabilidad**: Es más fácil escribir tests unitarios para la lógica de formularios
3. **Composición**: Los validadores se pueden combinar y reutilizar fácilmente
4. **Validación asíncrona**: Soporte nativo para validadores que consultan APIs
5. **Gestión dinámica**: FormArray permite añadir/eliminar campos dinámicamente

### Estructura de Archivos

```
src/app/
├── validators/
│   ├── index.ts                    # Barrel exports
│   ├── sync-validators.ts          # 15+ validadores síncronos
│   └── async-validators.ts         # Validadores asíncronos + servicio
├── components/shared/
│   ├── login-form/                 # Formulario de login reactivo
│   ├── register-form/              # Formulario de registro completo
│   └── profile-form/               # Formulario con FormArray
└── pages/style-guide/              # Demostración interactiva
```

---

## Arquitectura de Validadores

He organizado los validadores en una estructura modular dentro de `src/app/validators/`:

### Barrel Exports (`index.ts`)

```typescript
// Validadores Síncronos
export {
  strongPasswordValidator,
  passwordMatchValidator,
  nifNieValidator,
  spanishPhoneValidator,
  spanishPostalCodeValidator,
  spanishIbanValidator,
  onlyLettersValidator,
  usernameFormatValidator,
  rangeValidator,
  positiveNumberValidator,
  minDateValidator,
  maxDateValidator,
  adultAgeValidator,
  urlValidator,
  conditionalValidator,
  getErrorMessage,
  getControlErrorMessage
} from './sync-validators';

// Validadores Asíncronos
export {
  ValidationApiService,
  uniqueEmailValidator,
  uniqueUsernameValidator,
  uniqueNifValidator,
  createUniqueEmailValidator,
  createUniqueUsernameValidator,
  createUniqueNifValidator,
  isValidating,
  hasAsyncError
} from './async-validators';
```

---

## Validadores Síncronos Personalizados

He implementado más de 15 validadores síncronos personalizados en `sync-validators.ts`:

### 1. Validador de Contraseña Fuerte (`strongPasswordValidator`)

Este validador verifica múltiples requisitos de seguridad para contraseñas:

```typescript
export const strongPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const errors: ValidationErrors = {};

  if (value.length < 8) errors['minLength'] = true;
  if (value.length > 128) errors['maxLength'] = true;
  if (!/[A-Z]/.test(value)) errors['noUppercase'] = true;
  if (!/[a-z]/.test(value)) errors['noLowercase'] = true;
  if (!/\d/.test(value)) errors['noNumber'] = true;
  if (!/[!@#$%^&*()_+\-=\[\]{}|;':",.<>?\/\\`~]/.test(value)) errors['noSpecial'] = true;

  return Object.keys(errors).length ? { strongPassword: errors } : null;
};
```

**Requisitos verificados:**
- Longitud mínima de 8 caracteres
- Longitud máxima de 128 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número
- Al menos un carácter especial

### 2. Validador de Coincidencia de Contraseñas (`passwordMatchValidator`)

Validador a nivel de grupo que compara dos campos de contraseña:

```typescript
export const passwordMatchValidator = (
  passwordField: string = 'password',
  confirmField: string = 'confirmPassword'
): ValidatorFn => {
  return (group: AbstractControl): ValidationErrors | null => {
    const formGroup = group as FormGroup;
    const password = formGroup.get(passwordField);
    const confirm = formGroup.get(confirmField);

    if (!password || !confirm) return null;
    if (!confirm.value) return null;

    if (password.value !== confirm.value) {
      confirm.setErrors({ ...confirm.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    }

    // Limpiar solo el error de mismatch si las contraseñas coinciden
    if (confirm.errors) {
      const { passwordMismatch, ...otherErrors } = confirm.errors;
      confirm.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
    }

    return null;
  };
};
```

### 3. Validador de NIF/NIE Español (`nifNieValidator`)

Implementa el algoritmo oficial español de validación de documentos de identidad:

```typescript
export const nifNieValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const cleanValue = value.toUpperCase().replace(/[\s\-]/g, '');
  const nifRegex = /^[0-9]{8}[A-Z]$/;
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;

  if (!nifRegex.test(cleanValue) && !nieRegex.test(cleanValue)) {
    return { nifNie: { message: 'Formato de NIF/NIE inválido' } };
  }

  // Calcular letra de control usando módulo 23
  let numberPart: string;
  if (nieRegex.test(cleanValue)) {
    const niePrefix: { [key: string]: string } = { 'X': '0', 'Y': '1', 'Z': '2' };
    numberPart = niePrefix[cleanValue[0]] + cleanValue.slice(1, 8);
  } else {
    numberPart = cleanValue.slice(0, 8);
  }

  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const expectedLetter = letters[parseInt(numberPart, 10) % 23];

  if (cleanValue.slice(-1) !== expectedLetter) {
    return { nifNie: { message: 'Letra de control incorrecta' } };
  }

  return null;
};
```

**Características:**
- Soporta tanto NIF (DNI con letra) como NIE (documento de extranjero)
- Valida el formato con expresiones regulares
- Calcula y verifica la letra de control mediante el algoritmo oficial (módulo 23)

### 4. Validador de Teléfono Español (`spanishPhoneValidator`)

Valida múltiples formatos de teléfono español:

```typescript
export const spanishPhoneValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const cleanValue = value.replace(/[\s\-\(\)\.]/g, '');

    // Patrones válidos para teléfonos españoles
    const patterns = [
      /^[6-7][0-9]{8}$/,              // Móvil nacional (6xx o 7xx)
      /^[89][0-9]{8}$/,               // Fijo nacional (8xx o 9xx)
      /^\+34[6-9][0-9]{8}$/,          // Con prefijo internacional +34
      /^0034[6-9][0-9]{8}$/           // Con prefijo alternativo 0034
    ];

    const isValid = patterns.some(pattern => pattern.test(cleanValue));

    return isValid ? null : { 
      spanishPhone: { message: 'Número de teléfono español inválido' } 
    };
  };
};
```

### 5. Validador de Código Postal Español (`spanishPostalCodeValidator`)

Valida códigos postales españoles incluyendo verificación de provincia:

```typescript
export const spanishPostalCodeValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const cleanValue = value.replace(/\s/g, '');
    
    // Debe tener 5 dígitos
    if (!/^[0-9]{5}$/.test(cleanValue)) {
      return { spanishPostalCode: { message: 'El código postal debe tener 5 dígitos' } };
    }

    // Verificar código de provincia (01-52)
    const province = parseInt(cleanValue.slice(0, 2), 10);
    const validProvinces = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
      39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52
    ];

    if (!validProvinces.includes(province)) {
      return { spanishPostalCode: { message: 'Código de provincia inválido' } };
    }

    return null;
  };
};
```

### 6. Validador de Solo Letras (`onlyLettersValidator`)

Permite solo caracteres alfabéticos incluyendo caracteres españoles:

```typescript
export const onlyLettersValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  // Permite letras latinas, espacios, apóstrofes y guiones
  const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'\-]+$/;

  return pattern.test(value) ? null : { 
    onlyLetters: { message: 'Solo se permiten letras' } 
  };
};
```

### 7. Validador de Formato de Username (`usernameFormatValidator`)

Valida múltiples reglas para nombres de usuario:

```typescript
export const usernameFormatValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const errors: ValidationErrors = {};

  if (value.length < 3) errors['tooShort'] = true;
  if (value.length > 20) errors['tooLong'] = true;
  if (!/^[a-zA-Z]/.test(value)) errors['mustStartWithLetter'] = true;
  if (!/^[a-zA-Z0-9_]+$/.test(value)) errors['invalidCharacters'] = true;
  if (/_{2,}/.test(value)) errors['consecutiveUnderscores'] = true;
  if (/_$/.test(value)) errors['endsWithUnderscore'] = true;

  return Object.keys(errors).length ? { usernameFormat: errors } : null;
};
```

**Reglas implementadas:**
- Mínimo 3 caracteres, máximo 20
- Debe comenzar con una letra
- Solo permite letras, números y guiones bajos
- No permite guiones bajos consecutivos
- No puede terminar con guión bajo

### 8. Validador de Rango Numérico (`rangeValidator`)

Valida que un valor numérico esté dentro de un rango:

```typescript
export const rangeValidator = (min: number, max: number): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') return null;

    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return { range: { message: 'Debe ser un número válido' } };
    }
    if (numValue < min) {
      return { range: { message: `El valor mínimo es ${min}`, min, actual: numValue } };
    }
    if (numValue > max) {
      return { range: { message: `El valor máximo es ${max}`, max, actual: numValue } };
    }

    return null;
  };
};
```

### 9. Validador de Mayoría de Edad (`adultAgeValidator`)

Verifica que una fecha de nacimiento corresponda a una persona mayor de edad:

```typescript
export const adultAgeValidator = (minAge: number = 18): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const birthDate = new Date(value);
    if (isNaN(birthDate.getTime())) {
      return { adultAge: { message: 'Fecha inválida' } };
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Ajustar si aún no ha cumplido años este año
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= minAge ? null : { 
      adultAge: { 
        message: `Debes tener al menos ${minAge} años`, 
        requiredAge: minAge, 
        currentAge: age 
      } 
    };
  };
};
```

### 10. Validador de IBAN Español (`spanishIbanValidator`)

Implementa el algoritmo oficial de validación IBAN con módulo 97:

```typescript
export const spanishIbanValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const cleanValue = value.replace(/[\s\-]/g, '').toUpperCase();

  // IBAN español: ES + 22 dígitos
  if (!/^ES[0-9]{22}$/.test(cleanValue)) {
    return { spanishIban: { message: 'El IBAN español debe empezar con ES seguido de 22 dígitos' } };
  }

  // Algoritmo de validación IBAN (módulo 97)
  const rearranged = cleanValue.slice(4) + cleanValue.slice(0, 4);
  let numericIban = '';
  
  for (const char of rearranged) {
    if (char >= 'A' && char <= 'Z') {
      numericIban += (char.charCodeAt(0) - 55).toString();
    } else {
      numericIban += char;
    }
  }

  // Calcular módulo 97 por bloques
  let remainder = 0;
  for (let i = 0; i < numericIban.length; i += 7) {
    const block = remainder.toString() + numericIban.slice(i, i + 7);
    remainder = parseInt(block, 10) % 97;
  }

  return remainder === 1 ? null : { spanishIban: { message: 'IBAN inválido' } };
};
```

### 11. Validador de URL (`urlValidator`)

Valida URLs con protocolo http o https:

```typescript
export const urlValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  try {
    const url = new URL(value);
    const validProtocols = ['http:', 'https:'];
    
    if (!validProtocols.includes(url.protocol)) {
      return { url: { message: 'La URL debe usar http o https' } };
    }
    return null;
  } catch {
    return { url: { message: 'URL inválida' } };
  }
};
```

### Función de Mensajes de Error (`getErrorMessage`)

He creado una función centralizada para obtener mensajes de error legibles:

```typescript
export function getErrorMessage(errors: ValidationErrors | null): string {
  if (!errors) return '';

  // Errores de Angular
  if (errors['required']) return 'Este campo es requerido';
  if (errors['email']) return 'Email inválido';
  if (errors['minlength']) {
    return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
  }
  if (errors['maxlength']) {
    return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
  }

  // Errores personalizados
  if (errors['strongPassword']) {
    const e = errors['strongPassword'];
    if (e.minLength) return 'La contraseña debe tener al menos 8 caracteres';
    if (e.noUppercase) return 'Debe incluir al menos una mayúscula';
    if (e.noLowercase) return 'Debe incluir al menos una minúscula';
    if (e.noNumber) return 'Debe incluir al menos un número';
    if (e.noSpecial) return 'Debe incluir al menos un carácter especial';
  }

  if (errors['passwordMismatch']) return 'Las contraseñas no coinciden';
  if (errors['nifNie']) return errors['nifNie'].message;
  if (errors['spanishPhone']) return errors['spanishPhone'].message;
  if (errors['spanishPostalCode']) return errors['spanishPostalCode'].message;
  if (errors['emailTaken']) return errors['emailTaken'].message;
  if (errors['usernameTaken']) return errors['usernameTaken'].message;

  return 'Campo inválido';
}
```

---

## Validadores Asíncronos con Debounce

He implementado validadores asíncronos que simulan llamadas a una API para verificar la unicidad de datos.

### Servicio de Validación API (`ValidationApiService`)

```typescript
@Injectable({
  providedIn: 'root'
})
export class ValidationApiService {
  // Simula datos existentes en la base de datos
  private existingEmails = [
    'admin@geststore.com', 
    'user@example.com', 
    'test@test.com'
  ];
  private existingUsernames = ['admin', 'user', 'test', 'moderator'];
  private existingNifs = ['12345678Z', '87654321X', 'X1234567L'];

  checkEmailExists(email: string): Observable<boolean> {
    return of(this.existingEmails.includes(email.toLowerCase())).pipe(
      delay(500) // Simular latencia de red
    );
  }

  checkUsernameExists(username: string): Observable<boolean> {
    return of(this.existingUsernames.includes(username.toLowerCase())).pipe(
      delay(500)
    );
  }

  checkNifExists(nif: string): Observable<boolean> {
    const cleanNif = nif.toUpperCase().replace(/[\s\-]/g, '');
    return of(this.existingNifs.includes(cleanNif)).pipe(
      delay(500)
    );
  }
}
```

### Validador de Email Único (`uniqueEmailValidator`)

```typescript
export const uniqueEmailValidator = (
  validationService: ValidationApiService,
  debounceMs: number = 500
): AsyncValidatorFn => {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return timer(debounceMs).pipe(
      switchMap(() => validationService.checkEmailExists(control.value)),
      map(exists => exists ? { 
        emailTaken: { message: 'Este email ya está registrado' } 
      } : null),
      catchError(() => of(null))
    );
  };
};
```

### Validador de Username Único (`uniqueUsernameValidator`)

```typescript
export const uniqueUsernameValidator = (
  validationService: ValidationApiService,
  debounceMs: number = 500
): AsyncValidatorFn => {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return timer(debounceMs).pipe(
      switchMap(() => validationService.checkUsernameExists(control.value)),
      map(exists => exists ? { 
        usernameTaken: { message: 'Este nombre de usuario ya está en uso' } 
      } : null),
      catchError(() => of(null))
    );
  };
};
```

### Factory Functions para Inyección de Dependencias

Para facilitar el uso con la inyección de dependencias de Angular:

```typescript
export function createUniqueEmailValidator(
  validationService: ValidationApiService,
  debounceMs: number = 500
): AsyncValidatorFn {
  return uniqueEmailValidator(validationService, debounceMs);
}

export function createUniqueUsernameValidator(
  validationService: ValidationApiService,
  debounceMs: number = 500
): AsyncValidatorFn {
  return uniqueUsernameValidator(validationService, debounceMs);
}
```

### Utilidades para Estado de Validación Asíncrona

```typescript
export function isValidating(control: AbstractControl): boolean {
  return control.pending;
}

export function hasAsyncError(control: AbstractControl, errorKey: string): boolean {
  return control.hasError(errorKey) && !control.pending;
}
```

---

## Formulario de Login Reactivo

He convertido el formulario de login de template-driven a reactive forms:

### Componente (`login-form.component.ts`)

```typescript
@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  
  loginForm!: FormGroup;
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal(false);
  showPassword = signal(false);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(255)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128)
      ]],
      rememberMe: [false]
    });
  }

  // Getters para acceso fácil a los controles
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  // Helpers de validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.valid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors) return '';
    
    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['email']) return 'Email inválido';
    if (field.errors['minlength']) {
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    
    return 'Campo inválido';
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Login data:', this.loginForm.value);
      this.submitSuccess.set(true);
    } catch (error) {
      this.submitError.set('Error al iniciar sesión');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }
}
```

### Template con Validación Visual

```html
<form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
  <!-- Campo Email -->
  <div class="form-group" 
       [class.form-group--error]="isFieldInvalid('email')"
       [class.form-group--valid]="isFieldValid('email')">
    <label for="email" class="form-label">
      Email <span class="required">*</span>
    </label>
    <div class="input-wrapper">
      <input
        type="email"
        id="email"
        formControlName="email"
        class="form-input"
        placeholder="tu@email.com"
        autocomplete="email"
      />
      @if (isFieldValid('email')) {
        <span class="input-icon input-icon--valid">✓</span>
      }
      @if (isFieldInvalid('email')) {
        <span class="input-icon input-icon--invalid">✗</span>
      }
    </div>
    @if (isFieldInvalid('email')) {
      <span class="error-message">{{ getFieldError('email') }}</span>
    }
  </div>

  <!-- Campo Password -->
  <div class="form-group" 
       [class.form-group--error]="isFieldInvalid('password')"
       [class.form-group--valid]="isFieldValid('password')">
    <label for="password" class="form-label">
      Contraseña <span class="required">*</span>
    </label>
    <div class="input-wrapper">
      <input
        [type]="showPassword() ? 'text' : 'password'"
        id="password"
        formControlName="password"
        class="form-input"
        autocomplete="current-password"
      />
      <button type="button" class="password-toggle" (click)="togglePasswordVisibility()">
        {{ showPassword() ? '🙈' : '👁️' }}
      </button>
    </div>
    @if (isFieldInvalid('password')) {
      <span class="error-message">{{ getFieldError('password') }}</span>
    }
  </div>

  <!-- Remember Me -->
  <div class="form-group form-group--checkbox">
    <label class="checkbox-label">
      <input type="checkbox" formControlName="rememberMe" />
      <span>Recordarme</span>
    </label>
  </div>

  <!-- Submit Button -->
  <button 
    type="submit" 
    class="submit-button"
    [disabled]="loginForm.invalid || isSubmitting()">
    @if (isSubmitting()) {
      <span class="spinner"></span>
      Iniciando sesión...
    } @else {
      Iniciar Sesión
    }
  </button>

  <!-- Mensajes de estado -->
  @if (submitError()) {
    <div class="alert alert--error">{{ submitError() }}</div>
  }
  @if (submitSuccess()) {
    <div class="alert alert--success">¡Inicio de sesión exitoso!</div>
  }
</form>
```

---

## Formulario de Registro Completo

El formulario de registro implementa validación exhaustiva con todos los tipos de validadores:

### Componente (`register-form.component.ts`)

```typescript
@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss'
})
export class RegisterFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private validationService = inject(ValidationApiService);

  registerForm!: FormGroup;
  isSubmitting = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      // Datos personales con validador de solo letras
      nombre: ['', [
        Validators.required, 
        onlyLettersValidator, 
        Validators.minLength(2)
      ]],
      apellidos: ['', [
        Validators.required, 
        onlyLettersValidator, 
        Validators.minLength(2)
      ]],
      
      // Username con validadores síncronos y asíncronos
      username: ['', 
        [Validators.required, usernameFormatValidator],
        [createUniqueUsernameValidator(this.validationService)]
      ],
      
      // Email con validador asíncrono
      email: ['', 
        [Validators.required, Validators.email],
        [createUniqueEmailValidator(this.validationService)]
      ],
      
      // Contraseña con validador de fuerza
      password: ['', [Validators.required, strongPasswordValidator]],
      confirmPassword: ['', [Validators.required]],
      
      // Términos
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      // Validador a nivel de grupo para comparar contraseñas
      validators: [passwordMatchValidator('password', 'confirmPassword')]
    });
  }

  // Getters
  get nombre() { return this.registerForm.get('nombre'); }
  get apellidos() { return this.registerForm.get('apellidos'); }
  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  // Indicador de fuerza de contraseña
  getPasswordStrength(): { level: string; percentage: number; color: string } {
    const password = this.password?.value || '';
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    
    const levels = ['muy-debil', 'debil', 'media', 'fuerte', 'muy-fuerte'];
    const colors = ['#dc3545', '#fd7e14', '#ffc107', '#20c997', '#28a745'];
    const percentage = (strength / 6) * 100;
    
    return {
      level: levels[Math.min(strength, 4)],
      percentage,
      color: colors[Math.min(strength, 4)]
    };
  }

  // Helpers para requisitos de contraseña
  hasMinLength(): boolean { return (this.password?.value?.length || 0) >= 8; }
  hasUppercase(): boolean { return /[A-Z]/.test(this.password?.value || ''); }
  hasLowercase(): boolean { return /[a-z]/.test(this.password?.value || ''); }
  hasNumber(): boolean { return /\d/.test(this.password?.value || ''); }
  hasSpecialChar(): boolean { return /[!@#$%^&*]/.test(this.password?.value || ''); }
}
```

### Template con Indicador de Fuerza

```html
<!-- Campo Password con indicador de fuerza -->
<div class="form-group">
  <label for="password" class="form-label">Contraseña *</label>
  <div class="input-wrapper">
    <input
      [type]="showPassword() ? 'text' : 'password'"
      id="password"
      formControlName="password"
      class="form-input"
    />
    <button type="button" (click)="togglePassword('password')">
      {{ showPassword() ? '🙈' : '👁️' }}
    </button>
  </div>
  
  <!-- Barra de fuerza visual -->
  @if (password?.value) {
    <div class="password-strength">
      <div class="strength-bar">
        <div 
          class="strength-fill"
          [style.width.%]="getPasswordStrength().percentage"
          [style.backgroundColor]="getPasswordStrength().color">
        </div>
      </div>
      <span class="strength-text">
        Fuerza: {{ getPasswordStrength().level | titlecase }}
      </span>
    </div>
  }
  
  <!-- Checklist de requisitos -->
  <ul class="password-requirements">
    <li [class.met]="hasMinLength()">
      <span class="icon">{{ hasMinLength() ? '✓' : '○' }}</span>
      Mínimo 8 caracteres
    </li>
    <li [class.met]="hasUppercase()">
      <span class="icon">{{ hasUppercase() ? '✓' : '○' }}</span>
      Una letra mayúscula
    </li>
    <li [class.met]="hasLowercase()">
      <span class="icon">{{ hasLowercase() ? '✓' : '○' }}</span>
      Una letra minúscula
    </li>
    <li [class.met]="hasNumber()">
      <span class="icon">{{ hasNumber() ? '✓' : '○' }}</span>
      Un número
    </li>
    <li [class.met]="hasSpecialChar()">
      <span class="icon">{{ hasSpecialChar() ? '✓' : '○' }}</span>
      Un carácter especial (!@#$%^&*)
    </li>
  </ul>
</div>

<!-- Campo con validación asíncrona -->
<div class="form-group">
  <label for="email">Email *</label>
  <div class="input-wrapper">
    <input type="email" formControlName="email" />
    @if (email?.pending) {
      <span class="spinner-small" title="Verificando disponibilidad..."></span>
    }
    @if (email?.valid && !email?.pending) {
      <span class="icon-valid">✓</span>
    }
    @if (email?.invalid && !email?.pending && email?.touched) {
      <span class="icon-invalid">✗</span>
    }
  </div>
  @if (email?.errors?.['emailTaken'] && !email?.pending) {
    <span class="error-message">Este email ya está registrado</span>
  }
</div>
```

---

## Formulario de Perfil con FormArray

He creado un formulario de perfil que utiliza **FormArray** para gestionar múltiples direcciones de envío dinámicamente:

### Componente (`profile-form.component.ts`)

```typescript
@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-form.component.html',
  styleUrl: './profile-form.component.scss'
})
export class ProfileFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  profileForm!: FormGroup;
  isSubmitting = signal(false);

  // Lista de provincias españolas para el select
  provincias = [
    { codigo: '01', nombre: 'Álava' },
    { codigo: '02', nombre: 'Albacete' },
    { codigo: '03', nombre: 'Alicante' },
    // ... todas las provincias
    { codigo: '52', nombre: 'Melilla' }
  ];

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      // Información personal
      personalInfo: this.fb.group({
        nombre: ['', [Validators.required, onlyLettersValidator]],
        apellidos: ['', [Validators.required, onlyLettersValidator]],
        email: ['', [Validators.required, Validators.email]],
        telefono: ['', [spanishPhoneValidator()]],
        fechaNacimiento: ['', [adultAgeValidator(18)]],
        nif: ['', [nifNieValidator()]]
      }),

      // FormArray de direcciones
      direcciones: this.fb.array([
        this.createAddressGroup() // Iniciar con una dirección
      ])
    });
  }

  // Getter para acceder al FormArray
  get direcciones(): FormArray {
    return this.profileForm.get('direcciones') as FormArray;
  }

  // Crea un FormGroup para una dirección
  createAddressGroup(): FormGroup {
    return this.fb.group({
      alias: ['', [Validators.required, Validators.maxLength(50)]],
      calle: ['', [Validators.required, Validators.minLength(5)]],
      numero: ['', [Validators.required]],
      piso: [''],
      puerta: [''],
      codigoPostal: ['', [Validators.required, spanishPostalCodeValidator()]],
      ciudad: ['', [Validators.required, onlyLettersValidator]],
      provincia: ['', [Validators.required]],
      esPrincipal: [false]
    });
  }

  // Añadir nueva dirección (máximo 5)
  addAddress(): void {
    if (this.direcciones.length < 5) {
      this.direcciones.push(this.createAddressGroup());
    }
  }

  // Eliminar dirección (mínimo 1)
  removeAddress(index: number): void {
    if (this.direcciones.length > 1) {
      const wasMain = this.direcciones.at(index).get('esPrincipal')?.value;
      this.direcciones.removeAt(index);
      
      // Si se eliminó la principal, asignar la primera como principal
      if (wasMain && this.direcciones.length > 0) {
        this.direcciones.at(0).get('esPrincipal')?.setValue(true);
      }
    }
  }

  // Establecer una dirección como principal
  setMainAddress(index: number): void {
    this.direcciones.controls.forEach((group, i) => {
      group.get('esPrincipal')?.setValue(i === index);
    });
  }

  // Verificar si un campo de dirección tiene error
  isAddressFieldInvalid(index: number, fieldName: string): boolean {
    const field = this.direcciones.at(index).get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Obtener mensaje de error de un campo de dirección
  getAddressFieldError(index: number, fieldName: string): string {
    const field = this.direcciones.at(index).get(fieldName);
    if (field && field.errors) {
      return getErrorMessage(field.errors);
    }
    return '';
  }
}
```

### Template con FormArray Dinámico

```html
<form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
  
  <!-- Información Personal (FormGroup anidado) -->
  <section formGroupName="personalInfo" class="form-section">
    <h2 class="section-title">Información Personal</h2>
    
    <div class="form-row">
      <div class="form-group">
        <label>Nombre *</label>
        <input formControlName="nombre" />
      </div>
      <div class="form-group">
        <label>Apellidos *</label>
        <input formControlName="apellidos" />
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>Teléfono</label>
        <input formControlName="telefono" placeholder="+34 612 345 678" />
      </div>
      <div class="form-group">
        <label>Fecha de Nacimiento</label>
        <input type="date" formControlName="fechaNacimiento" />
      </div>
    </div>
    
    <div class="form-group">
      <label>NIF/NIE</label>
      <input formControlName="nif" placeholder="12345678Z" />
    </div>
  </section>

  <!-- Direcciones (FormArray) -->
  <section class="form-section">
    <div class="section-header">
      <h2 class="section-title">Direcciones de Envío</h2>
      <button 
        type="button" 
        class="btn-add"
        (click)="addAddress()"
        [disabled]="direcciones.length >= 5">
        + Añadir Dirección
      </button>
    </div>

    <div formArrayName="direcciones" class="addresses-container">
      @for (address of direcciones.controls; track $index; let i = $index) {
        <div [formGroupName]="i" class="address-card">
          
          <!-- Header de la tarjeta de dirección -->
          <div class="address-header">
            <h3>Dirección {{ i + 1 }}</h3>
            <div class="address-actions">
              <!-- Radio para dirección principal -->
              <label class="main-address-toggle">
                <input 
                  type="radio" 
                  name="mainAddress"
                  [checked]="address.get('esPrincipal')?.value"
                  (change)="setMainAddress(i)"
                />
                Principal
              </label>
              
              <!-- Botón eliminar -->
              @if (direcciones.length > 1) {
                <button 
                  type="button" 
                  class="btn-remove"
                  (click)="removeAddress(i)">
                  Eliminar
                </button>
              }
            </div>
          </div>

          <!-- Campos de la dirección -->
          <div class="form-row">
            <div class="form-group">
              <label>Alias *</label>
              <input formControlName="alias" placeholder="Casa, Trabajo..." />
              @if (isAddressFieldInvalid(i, 'alias')) {
                <span class="error">{{ getAddressFieldError(i, 'alias') }}</span>
              }
            </div>
          </div>

          <div class="form-row">
            <div class="form-group form-group--large">
              <label>Calle *</label>
              <input formControlName="calle" />
            </div>
            <div class="form-group form-group--small">
              <label>Número *</label>
              <input formControlName="numero" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Piso</label>
              <input formControlName="piso" />
            </div>
            <div class="form-group">
              <label>Puerta</label>
              <input formControlName="puerta" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Código Postal *</label>
              <input formControlName="codigoPostal" placeholder="28001" />
              @if (isAddressFieldInvalid(i, 'codigoPostal')) {
                <span class="error">Código postal español inválido</span>
              }
            </div>
            <div class="form-group">
              <label>Ciudad *</label>
              <input formControlName="ciudad" />
            </div>
            <div class="form-group">
              <label>Provincia *</label>
              <select formControlName="provincia">
                <option value="">Selecciona...</option>
                @for (prov of provincias; track prov.codigo) {
                  <option [value]="prov.codigo">{{ prov.nombre }}</option>
                }
              </select>
            </div>
          </div>
        </div>
      }
    </div>
    
    <p class="addresses-info">
      Puedes añadir hasta 5 direcciones. Mínimo 1 requerida.
    </p>
  </section>

  <!-- Botones de acción -->
  <div class="form-actions">
    <button type="button" class="btn-secondary" (click)="resetForm()">
      Cancelar
    </button>
    <button type="submit" class="btn-primary" [disabled]="isSubmitting()">
      @if (isSubmitting()) {
        <span class="spinner"></span> Guardando...
      } @else {
        Guardar Perfil
      }
    </button>
  </div>
</form>
```

---

## Feedback Visual de Validación

He implementado un sistema completo de feedback visual para todos los estados de validación:

### Estados Visuales

| Estado | Clase CSS | Visual |
|--------|-----------|--------|
| Normal | `.form-group` | Borde gris neutro |
| Focus | `.form-input:focus` | Borde primario con sombra |
| Válido | `.form-group--valid` | Borde verde + icono ✓ |
| Inválido | `.form-group--error` | Borde rojo + icono ✗ |
| Validando | `.form-group--pending` | Spinner de carga |
| Deshabilitado | `.form-input:disabled` | Fondo gris, cursor no permitido |

### Estilos SCSS

```scss
.form-group {
  margin-bottom: $spacing-4;

  &--error {
    .form-input {
      border-color: $error;
      
      &:focus {
        box-shadow: 0 0 0 3px rgba($error, 0.15);
      }
    }
  }

  &--valid {
    .form-input {
      border-color: $success;
      
      &:focus {
        box-shadow: 0 0 0 3px rgba($success, 0.15);
      }
    }
  }
}

.input-wrapper {
  position: relative;
  
  .input-icon {
    position: absolute;
    right: $spacing-3;
    top: 50%;
    transform: translateY(-50%);
    
    &--valid {
      color: $success;
    }
    
    &--invalid {
      color: $error;
    }
  }
  
  .spinner-small {
    position: absolute;
    right: $spacing-3;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    border: 2px solid $gray-300;
    border-top-color: $color-primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

.error-message {
  display: block;
  color: $error;
  font-size: $font-size-sm;
  margin-top: $spacing-1;
}

.password-strength {
  margin-top: $spacing-2;
  
  .strength-bar {
    height: 4px;
    background: $gray-200;
    border-radius: $radius-full;
    overflow: hidden;
  }
  
  .strength-fill {
    height: 100%;
    transition: width 0.3s ease, background-color 0.3s ease;
  }
}

.password-requirements {
  list-style: none;
  padding: 0;
  margin-top: $spacing-2;
  
  li {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    font-size: $font-size-sm;
    color: $gray-600;
    
    &.met {
      color: $success;
      
      .icon {
        color: $success;
      }
    }
  }
}

@keyframes spin {
  to { transform: translateY(-50%) rotate(360deg); }
}
```

---

## Demostración en Style Guide

He añadido una sección completa "Formularios (Fase 3)" al Style Guide con demostraciones interactivas:

### Secciones de Demo

1. **Validadores Síncronos**: Campos de teléfono, código postal y NIF con validación en tiempo real

2. **Validadores Asíncronos**: Email y username con verificación de disponibilidad (emails de prueba: `admin@geststore.com`, `user@example.com`)

3. **FormArray Dinámico**: Lista de items que se pueden añadir/eliminar con validación individual

4. **Enlaces a Formularios Completos**: Cards con links a Login, Register y Profile

### Implementación en Style Guide

```typescript
// Formulario con validadores síncronos
demoSyncForm: FormGroup = this.fb.group({
  phone: ['', [Validators.required, spanishPhoneValidator()]],
  postalCode: ['', [Validators.required, spanishPostalCodeValidator()]],
  nif: ['', [Validators.required, nifNieValidator()]]
});

// Formulario con validadores asíncronos
demoAsyncForm: FormGroup = this.fb.group({
  email: ['', {
    validators: [Validators.required, Validators.email],
    asyncValidators: [createUniqueEmailValidator(this.validationApi)],
    updateOn: 'blur'
  }],
  username: ['', {
    validators: [Validators.required],
    asyncValidators: [createUniqueUsernameValidator(this.validationApi)],
    updateOn: 'blur'
  }]
});

// FormArray de demo
demoArrayForm: FormGroup = this.fb.group({
  items: this.fb.array([])
});

get demoItems(): FormArray {
  return this.demoArrayForm.get('items') as FormArray;
}

addDemoItem(): void {
  const itemGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    quantity: [1, [Validators.required, Validators.min(1)]]
  });
  this.demoItems.push(itemGroup);
}

removeDemoItem(index: number): void {
  this.demoItems.removeAt(index);
}
```

---

## Rutas Configuradas

He actualizado `app.routes.ts` para incluir la ruta del formulario de perfil:

```typescript
import { Routes } from '@angular/router';
import { StyleGuideComponent } from './pages/style-guide/style-guide.component';
import { ProfileFormComponent } from './components/shared/profile-form/profile-form.component';

export const routes: Routes = [
  { path: '', component: StyleGuideComponent },
  { path: 'style-guide', component: StyleGuideComponent },
  { path: 'profile', component: ProfileFormComponent },
  { path: '**', redirectTo: '' }
];
```

---

## Conclusiones Fase 3

En esta fase he implementado un sistema completo de formularios reactivos que incluye:

1. **Biblioteca de Validadores Síncronos (15+)**:
   - Validadores de contraseña fuerte y coincidencia
   - Validadores de documentos españoles (NIF/NIE, IBAN)
   - Validadores de contacto (teléfono, código postal)
   - Validadores de texto (solo letras, formato username)
   - Validadores numéricos y de fecha

2. **Validadores Asíncronos con Debounce**:
   - Verificación de email único
   - Verificación de username disponible
   - Verificación de NIF registrado
   - Servicio de simulación de API

3. **Formularios Reactivos Completos**:
   - **LoginForm**: Conversión de template-driven a reactive
   - **RegisterForm**: Validación exhaustiva con indicador de fuerza de contraseña
   - **ProfileForm**: FormArray para múltiples direcciones dinámicas

4. **Feedback Visual Completo**:
   - Estados visuales para todos los tipos de validación
   - Iconos de estado (válido/inválido/validando)
   - Barra de fuerza de contraseña
   - Checklist de requisitos en tiempo real
   - Spinners durante validación asíncrona

5. **Demostración Interactiva**:
   - Sección "Formularios (Fase 3)" en Style Guide
   - Demos de cada tipo de validador
   - Ejemplo funcional de FormArray

### Tabla de Requisitos Cumplidos

| Requisito | Estado | Implementación |
|-----------|--------|----------------|
| Uso de FormBuilder | ✅ | Todos los formularios |
| Validadores síncronos (mín. 3) | ✅ | 15+ implementados |
| Validadores asíncronos (mín. 2) | ✅ | 3 con debounce |
| FormArray dinámico | ✅ | ProfileForm con direcciones |
| Feedback visual | ✅ | Completo con animaciones |
| Mensajes contextuales | ✅ | Función `getErrorMessage` |
| Estado de carga | ✅ | Signals + spinners |

La arquitectura implementada sigue las mejores prácticas de Angular para formularios reactivos, proporcionando una base sólida y reutilizable para cualquier formulario de la aplicación.
