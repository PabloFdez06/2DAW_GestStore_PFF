# Documentación Técnica del Cliente - GestStore

## Índice

1. [Fase 1: Manipulación del DOM y Eventos](#fase-1-manipulación-del-dom-y-eventos)
2. [Fase 2: Componentes Interactivos y Comunicación](#fase-2-componentes-interactivos-y-comunicación)
3. [Fase 3: Formularios Reactivos](#fase-3-formularios-reactivos)
4. [Fase 4: Sistema de Rutas y Navegación](#fase-4-sistema-de-rutas-y-navegación)
5. [Fase 5: Servicios y Comunicación HTTP](#fase-5-servicios-y-comunicación-http)
6. [Fase 6: Gestión de Estado y Actualización Dinámica](#fase-6-gestión-de-estado-y-actualización-dinámica)

---

## Fase 1: Manipulación del DOM y Eventos

### Arquitectura de Eventos

He implementado un sistema de eventos robusto en GestStore siguiendo las mejores prácticas de Angular. La arquitectura se basa en tres pilares fundamentales: acceso controlado al DOM mediante `ViewChild` y `ElementRef`, event binding declarativo en templates, y directivas personalizadas para comportamientos reutilizables.

### Acceso a Elementos del DOM

Para acceder a elementos del DOM de forma segura, utilizo `ViewChild` combinado con `ElementRef`. Este patrón me permite manipular elementos nativos cuando es estrictamente necesario, manteniendo la abstracción que Angular proporciona.

```typescript
// dashboard.component.ts
@ViewChild('calendarDialog', { read: ElementRef }) 
calendarDialog?: ElementRef<HTMLDialogElement>;

@ViewChild('productDialog', { read: ElementRef }) 
productDialog?: ElementRef<HTMLDialogElement>;

openCalendarModal(): void {
  this.calendarDialog?.nativeElement?.showModal();
}

closeCalendarModal(): void {
  this.calendarDialog?.nativeElement?.close();
}
```

He aplicado este patrón en los siguientes componentes:

| Componente | Elemento | Propósito |
|------------|----------|-----------|
| `DashboardComponent` | Diálogos modales | Gestión de calendario y productos |
| `WarehouseComponent` | Modal de edición | CRUD de productos |
| `NavHeaderComponent` | Menú hamburguesa | Navegación móvil |
| `AccordionComponent` | Paneles | Expansión/colapso de secciones |

### Sistema de Event Binding

He implementado event binding en todos los componentes interactivos de la aplicación. Los eventos principales que gestiono son:

```html
<!-- Eventos de click -->
<button (click)="openEditProductModal(product)">Editar</button>
<button (click)="toggleTheme()">Cambiar tema</button>

<!-- Eventos de teclado -->
<div (keydown.escape)="closeModal()">
<input (keydown.enter)="onSearch()">

<!-- Eventos de formulario -->
<input (input)="onSearchInput($event)">
<input (focus)="onFocus()" (blur)="onBlur()">
<form (submit)="onSubmit($event)">
```

Para prevenir comportamientos por defecto, utilizo `$event.preventDefault()` en casos como el envío de formularios y la propagación de eventos en menús anidados.

### Diagrama de Flujo de Eventos

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE EVENTOS PRINCIPAL                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐    │
│   │   Usuario    │────▶│   Template   │────▶│    Componente    │    │
│   │  (Interacción)     │ (Event Bind) │     │    (Handler)     │    │
│   └──────────────┘     └──────────────┘     └────────┬─────────┘    │
│                                                       │              │
│                                                       ▼              │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                        ACCIONES                               │  │
│   ├──────────────────────────────────────────────────────────────┤  │
│   │  • Actualizar estado local (signals)                         │  │
│   │  • Llamar a servicios (HTTP, notificaciones)                 │  │
│   │  • Modificar DOM (ViewChild + ElementRef)                    │  │
│   │  • Emitir eventos al padre (@Output)                         │  │
│   │  • Navegar a otra ruta (Router)                              │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Theme Switcher

He implementado un sistema completo de cambio de tema que detecta la preferencia del sistema operativo y permite al usuario personalizar su experiencia.

```typescript
// theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'theme-preference';
  private readonly mediaQuery = '(prefers-color-scheme: dark)';
  private mediaQueryList: MediaQueryList | null = null;

  readonly preference = signal<ThemePreference>('system');
  readonly systemMode = signal<ThemeMode>('light');

  readonly mode: Signal<ThemeMode> = computed(() => {
    const preference = this.preference();
    if (preference === 'system') return this.systemMode();
    return preference;
  });

  init(): void {
    // Cargar preferencia guardada
    const stored = this.safeGetLocalStorage(this.STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      this.preference.set(stored);
    }

    // Detectar preferencia del sistema
    this.mediaQueryList = window.matchMedia(this.mediaQuery);
    this.systemMode.set(this.mediaQueryList.matches ? 'dark' : 'light');

    // Escuchar cambios en la preferencia del sistema
    this.mediaQueryList.addEventListener('change', (e) => {
      this.systemMode.set(e.matches ? 'dark' : 'light');
    });

    // Aplicar tema inicial
    this.applyTheme();
  }

  toggle(): void {
    const next = this.mode() === 'dark' ? 'light' : 'dark';
    this.setPreference(next);
  }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.mode());
  }
}
```

Características implementadas:
- Detección automática de `prefers-color-scheme` del sistema operativo
- Toggle manual entre temas claro y oscuro
- Persistencia de la preferencia en `localStorage`
- Aplicación del tema al cargar la aplicación
- Reactividad mediante Signals de Angular

### Componentes Interactivos

#### Menú Hamburguesa

El menú móvil se abre y cierra con animación, gestiona el foco correctamente y se cierra al hacer clic fuera o pulsar Escape.

```typescript
// nav-header.component.ts
toggleMobileMenu(): void {
  this.isMobileMenuOpen = !this.isMobileMenuOpen;
  if (this.isMobileMenuOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

closeMobileMenu(): void {
  this.isMobileMenuOpen = false;
  document.body.style.overflow = '';
}

@HostListener('document:keydown.escape')
onEscapePress(): void {
  if (this.isMobileMenuOpen) {
    this.closeMobileMenu();
  }
}
```

#### Modales

He creado un componente `ModalWrapperComponent` reutilizable que encapsula la lógica común de los modales:

```typescript
// modal-wrapper.component.ts
@Component({
  selector: 'app-modal-wrapper',
  template: `
    <div class="modal-backdrop" (click)="onBackdropClick($event)">
      <div class="modal-content" role="dialog" aria-modal="true">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class ModalWrapperComponent {
  @Output() close = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
```

#### Tooltip Directive

He implementado una directiva de tooltips con posicionamiento dinámico y delay configurable:

```typescript
// tooltip.directive.ts
@Directive({ selector: '[appTooltip]', standalone: true })
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') text: string = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() tooltipDelay = 300;

  private tooltipElement: HTMLElement | null = null;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;

  @HostListener('mouseenter') onMouseEnter(): void {
    this.scheduleShow();
  }

  @HostListener('mouseleave') onMouseLeave(): void {
    this.hide();
  }

  @HostListener('focus') onFocus(): void {
    this.scheduleShow();
  }

  @HostListener('blur') onBlur(): void {
    this.hide();
  }

  @HostListener('keydown.escape') onEscape(): void {
    this.hide();
  }

  private scheduleShow(): void {
    this.showTimeout = setTimeout(() => this.show(), this.tooltipDelay);
  }

  private show(): void {
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = `tooltip tooltip--${this.tooltipPosition}`;
    this.tooltipElement.textContent = this.text;
    document.body.appendChild(this.tooltipElement);
    this.positionTooltip();
  }
}
```

#### Acordeón

El componente acordeón soporta modo single (solo un panel abierto) y multiple, con navegación completa por teclado:

```typescript
// accordion.component.ts
@Component({
  selector: 'app-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionComponent {
  @Input() mode: 'single' | 'multiple' = 'single';
  @ContentChildren(AccordionPanelComponent) panels!: QueryList<AccordionPanelComponent>;

  togglePanel(panel: AccordionPanelComponent): void {
    if (this.mode === 'single') {
      this.panels.forEach(p => {
        if (p !== panel) p.expanded = false;
      });
    }
    panel.expanded = !panel.expanded;
  }
}
```

### Tabla de Compatibilidad de Navegadores

| Evento/API | Chrome | Firefox | Safari | Edge |
|------------|--------|---------|--------|------|
| `click`, `keydown`, `focus`, `blur` | 1+ | 1+ | 1+ | 12+ |
| `matchMedia` (prefers-color-scheme) | 76+ | 67+ | 12.1+ | 79+ |
| `localStorage` | 4+ | 3.5+ | 4+ | 12+ |
| `ResizeObserver` | 64+ | 69+ | 13.1+ | 79+ |
| `IntersectionObserver` | 51+ | 55+ | 12.1+ | 15+ |
| `dialog` element | 37+ | 98+ | 15.4+ | 79+ |

---

## Fase 2: Componentes Interactivos y Comunicación

### Arquitectura de Servicios

He diseñado una arquitectura de servicios que separa claramente las responsabilidades entre la lógica de negocio y la presentación. Los componentes se encargan exclusivamente de la UI, mientras que los servicios gestionan los datos, la comunicación HTTP y el estado de la aplicación.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ARQUITECTURA DE SERVICIOS                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                      COMPONENTES (UI)                        │   │
│   │  DashboardComponent, TasksComponent, WarehouseComponent...   │   │
│   └───────────────────────────┬─────────────────────────────────┘   │
│                               │                                      │
│                               ▼                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    SERVICIOS DE DOMINIO                      │   │
│   │  TaskService, ProductService, AuthService, UserService       │   │
│   └───────────────────────────┬─────────────────────────────────┘   │
│                               │                                      │
│   ┌───────────────────────────┼─────────────────────────────────┐   │
│   │                           │                                  │   │
│   ▼                           ▼                                  ▼   │
│ ┌──────────────┐  ┌────────────────────┐  ┌────────────────────┐    │
│ │ Notification │  │   RealTimeService  │  │  StockAlertService │    │
│ │   Service    │  │    (Polling)       │  │   (Alertas)        │    │
│ └──────────────┘  └────────────────────┘  └────────────────────┘    │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                     CAPA HTTP                                │   │
│   │  HttpClient + Interceptores (auth, error, logging)           │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Servicio de Comunicación entre Componentes

Para la comunicación entre componentes hermanos (que no tienen relación padre-hijo), utilizo servicios con `Subject` y `BehaviorSubject` que actúan como canales de mensajería:

```typescript
// real-time.service.ts
@Injectable({ providedIn: 'root' })
export class RealTimeService implements OnDestroy {
  // Subject para notificar cambios a los componentes
  private updateSubject = new Subject<RealTimeEvent>();
  readonly updates$ = this.updateSubject.asObservable();

  notifyDataChange(type: RealTimeEvent['type'], payload?: unknown): void {
    const event: RealTimeEvent = {
      type,
      payload,
      timestamp: new Date()
    };
    this.updateSubject.next(event);
  }
}
```

Los componentes se suscriben a estos eventos para reaccionar a cambios:

```typescript
// dashboard.component.ts
ngOnInit(): void {
  this.realTimeService.updates$
    .pipe(takeUntil(this.destroy$))
    .subscribe(event => {
      if (event.type === 'task_updated') {
        this.loadStatistics();
      }
    });
}
```

### Sistema de Notificaciones (Toasts)

He implementado un sistema centralizado de notificaciones que permite mostrar mensajes al usuario desde cualquier punto de la aplicación:

```typescript
// notification.service.ts
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSignal = signal<Notification[]>([]);
  notifications = computed(() => this.notificationsSignal());

  show(message: string, type: NotificationType = 'info', duration: number = 4000): void {
    const id = crypto.randomUUID();
    const notification: Notification = { id, type, message, duration };
    
    this.notificationsSignal.update(notifications => [...notifications, notification]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  dismiss(id: string): void {
    this.notificationsSignal.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration ?? 6000);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }
}
```

El componente de notificaciones se suscribe al servicio y renderiza los toasts:

```typescript
// notification.component.ts
@Component({
  selector: 'app-notifications',
  template: `
    <div class="notifications-container">
      @for (notification of notifications(); track notification.id) {
        <div class="toast toast--{{ notification.type }}" 
             role="alert"
             (click)="dismiss(notification.id)">
          <app-icon [name]="getIcon(notification.type)"></app-icon>
          <span>{{ notification.message }}</span>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent {
  notifications = inject(NotificationService).notifications;
}
```

### Gestión de Loading States

He implementado componentes dedicados para gestionar los estados de carga, error y vacío de forma consistente en toda la aplicación:

```typescript
// loading-state.component.ts
@Component({
  selector: 'app-loading-state',
  template: `
    <div class="loading-state">
      <app-spinner [size]="spinnerSize"></app-spinner>
      <p class="loading-state__message">{{ message }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingStateComponent {
  @Input() message = 'Cargando...';
  @Input() spinnerSize: 'small' | 'medium' | 'large' = 'medium';
}

// error-state.component.ts
@Component({
  selector: 'app-error-state',
  template: `
    <div class="error-state">
      <app-icon name="alert-circle" size="48"></app-icon>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <button *ngIf="showRetry" (click)="retry.emit()" class="btn btn--primary">
        Reintentar
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorStateComponent {
  @Input() title = 'Ha ocurrido un error';
  @Input() message = 'No se han podido cargar los datos.';
  @Input() showRetry = true;
  @Output() retry = new EventEmitter<void>();
}

// empty-state.component.ts
@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      <app-icon [name]="icon" size="48"></app-icon>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No hay datos';
  @Input() message = 'No se encontraron resultados.';
}
```

Uso en componentes:

```html
<!-- tasks.component.html -->
@if (isLoading()) {
  <app-loading-state message="Cargando tareas..."></app-loading-state>
} @else if (error()) {
  <app-error-state 
    [message]="error()" 
    (retry)="loadTasks()">
  </app-error-state>
} @else if (tasks().length === 0) {
  <app-empty-state 
    icon="clipboard" 
    title="Sin tareas"
    message="No tienes tareas pendientes.">
    <button (click)="openAddTaskModal()" class="btn btn--primary">
      Crear primera tarea
    </button>
  </app-empty-state>
} @else {
  <!-- Lista de tareas -->
}
```

### Patrones de Comunicación Implementados

| Patrón | Uso | Ejemplo |
|--------|-----|---------|
| `@Input()/@Output()` | Padre-hijo | `TaskCardComponent` recibe tarea, emite eventos |
| `BehaviorSubject` | Estado compartido | `TaskService.tasks$` |
| `Subject` | Eventos puntuales | `RealTimeService.updates$` |
| `Signals` | Estado reactivo moderno | `NotificationService.notifications` |
| Servicio singleton | Estado global | `AuthService`, `ThemeService` |

---

## Fase 3: Formularios Reactivos

### Implementación de Formularios

En GestStore he implementado formularios con validación completa utilizando una combinación de técnicas. Los formularios principales de la aplicación incluyen validación síncrona, feedback visual inmediato y gestión de estados.

### Formulario de Login

```typescript
// login-form.component.ts
export class LoginFormComponent {
  email = '';
  password = '';
  errors: { [key: string]: string } = {};
  isLoading = false;

  private validateForm(): boolean {
    this.errors = {};
    
    if (!this.email.trim()) {
      this.errors['email'] = 'El email es requerido';
    } else if (!this.isValidEmail(this.email)) {
      this.errors['email'] = 'El formato del email no es válido';
    }
    
    if (!this.password) {
      this.errors['password'] = 'La contraseña es requerida';
    }
    
    return Object.keys(this.errors).length === 0;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    
    if (!this.validateForm()) return;
    
    this.isLoading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errors['general'] = err.message || 'Error al iniciar sesión';
        this.isLoading = false;
      }
    });
  }
}
```

### Formulario de Registro con Validación Avanzada

```typescript
// register-form.component.ts
export class RegisterFormComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  errors: { [key: string]: string } = {};

  private validateForm(): boolean {
    this.errors = {};

    // Validación de nombre de usuario
    if (!this.username.trim()) {
      this.errors['username'] = 'El nombre de usuario es requerido';
    } else if (this.username.length < 3) {
      this.errors['username'] = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validación de email
    if (!this.email) {
      this.errors['email'] = 'El email es requerido';
    } else if (!this.isValidEmail(this.email)) {
      this.errors['email'] = 'El email no es válido';
    }

    // Validación de contraseña fuerte
    if (!this.password) {
      this.errors['password'] = 'La contraseña es requerida';
    } else if (this.password.length < 6) {
      this.errors['password'] = 'La contraseña debe tener al menos 6 caracteres';
    } else if (!this.isStrongPassword(this.password)) {
      this.errors['password'] = 'La contraseña debe incluir mayúsculas, minúsculas y números';
    }

    // Validación de confirmación de contraseña
    if (this.password !== this.confirmPassword) {
      this.errors['confirmPassword'] = 'Las contraseñas no coinciden';
    }

    return Object.keys(this.errors).length === 0;
  }

  private isStrongPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers;
  }
}
```

### Validadores Personalizados Implementados

| Validador | Descripción | Uso |
|-----------|-------------|-----|
| `isValidEmail` | Valida formato de email con regex | Login, Registro |
| `isStrongPassword` | Verifica mayúsculas, minúsculas y números | Registro |
| `passwordsMatch` | Compara contraseña y confirmación | Registro |
| `minLength` | Longitud mínima de campo | Usuario, contraseña |
| `required` | Campo obligatorio | Todos los formularios |

### Feedback Visual de Validación

He implementado feedback visual inmediato que muestra errores después de que el usuario interactúa con el campo:

```html
<!-- Ejemplo de campo con feedback -->
<div class="form-group" [class.has-error]="errors['email']">
  <label for="email">Email</label>
  <input 
    type="email" 
    id="email"
    [(ngModel)]="email"
    (blur)="validateField('email')"
    [class.invalid]="errors['email']"
    placeholder="tu@email.com">
  <span *ngIf="errors['email']" class="error-message">
    {{ errors['email'] }}
  </span>
</div>
```

```scss
// Estilos de validación
.form-group {
  &.has-error {
    input {
      border-color: var(--color-error);
      
      &:focus {
        box-shadow: 0 0 0 2px rgba(var(--color-error-rgb), 0.2);
      }
    }
  }
  
  .error-message {
    color: var(--color-error);
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
}

input.invalid {
  border-color: var(--color-error);
}
```

### Gestión de Estados del Formulario

```typescript
// Estados gestionados en formularios
export class TaskEditComponent {
  isLoading = false;
  isSaving = false;
  hasChanges = false;
  errors: { [key: string]: string } = {};

  // Detectar cambios para PendingChangesGuard
  onFieldChange(): void {
    this.hasChanges = true;
  }

  // Implementación de CanComponentDeactivate
  canDeactivate(): boolean {
    if (this.hasChanges) {
      return confirm('Tienes cambios sin guardar. ¿Deseas salir?');
    }
    return true;
  }

  async onSubmit(): Promise<void> {
    if (!this.validateForm()) return;
    
    this.isSaving = true;
    
    try {
      await this.taskService.updateTask(this.task).toPromise();
      this.hasChanges = false;
      this.notificationService.success('Tarea actualizada correctamente');
      this.router.navigate(['/tareas']);
    } catch (error) {
      this.notificationService.error('Error al guardar la tarea');
    } finally {
      this.isSaving = false;
    }
  }
}
```

### Formulario de Edición de Tareas

```typescript
// task-edit.component.ts
export class TaskEditComponent implements CanComponentDeactivate {
  task: Task = {
    id: '',
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    completed: false
  };
  
  originalTask: Task | null = null;
  errors: { [key: string]: string } = {};

  ngOnInit(): void {
    // Cargar tarea desde resolver
    this.task = { ...this.route.snapshot.data['task'] };
    this.originalTask = { ...this.task };
  }

  get hasChanges(): boolean {
    return JSON.stringify(this.task) !== JSON.stringify(this.originalTask);
  }

  validateForm(): boolean {
    this.errors = {};
    
    if (!this.task.title?.trim()) {
      this.errors['title'] = 'El título es requerido';
    } else if (this.task.title.length < 3) {
      this.errors['title'] = 'El título debe tener al menos 3 caracteres';
    }
    
    if (this.task.dueDate && new Date(this.task.dueDate) < new Date()) {
      this.errors['dueDate'] = 'La fecha de vencimiento no puede ser pasada';
    }
    
    return Object.keys(this.errors).length === 0;
  }

  canDeactivate(): boolean {
    if (this.hasChanges) {
      return confirm('Tienes cambios sin guardar. ¿Seguro que quieres salir?');
    }
    return true;
  }
}
```

---

## Fase 4: Sistema de Rutas y Navegación

### Configuración de Rutas

He configurado un sistema de rutas completo con lazy loading, guards y resolvers. La estructura de rutas refleja la arquitectura de la aplicación:

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component')
      .then(m => m.HomeComponent),
    title: 'Inicio - GestStore'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/home/components/login-form/login-form.component')
      .then(m => m.LoginFormComponent),
    canActivate: [guestGuard],
    title: 'Iniciar Sesión - GestStore'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/home/components/register-form/register-form.component')
      .then(m => m.RegisterFormComponent),
    canActivate: [guestGuard],
    title: 'Registro - GestStore'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Panel de Control - GestStore',
    data: { breadcrumb: 'Dashboard' }
  },
  {
    path: 'tareas',
    canActivate: [authGuard],
    loadChildren: () => import('./routes/tasks.routes')
      .then(m => m.TASK_ROUTES),
    data: { breadcrumb: 'Tareas' }
  },
  {
    path: 'almacen',
    loadComponent: () => import('./pages/warehouse/warehouse.component')
      .then(m => m.WarehouseComponent),
    canActivate: [authGuard],
    title: 'Almacén - GestStore',
    data: { breadcrumb: 'Almacén' }
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/profile/profile.component')
      .then(m => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'Mi Perfil - GestStore',
    data: { breadcrumb: 'Perfil' }
  },
  {
    path: 'ajustes',
    loadComponent: () => import('./pages/settings/settings.component')
      .then(m => m.SettingsComponent),
    canActivate: [authGuard],
    title: 'Ajustes - GestStore',
    data: { breadcrumb: 'Ajustes' }
  },
  {
    path: 'not-found',
    loadComponent: () => import('./pages/not-found/not-found.component')
      .then(m => m.NotFoundComponent),
    title: 'Página no encontrada - GestStore'
  },
  {
    path: '**',
    redirectTo: '/not-found'
  }
];
```

### Rutas Hijas para Tareas

```typescript
// routes/tasks.routes.ts
export const TASK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../pages/tasks/tasks.component')
      .then(m => m.TasksComponent),
    title: 'Mis Tareas - GestStore'
  },
  {
    path: 'importantes',
    loadComponent: () => import('../pages/important-tasks/important-tasks.component')
      .then(m => m.ImportantTasksComponent),
    title: 'Tareas Importantes - GestStore',
    data: { breadcrumb: 'Importantes' }
  },
  {
    path: ':id',
    loadComponent: () => import('../pages/task-detail/task-detail.component')
      .then(m => m.TaskDetailComponent),
    resolve: { task: taskResolver },
    title: 'Detalle de Tarea - GestStore',
    data: { breadcrumb: 'Detalle' }
  },
  {
    path: ':id/editar',
    loadComponent: () => import('../pages/task-edit/task-edit.component')
      .then(m => m.TaskEditComponent),
    resolve: { task: taskResolver },
    canDeactivate: [pendingChangesGuard],
    title: 'Editar Tarea - GestStore',
    data: { breadcrumb: 'Editar' }
  }
];
```

### Mapa de Rutas

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MAPA DE RUTAS                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  /                          → HomeComponent (público)                │
│  /login                     → LoginFormComponent (guestGuard)        │
│  /register                  → RegisterFormComponent (guestGuard)     │
│  /dashboard                 → DashboardComponent (authGuard)         │
│  /tareas                    → TasksComponent (authGuard)             │
│  /tareas/importantes        → ImportantTasksComponent (authGuard)    │
│  /tareas/:id                → TaskDetailComponent (authGuard+resolver)│
│  /tareas/:id/editar         → TaskEditComponent (authGuard+resolver+deactivate)│
│  /almacen                   → WarehouseComponent (authGuard)         │
│  /perfil                    → ProfileComponent (authGuard)           │
│  /ajustes                   → SettingsComponent (authGuard)          │
│  /not-found                 → NotFoundComponent (público)            │
│  /**                        → Redirect → /not-found                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Lazy Loading

Todas las rutas utilizan carga perezosa mediante `loadComponent` y `loadChildren`. Esto reduce significativamente el bundle inicial de la aplicación:

```typescript
// Componente individual con lazy loading
loadComponent: () => import('./pages/dashboard/dashboard.component')
  .then(m => m.DashboardComponent)

// Grupo de rutas con lazy loading
loadChildren: () => import('./routes/tasks.routes')
  .then(m => m.TASK_ROUTES)
```

La verificación del chunking se puede realizar en el build de producción, donde Angular genera archivos separados para cada módulo lazy-loaded.

### Route Guards

#### Auth Guard

Protege las rutas que requieren autenticación:

```typescript
// guards/auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Guardar URL para redirección después del login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};
```

#### Guest Guard

Redirige usuarios autenticados fuera de páginas públicas:

```typescript
// guards/guest.guard.ts
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
```

#### Pending Changes Guard

Previene la pérdida de datos no guardados:

```typescript
// guards/pending-changes.guard.ts
export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

export const pendingChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (component.canDeactivate) {
    return component.canDeactivate();
  }
  return true;
};
```

### Resolver para Tareas

Precarga los datos de la tarea antes de activar la ruta:

```typescript
// resolvers/task.resolver.ts
export const taskResolver: ResolveFn<Task> = (route, state) => {
  const taskService = inject(TaskService);
  const router = inject(Router);
  const rawId = route.paramMap.get('id');

  if (!rawId) {
    router.navigate(['/not-found']);
    return EMPTY;
  }

  return taskService.getTaskById(rawId).pipe(
    catchError((error) => {
      console.error('Error cargando tarea:', error);
      router.navigate(['/not-found']);
      return EMPTY;
    })
  );
};
```

### Breadcrumbs Dinámicos

He implementado un sistema de breadcrumbs que se genera automáticamente desde la configuración de rutas:

```typescript
// services/breadcrumbs.service.ts
export interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbsService {
  readonly breadcrumbs = signal<Breadcrumb[]>([]);

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const root = this.router.routerState.snapshot.root;
        this.breadcrumbs.set(this.buildBreadcrumbs(root));
      });
  }

  private buildBreadcrumbs(
    route: ActivatedRouteSnapshot,
    url: string = '',
    breadcrumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    const children = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL = child.url.map(segment => segment.path).join('/');
      
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.data['breadcrumb'];
      if (label) {
        breadcrumbs.push({ label, url });
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
```

Componente de breadcrumbs:

```typescript
// components/breadcrumbs/breadcrumbs.component.ts
@Component({
  selector: 'app-breadcrumbs',
  template: `
    <nav aria-label="Breadcrumb" class="breadcrumbs">
      <ol>
        <li>
          <a routerLink="/dashboard">
            <app-icon name="home" size="16"></app-icon>
            Inicio
          </a>
        </li>
        @for (crumb of breadcrumbs(); track crumb.url) {
          <li>
            <app-icon name="chevron-right" size="16"></app-icon>
            <a [routerLink]="crumb.url">{{ crumb.label }}</a>
          </li>
        }
      </ol>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsComponent {
  breadcrumbs = inject(BreadcrumbsService).breadcrumbs;
}
```

---

## Fase 5: Servicios y Comunicación HTTP

### Configuración de HttpClient

He configurado HttpClient con interceptores para manejar autenticación, errores y logging de forma centralizada:

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor,
        loggingInterceptor
      ])
    ),
    provideRouter(routes)
  ]
};
```

### Catálogo de Endpoints

| Endpoint | Método | Descripción | Servicio |
|----------|--------|-------------|----------|
| `/api/auth/login` | POST | Iniciar sesión | AuthService |
| `/api/auth/register` | POST | Registro de usuario | AuthService |
| `/api/users/me` | GET | Obtener usuario actual | UserService |
| `/api/tasks` | GET | Listar tareas (paginado) | TaskService |
| `/api/tasks/:id` | GET | Obtener tarea por ID | TaskService |
| `/api/tasks` | POST | Crear tarea | TaskService |
| `/api/tasks/:id` | PUT | Actualizar tarea | TaskService |
| `/api/tasks/:id` | DELETE | Eliminar tarea | TaskService |
| `/api/tasks/statistics` | GET | Estadísticas de tareas | TaskService |
| `/api/products` | GET | Listar productos | ProductService |
| `/api/products/:id` | GET | Obtener producto | ProductService |
| `/api/products` | POST | Crear producto | ProductService |
| `/api/products/:id` | PUT | Actualizar producto | ProductService |
| `/api/products/:id` | DELETE | Eliminar producto | ProductService |

### Servicio de Tareas (CRUD Completo)

```typescript
// services/task.service.ts
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly apiUrl = '/api/tasks';

  constructor(private http: HttpClient) {}

  // GET - Listar con paginación
  getTasksPaginated(page: number = 0, size: number = 10): Observable<TaskPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<TaskPage>>(this.apiUrl, { params }).pipe(
      retry(1),
      map(response => response.data),
      tap(pageData => this.updateState(pageData)),
      catchError(this.handleError('Error al cargar tareas'))
    );
  }

  // GET - Obtener por ID
  getTaskById(id: string | number): Observable<Task> {
    return this.http.get<ApiResponse<Task>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data),
      catchError(this.handleError('Error al cargar la tarea'))
    );
  }

  // POST - Crear
  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(this.apiUrl, task).pipe(
      map(response => response.data),
      tap(newTask => this.addTaskToState(newTask)),
      catchError(this.handleError('Error al crear la tarea'))
    );
  }

  // PUT - Actualizar
  updateTask(id: string | number, task: Partial<Task>): Observable<Task> {
    return this.http.put<ApiResponse<Task>>(`${this.apiUrl}/${id}`, task).pipe(
      map(response => response.data),
      tap(updatedTask => this.updateTaskInState(updatedTask)),
      catchError(this.handleError('Error al actualizar la tarea'))
    );
  }

  // DELETE - Eliminar
  deleteTask(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.removeTaskFromState(id)),
      catchError(this.handleError('Error al eliminar la tarea'))
    );
  }

  // Estadísticas
  getStatistics(): Observable<TaskStatistics> {
    return this.http.get<ApiResponse<TaskStatistics>>(`${this.apiUrl}/statistics`).pipe(
      map(response => response.data),
      tap(stats => this.statisticsSignal.set(stats)),
      catchError(this.handleError('Error al cargar estadísticas'))
    );
  }

  private handleError(message: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(message, error);
      this.errorSignal.set(message);
      return throwError(() => new Error(message));
    };
  }
}
```

### Interceptores HTTP

#### Auth Interceptor

Añade automáticamente el token JWT a todas las peticiones:

```typescript
// interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  if (token) {
    const headers: { [key: string]: string } = {
      'Authorization': `Bearer ${token}`
    };

    if (userId) {
      headers['X-User-Id'] = userId;
    }

    req = req.clone({ setHeaders: headers });
  }

  return next(req);
};
```

#### Error Interceptor

Maneja errores HTTP globalmente, especialmente el 401 (no autorizado):

```typescript
// interceptors/error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
        notificationService.error('Sesión expirada. Por favor, inicia sesión de nuevo.');
      } else if (error.status === 403) {
        notificationService.error('No tienes permisos para realizar esta acción.');
      } else if (error.status === 404) {
        notificationService.error('El recurso solicitado no existe.');
      } else if (error.status >= 500) {
        notificationService.error('Error del servidor. Inténtalo más tarde.');
      }

      return throwError(() => error);
    })
  );
};
```

#### Logging Interceptor

Registra las peticiones HTTP en desarrollo:

```typescript
// interceptors/logging.interceptor.ts
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.production) {
    const startTime = Date.now();
    
    console.log(`[HTTP] ${req.method} ${req.url}`);
    
    return next(req).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const duration = Date.now() - startTime;
            console.log(`[HTTP] ${req.method} ${req.url} - ${event.status} (${duration}ms)`);
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          console.error(`[HTTP] ${req.method} ${req.url} - ERROR ${error.status} (${duration}ms)`);
        }
      })
    );
  }
  
  return next(req);
};
```

### Interfaces TypeScript

```typescript
// models/task.model.ts
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string | number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completed: boolean;
  important?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  taskProducts?: TaskProduct[];
}

export interface TaskPage {
  content: Task[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface TaskStatistics {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  urgentTasks: number;
  overdueTasks: number;
}

// models/product.model.ts
export interface Product {
  id: string | number;
  name: string;
  description?: string;
  sku: string;
  price: number;
  stock: number;
  minStock: number;
  category?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// models/auth.model.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
}

// Respuesta genérica de la API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
```

### Estrategia de Manejo de Errores

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ESTRATEGIA DE MANEJO DE ERRORES                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐                                                   │
│   │   Request    │                                                   │
│   └──────┬───────┘                                                   │
│          │                                                           │
│          ▼                                                           │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │              INTERCEPTORES (Capa global)                      │  │
│   ├──────────────────────────────────────────────────────────────┤  │
│   │  • 401 → Logout + Redirect a login                           │  │
│   │  • 403 → Notificación de permisos                            │  │
│   │  • 404 → Notificación recurso no existe                      │  │
│   │  • 500+ → Notificación error servidor                        │  │
│   └──────────────────────────────────────────────────────────────┘  │
│          │                                                           │
│          ▼                                                           │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │              SERVICIOS (Capa de dominio)                      │  │
│   ├──────────────────────────────────────────────────────────────┤  │
│   │  • catchError → Log del error                                │  │
│   │  • retry(1) → Reintentar una vez                             │  │
│   │  • Actualizar estado de error en signals                     │  │
│   │  • Propagar error al componente                              │  │
│   └──────────────────────────────────────────────────────────────┘  │
│          │                                                           │
│          ▼                                                           │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │              COMPONENTES (Capa de UI)                         │  │
│   ├──────────────────────────────────────────────────────────────┤  │
│   │  • Mostrar ErrorStateComponent                               │  │
│   │  • Botón de reintentar                                       │  │
│   │  • Feedback visual al usuario                                │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Fase 6: Gestión de Estado y Actualización Dinámica

### Patrón de Estado Elegido

He optado por un enfoque híbrido que combina **Signals de Angular** como tecnología principal con **BehaviorSubject de RxJS** para compatibilidad con código existente.

### Justificación de la Elección

Evalué tres alternativas antes de tomar la decisión:

| Opción | Complejidad | Ventajas | Inconvenientes |
|--------|-------------|----------|----------------|
| Servicios + BehaviorSubject | Baja | Patrón conocido, buena comunicación entre componentes | Más boilerplate RxJS, riesgo de memory leaks |
| **Servicios + Signals** (elegida) | Media | Integración nativa Angular, sintaxis simple, OnPush eficiente | Requiere Angular moderno |
| NgRx | Alta | Escalable, time-travel debugging | Sobredimensionado para el proyecto |

**Decisión final:** Signals de Angular como patrón principal porque:

1. Es el estándar moderno de Angular 16+ y la dirección oficial del framework
2. Ofrece mejor rendimiento por detección de cambios granular
3. Sintaxis más limpia y fácil de depurar que BehaviorSubject
4. Señales computadas para datos derivados sin overhead
5. Mantiene la complejidad adecuada para un proyecto de este tamaño

### Arquitectura del Estado

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ARQUITECTURA DE ESTADO                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                      COMPONENTES                             │   │
│   │   Dashboard  │   Tasks   │   Warehouse   │   Profile        │   │
│   └───────────────────────────┬─────────────────────────────────┘   │
│                               │                                      │
│                               ▼                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                   SERVICIOS DE ESTADO                        │   │
│   ├─────────────────────────────────────────────────────────────┤   │
│   │                                                              │   │
│   │  TaskService              ProductService                     │   │
│   │  ─────────────            ──────────────                     │   │
│   │  • tasksSignal            • products$ (BehaviorSubject)      │   │
│   │  • statisticsSignal       • loading$                         │   │
│   │  • loadingSignal                                             │   │
│   │  • errorSignal                                               │   │
│   │  • tasks$ (compat)                                           │   │
│   │                                                              │   │
│   │  NotificationService      StockAlertService                  │   │
│   │  ───────────────────      ─────────────────                  │   │
│   │  • notificationsSignal    • lowStockSignal                   │   │
│   │                           • outOfStockSignal                 │   │
│   │                                                              │   │
│   │  RealTimeService          ThemeService                       │   │
│   │  ───────────────          ────────────                       │   │
│   │  • connectionStateSignal  • preferenceSignal                 │   │
│   │  • updates$ (Subject)     • modeSignal                       │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Implementación con Signals

```typescript
// services/task.service.ts
@Injectable({ providedIn: 'root' })
export class TaskService {
  // ═══════════════════════════════════════════════════════════
  // ESTADO PRIVADO (Signals)
  // ═══════════════════════════════════════════════════════════
  private tasksSignal = signal<Task[]>([]);
  private statisticsSignal = signal<TaskStatistics | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private currentPageSignal = signal<number>(0);
  private totalPagesSignal = signal<number>(0);

  // ═══════════════════════════════════════════════════════════
  // ESTADO PÚBLICO (Señales de solo lectura)
  // ═══════════════════════════════════════════════════════════
  readonly tasks = computed(() => this.tasksSignal());
  readonly statistics = computed(() => this.statisticsSignal());
  readonly isLoading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly hasMorePages = computed(() => 
    this.currentPageSignal() < this.totalPagesSignal() - 1
  );

  // Estadísticas computadas
  readonly pendingCount = computed(() => 
    this.tasksSignal().filter(t => t.status === 'PENDING').length
  );
  readonly completedCount = computed(() => 
    this.tasksSignal().filter(t => t.completed).length
  );

  // ═══════════════════════════════════════════════════════════
  // COMPATIBILIDAD RxJS
  // ═══════════════════════════════════════════════════════════
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  // ═══════════════════════════════════════════════════════════
  // MÉTODOS DE ACTUALIZACIÓN DE ESTADO
  // ═══════════════════════════════════════════════════════════
  private addTaskToState(task: Task): void {
    const current = this.tasksSignal();
    this.tasksSignal.set([task, ...current]);
    this.tasksSubject.next(this.tasksSignal());
  }

  private updateTaskInState(updatedTask: Task): void {
    const current = this.tasksSignal();
    const updated = current.map(t => 
      t.id === updatedTask.id ? updatedTask : t
    );
    this.tasksSignal.set(updated);
    this.tasksSubject.next(updated);
  }

  private removeTaskFromState(id: string | number): void {
    const current = this.tasksSignal();
    const filtered = current.filter(t => t.id !== id);
    this.tasksSignal.set(filtered);
    this.tasksSubject.next(filtered);
  }
}
```

### Estrategias de Optimización

#### 1. ChangeDetection OnPush

He aplicado `OnPush` en componentes presentacionales para reducir los ciclos de detección de cambios:

```typescript
@Component({
  selector: 'app-task-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() statusChange = new EventEmitter<Task>();
}
```

Componentes optimizados con OnPush:
- `TaskCardComponent`
- `StatCardComponent`
- `ButtonComponent`
- `SearchInputComponent`
- `LoadingStateComponent`
- `EmptyStateComponent`
- `ErrorStateComponent`

#### 2. TrackBy en ngFor

Para evitar re-renderizado completo de listas:

```html
<!-- tasks.component.html -->
<div *ngFor="let task of filteredTasks; trackBy: trackByTaskId" class="task-item">
  <app-task-card [task]="task"></app-task-card>
</div>

<!-- warehouse.component.html -->
<tr *ngFor="let product of filteredProducts; trackBy: trackByProductId">
  <td>{{ product.name }}</td>
  <td>{{ product.stock }}</td>
</tr>
```

```typescript
trackByTaskId(index: number, task: Task): string | number {
  return task.id;
}

trackByProductId(index: number, product: Product): string | number {
  return product.id;
}
```

#### 3. Debounce en Búsquedas

He creado una directiva reutilizable para debounce en inputs:

```typescript
// directives/debounce-input.directive.ts
@Directive({ selector: '[appDebounceInput]', standalone: true })
export class DebounceInputDirective implements OnInit, OnDestroy {
  @Input() debounceTime: number = 300;
  @Output() debounceValue = new EventEmitter<string>();

  private input$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    this.input$.next(value);
  }

  ngOnInit(): void {
    this.input$.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.debounceValue.emit(value);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

También implementé debounce en el SearchInputComponent:

```typescript
// components/atoms/search-input/search-input.component.ts
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @Input() debounceMs: number = 300;
  @Output() debouncedSearch = new EventEmitter<string>();

  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.searchSubject$.pipe(
      debounceTime(this.debounceMs),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.debouncedSearch.emit(value);
    });
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject$.next(value);
  }
}
```

#### 4. Gestión de Suscripciones

Uso sistemático del patrón `takeUntil` para evitar memory leaks:

```typescript
export class TasksComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.taskService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        this.filteredTasks = tasks;
      });

    this.realTimeService.updates$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event.type === 'task_updated') {
          this.loadTasks();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Paginación

He implementado paginación en el servicio de tareas:

```typescript
// task.service.ts
getTasksPaginated(page: number = 0, size: number = 10): Observable<TaskPage> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

  return this.http.get<ApiResponse<TaskPage>>(this.apiUrl, { params }).pipe(
    tap(response => {
      const pageData = response.data;
      if (page === 0) {
        this.tasksSignal.set(pageData.content);
      } else {
        // Agregar sin duplicados para infinite scroll
        const current = this.tasksSignal();
        const newTasks = pageData.content.filter(
          t => !current.some(existing => existing.id === t.id)
        );
        this.tasksSignal.set([...current, ...newTasks]);
      }
      this.currentPageSignal.set(pageData.number);
      this.totalPagesSignal.set(pageData.totalPages);
    })
  );
}
```

### Directiva de Infinite Scroll

```typescript
// directives/infinite-scroll.directive.ts
@Directive({ selector: '[appInfiniteScroll]', standalone: true })
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  @Input() scrollThreshold: number = 200;
  @Output() scrolled = new EventEmitter<void>();

  private observer!: IntersectionObserver;
  private sentinel!: HTMLElement;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.sentinel = document.createElement('div');
    this.sentinel.style.height = '1px';
    this.el.nativeElement.appendChild(this.sentinel);

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.scrolled.emit();
        }
      },
      { rootMargin: `${this.scrollThreshold}px` }
    );

    this.observer.observe(this.sentinel);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.sentinel?.remove();
  }
}
```

### Actualizaciones en Tiempo Real (Polling)

He implementado un servicio de polling con reconexión automática y backoff exponencial:

```typescript
// services/real-time.service.ts
export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'reconnecting' | 'error';

@Injectable({ providedIn: 'root' })
export class RealTimeService implements OnDestroy {
  private config: RealTimeConfig = {
    pollInterval: 30000,      // 30 segundos
    maxRetries: 5,            // 5 reintentos
    baseRetryDelay: 1000,     // 1 segundo base
    maxRetryDelay: 60000      // 1 minuto máximo
  };

  // Estado reactivo con Signals
  private connectionStateSignal = signal<ConnectionState>('disconnected');
  private retryCountSignal = signal<number>(0);

  readonly connectionState = computed(() => this.connectionStateSignal());
  readonly isConnected = computed(() => this.connectionStateSignal() === 'connected');
  readonly isReconnecting = computed(() => this.connectionStateSignal() === 'reconnecting');

  // Observable para eventos
  private updateSubject = new Subject<RealTimeEvent>();
  readonly updates$ = this.updateSubject.asObservable();

  startPolling(): void {
    this.connectionStateSignal.set('connecting');
    this.performSyncWithRetry().subscribe();

    this.pollingSubscription = interval(this.config.pollInterval).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.performSyncWithRetry())
    ).subscribe();
  }

  private calculateRetryDelay(): number {
    const exponentialDelay = this.config.baseRetryDelay * 
      Math.pow(2, this.consecutiveErrors - 1);
    return Math.min(exponentialDelay, this.config.maxRetryDelay);
  }

  reconnect(): void {
    this.stopPolling();
    this.startPolling();
    this.notificationService.info('Reconectando...');
  }
}
```

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────┐
│              FLUJO DE ACTUALIZACIÓN SIN RECARGA                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Usuario crea/edita/elimina tarea                                   │
│          │                                                           │
│          ▼                                                           │
│   TaskService.createTask() / updateTask() / deleteTask()             │
│          │                                                           │
│          ▼                                                           │
│   HTTP POST/PUT/DELETE → Backend responde                            │
│          │                                                           │
│          ▼                                                           │
│   addTaskToState() / updateTaskInState() / removeTaskFromState()     │
│          │                                                           │
│          ├──▶ tasksSignal.set([...])                                 │
│          │                                                           │
│          ├──▶ tasksSubject.next([...])                               │
│          │                                                           │
│          ├──▶ Señales computadas se recalculan automáticamente       │
│          │    (pendingCount, completedCount, hasMorePages)           │
│          │                                                           │
│          └──▶ Componentes con OnPush detectan cambio en inputs       │
│                                                                      │
│   UI se actualiza sin reload, manteniendo scroll y estado            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Resumen de Optimizaciones

| Criterio | Implementación |
|----------|----------------|
| Patrón de estado | Signals + BehaviorSubject (híbrido) |
| Actualización dinámica | Sin recargas, estado sincronizado |
| Optimización OnPush | Aplicado en componentes presentacionales |
| TrackBy | En todas las listas de tareas y productos |
| Debounce | 300ms en búsquedas |
| Unsubscribe | Patrón destroy$ en todos los componentes |
| Paginación | Soporte para infinite scroll |
| Tiempo real | Polling cada 30s con reconexión automática |
| Gestión de errores | Estados claros, notificaciones, reconexión |

---

## Conclusiones

A lo largo de este proyecto he implementado una aplicación Angular completa siguiendo las mejores prácticas del framework. La arquitectura resultante es modular, mantenible y optimizada para rendimiento.

Los principales logros técnicos incluyen:

1. **Separación de responsabilidades** clara entre componentes de presentación y servicios de lógica de negocio
2. **Gestión de estado moderna** con Signals de Angular, manteniendo compatibilidad con RxJS
3. **Sistema de rutas robusto** con lazy loading, guards y resolvers
4. **Comunicación HTTP estructurada** con interceptores para autenticación, manejo de errores y logging
5. **Optimizaciones de rendimiento** con OnPush, trackBy y debounce
6. **Experiencia de usuario fluida** con actualizaciones en tiempo real sin recargas de página

La documentación detallada de cada fase permite entender las decisiones técnicas tomadas y facilita el mantenimiento futuro del proyecto.
