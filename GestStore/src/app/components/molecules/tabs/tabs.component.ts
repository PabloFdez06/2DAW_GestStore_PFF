import { 
  Component, 
  Input, 
  Output, 
  EventEmitter,
  ContentChildren,
  QueryList,
  AfterContentInit,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * TabPanelComponent - Panel de contenido para cada pestaña
 */
@Component({
  selector: 'app-tab-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [id]="panelId"
      class="tab-panel"
      [class.tab-panel--active]="isActive()"
      role="tabpanel"
      [attr.aria-labelledby]="tabId"
      [attr.aria-hidden]="!isActive()"
      [attr.tabindex]="isActive() ? 0 : -1">
      @if (isActive()) {
        <ng-content></ng-content>
      }
    </div>
  `,
  styles: [`
    .tab-panel {
      display: none;
      padding: 1rem;
      animation: tabFadeIn 0.2s ease-out;
      
      &--active {
        display: block;
      }
    }
    
    @keyframes tabFadeIn {
      from {
        opacity: 0;
        transform: translateY(5px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class TabPanelComponent {
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() icon?: string;
  
  isActive = signal(false);
  
  readonly panelId = `tab-panel-${Math.random().toString(36).substr(2, 9)}`;
  readonly tabId = `tab-${Math.random().toString(36).substr(2, 9)}`;
  
  /**
   * Activa este panel
   */
  activate(): void {
    this.isActive.set(true);
  }
  
  /**
   * Desactiva este panel
   */
  deactivate(): void {
    this.isActive.set(false);
  }
}

/**
 * TabsComponent - Componente de pestañas interactivo
 * 
 * Características:
 * - Navegación entre pestañas con click
 * - Navegación con teclado (Arrow keys, Home, End)
 * - Soporte para pestañas deshabilitadas
 * - ARIA attributes para accesibilidad
 * - Animación de transición entre pestañas
 */
@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tabs" [class]="'tabs tabs--' + variant">
      <!-- Tab List -->
      <div 
        class="tabs__list" 
        role="tablist"
        [attr.aria-label]="ariaLabel"
        (keydown)="onKeyDown($event)">
        @for (tab of tabs; track tab.panelId; let i = $index) {
          <button
            [id]="tab.tabId"
            class="tabs__tab"
            [class.tabs__tab--active]="activeIndex() === i"
            [class.tabs__tab--disabled]="tab.disabled"
            role="tab"
            [attr.aria-selected]="activeIndex() === i"
            [attr.aria-controls]="tab.panelId"
            [attr.tabindex]="activeIndex() === i ? 0 : -1"
            [disabled]="tab.disabled"
            (click)="selectTab(i)"
            (focus)="onTabFocus(i)"
            type="button">
            @if (tab.icon) {
              <span class="tabs__tab-icon" aria-hidden="true">{{ tab.icon }}</span>
            }
            <span class="tabs__tab-label">{{ tab.label }}</span>
          </button>
        }
        
        <!-- Indicador animado -->
        <div 
          class="tabs__indicator" 
          [style.transform]="indicatorTransform()"
          [style.width]="indicatorWidth()"
          aria-hidden="true">
        </div>
      </div>
      
      <!-- Tab Panels -->
      <div class="tabs__panels">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrl: './tabs.component.scss'
})
export class TabsComponent implements AfterContentInit {
  @ContentChildren(TabPanelComponent) tabPanels!: QueryList<TabPanelComponent>;
  
  @Input() variant: 'default' | 'pills' | 'underline' = 'default';
  @Input() ariaLabel: string = 'Pestañas de navegación';
  @Input() initialTab: number = 0;
  
  @Output() tabChanged = new EventEmitter<number>();
  
  activeIndex = signal(0);
  tabs: TabPanelComponent[] = [];
  
  // Computed para el indicador animado
  indicatorTransform = computed(() => {
    const index = this.activeIndex();
    return `translateX(${index * 100}%)`;
  });
  
  indicatorWidth = computed(() => {
    if (this.tabs.length === 0) return '0';
    return `${100 / this.tabs.length}%`;
  });
  
  ngAfterContentInit(): void {
    this.tabs = this.tabPanels.toArray();
    
    // Establecer pestaña inicial
    const initialIndex = Math.min(this.initialTab, this.tabs.length - 1);
    this.selectTab(initialIndex);
    
    // Suscribirse a cambios en los tabs
    this.tabPanels.changes.subscribe(() => {
      this.tabs = this.tabPanels.toArray();
      if (this.activeIndex() >= this.tabs.length) {
        this.selectTab(Math.max(0, this.tabs.length - 1));
      }
    });
  }
  
  /**
   * Selecciona una pestaña por índice
   */
  selectTab(index: number): void {
    if (index < 0 || index >= this.tabs.length) return;
    if (this.tabs[index].disabled) return;
    
    // Desactivar todas las pestañas
    this.tabs.forEach(tab => tab.deactivate());
    
    // Activar la pestaña seleccionada
    this.tabs[index].activate();
    this.activeIndex.set(index);
    this.tabChanged.emit(index);
  }
  
  /**
   * Maneja el focus en una pestaña
   */
  onTabFocus(index: number): void {
    // Solo para seguimiento, la selección se hace con click
  }
  
  /**
   * Maneja navegación con teclado
   */
  onKeyDown(event: KeyboardEvent): void {
    const currentIndex = this.activeIndex();
    let targetIndex: number | null = null;
    
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        targetIndex = this.findNextEnabledTab(currentIndex, 1);
        break;
        
      case 'ArrowLeft':
        event.preventDefault();
        targetIndex = this.findNextEnabledTab(currentIndex, -1);
        break;
        
      case 'Home':
        event.preventDefault();
        targetIndex = this.findNextEnabledTab(-1, 1);
        break;
        
      case 'End':
        event.preventDefault();
        targetIndex = this.findNextEnabledTab(this.tabs.length, -1);
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectTab(currentIndex);
        return;
    }
    
    if (targetIndex !== null && targetIndex !== currentIndex) {
      this.selectTab(targetIndex);
      // Focus en el nuevo tab
      setTimeout(() => {
        const tabButton = document.getElementById(this.tabs[targetIndex!].tabId);
        tabButton?.focus();
      }, 0);
    }
  }
  
  /**
   * Encuentra la siguiente pestaña habilitada
   */
  private findNextEnabledTab(currentIndex: number, direction: 1 | -1): number {
    let index = currentIndex + direction;
    
    while (index >= 0 && index < this.tabs.length) {
      if (!this.tabs[index].disabled) {
        return index;
      }
      index += direction;
    }
    
    // Wrap around
    if (direction === 1) {
      index = 0;
    } else {
      index = this.tabs.length - 1;
    }
    
    while (index !== currentIndex) {
      if (!this.tabs[index].disabled) {
        return index;
      }
      index += direction;
      if (index < 0) index = this.tabs.length - 1;
      if (index >= this.tabs.length) index = 0;
    }
    
    return currentIndex;
  }
}
