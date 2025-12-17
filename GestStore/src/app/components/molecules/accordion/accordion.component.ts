import { 
  Component, 
  Input, 
  Output, 
  EventEmitter,
  ContentChildren,
  QueryList,
  AfterContentInit,
  signal,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * AccordionItemComponent - Elemento individual del acordeón
 * 
 * Características:
 * - Expandir/colapsar con animación
 * - Navegación con teclado (Enter, Space, Arrow keys)
 * - ARIA attributes para accesibilidad
 */
@Component({
  selector: 'app-accordion-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="accordion-item" [class.accordion-item--expanded]="isExpanded()">
      <button
        class="accordion-item__header"
        [attr.aria-expanded]="isExpanded()"
        [attr.aria-controls]="contentId"
        [id]="headerId"
        (click)="toggle()"
        (keydown)="onKeyDown($event)"
        type="button">
        <span class="accordion-item__title">{{ title }}</span>
        <span class="accordion-item__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="6 9 12 15 18 9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
      
      <div 
        [id]="contentId"
        class="accordion-item__content"
        [attr.aria-labelledby]="headerId"
        role="region"
        [attr.aria-hidden]="!isExpanded()">
        <div class="accordion-item__body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/00-settings/variables' as *;
    @use '../../../../styles/01-tools/mixins' as *;
    
    .accordion-item {
      border: 1px solid var(--border-default);
      border-radius: $radius-md;
      overflow: hidden;
      background: var(--bg-default);
      
      &:not(:last-child) {
        margin-bottom: $spacing-2;
      }
      
      &--expanded {
        .accordion-item__icon svg {
          transform: rotate(180deg);
        }
        
        .accordion-item__content {
          max-height: 500px;
          opacity: 1;
        }
      }
    }
    
    .accordion-item__header {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: $spacing-4;
      background: transparent;
      border: none;
      cursor: pointer;
      text-align: left;
      color: var(--text-default);
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      @include transition;
      
      &:hover {
        background: var(--gray-50);
      }
      
      &:focus-visible {
        @include focus-visible;
        outline-offset: -2px;
      }
    }
    
    .accordion-item__title {
      flex: 1;
    }
    
    .accordion-item__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      
      svg {
        width: 16px;
        height: 16px;
        @include transition;
      }
    }
    
    .accordion-item__content {
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      @include transition;
      transition-property: max-height, opacity;
      transition-duration: 0.3s;
    }
    
    .accordion-item__body {
      padding: 0 $spacing-4 $spacing-4;
      color: var(--text-default);
      
      p {
        margin: 0;
        line-height: $line-normal;
      }
    }
  `]
})
export class AccordionItemComponent {
  @Input() title: string = '';
  @Input() expanded: boolean = false;
  @Output() expandedChange = new EventEmitter<boolean>();
  @Output() toggled = new EventEmitter<boolean>();
  
  isExpanded = signal(false);
  
  readonly headerId = `accordion-header-${Math.random().toString(36).substr(2, 9)}`;
  readonly contentId = `accordion-content-${Math.random().toString(36).substr(2, 9)}`;
  
  ngOnInit(): void {
    this.isExpanded.set(this.expanded);
  }
  
  ngOnChanges(): void {
    this.isExpanded.set(this.expanded);
  }
  
  /**
   * Alterna el estado expandido/colapsado
   */
  toggle(): void {
    this.isExpanded.update(v => !v);
    this.expandedChange.emit(this.isExpanded());
    this.toggled.emit(this.isExpanded());
  }
  
  /**
   * Expande el item
   */
  expand(): void {
    if (!this.isExpanded()) {
      this.toggle();
    }
  }
  
  /**
   * Colapsa el item
   */
  collapse(): void {
    if (this.isExpanded()) {
      this.toggle();
    }
  }
  
  /**
   * Maneja eventos de teclado
   */
  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggle();
        break;
    }
  }
}

/**
 * AccordionComponent - Contenedor principal del acordeón
 * 
 * Características:
 * - Múltiples items expandibles simultáneamente o solo uno
 * - Navegación con teclas de flecha entre items
 * - Expandir/colapsar todos
 */
@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="accordion" 
      role="presentation"
      (keydown)="onKeyDown($event)">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .accordion {
      width: 100%;
    }
  `]
})
export class AccordionComponent implements AfterContentInit {
  @ContentChildren(AccordionItemComponent) items!: QueryList<AccordionItemComponent>;
  
  /** Si es true, solo un item puede estar expandido a la vez */
  @Input() singleExpand: boolean = false;
  
  ngAfterContentInit(): void {
    // Suscribirse a los cambios de cada item
    this.items.forEach((item, index) => {
      item.toggled.subscribe((expanded: boolean) => {
        if (this.singleExpand && expanded) {
          this.collapseOthers(index);
        }
      });
    });
  }
  
  /**
   * Colapsa todos los items excepto el indicado
   */
  private collapseOthers(exceptIndex: number): void {
    this.items.forEach((item, index) => {
      if (index !== exceptIndex && item.isExpanded()) {
        item.collapse();
      }
    });
  }
  
  /**
   * Expande todos los items
   */
  expandAll(): void {
    if (!this.singleExpand) {
      this.items.forEach(item => item.expand());
    }
  }
  
  /**
   * Colapsa todos los items
   */
  collapseAll(): void {
    this.items.forEach(item => item.collapse());
  }
  
  /**
   * Maneja navegación con teclas de flecha
   */
  onKeyDown(event: KeyboardEvent): void {
    const itemsArray = this.items.toArray();
    const currentIndex = itemsArray.findIndex(
      item => document.activeElement?.id === item.headerId
    );
    
    if (currentIndex === -1) return;
    
    let targetIndex: number | null = null;
    
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
    
    if (targetIndex !== null) {
      const targetButton = document.getElementById(itemsArray[targetIndex].headerId);
      targetButton?.focus();
    }
  }
}
