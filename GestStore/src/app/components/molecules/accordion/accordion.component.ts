import { AfterViewInit, Component, ElementRef, Input, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss'
})
export class AccordionComponent implements AfterViewInit {
  @Input() items: AccordionItem[] = [];
  @Input() mode: 'single' | 'multiple' = 'single';

  openIndexes = new Set<number>();

  @ViewChildren('headerBtn', { read: ElementRef }) headerButtons!: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChildren('panelEl', { read: ElementRef }) panelElements!: QueryList<ElementRef<HTMLElement>>;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.syncAllPanels();
  }

  isOpen(index: number): boolean {
    return this.openIndexes.has(index);
  }

  toggle(index: number): void {
    if (this.mode === 'single') {
      if (this.openIndexes.has(index)) {
        this.openIndexes.clear();
      } else {
        this.openIndexes.clear();
        this.openIndexes.add(index);
      }
    } else {
      if (this.openIndexes.has(index)) {
        this.openIndexes.delete(index);
      } else {
        this.openIndexes.add(index);
      }
    }

    this.syncPanel(index);
    if (this.mode === 'single') {
      this.panelElements.forEach((_, i) => {
        if (i !== index) this.syncPanel(i);
      });
    }
  }

  onHeaderKeydown(event: KeyboardEvent, index: number): void {
    const key = event.key;
    const total = this.items.length;

    if (total === 0) return;

    if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End') {
      event.preventDefault();
    }

    let nextIndex = index;

    if (key === 'ArrowDown') nextIndex = (index + 1) % total;
    if (key === 'ArrowUp') nextIndex = (index - 1 + total) % total;
    if (key === 'Home') nextIndex = 0;
    if (key === 'End') nextIndex = total - 1;

    this.headerButtons.get(nextIndex)?.nativeElement.focus();
  }

  private syncAllPanels(): void {
    this.panelElements.forEach((_, index) => this.syncPanel(index));
  }

  private syncPanel(index: number): void {
    const panel = this.panelElements.get(index)?.nativeElement;
    if (!panel) return;

    const isOpen = this.isOpen(index);

    if (isOpen) {
      const content = panel.querySelector<HTMLElement>('.accordion__panel-inner');
      const height = content?.scrollHeight ?? panel.scrollHeight;
      this.renderer.setStyle(panel, 'maxHeight', `${height}px`);
      this.renderer.addClass(panel, 'is-open');
    } else {
      this.renderer.setStyle(panel, 'maxHeight', '0px');
      this.renderer.removeClass(panel, 'is-open');
    }
  }
}
