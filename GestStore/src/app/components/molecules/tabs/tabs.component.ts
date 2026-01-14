import { AfterViewInit, Component, ElementRef, Input, OnDestroy, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabItem {
  id: string;
  label: string;
  content: string;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export class TabsComponent implements AfterViewInit, OnDestroy {
  @Input() tabs: TabItem[] = [];

  activeIndex = 0;

  @ViewChild('tabList', { read: ElementRef }) tabList?: ElementRef<HTMLElement>;
  @ViewChildren('tabBtn', { read: ElementRef }) tabButtons!: QueryList<ElementRef<HTMLButtonElement>>;

  private indicatorEl: HTMLElement | null = null;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.createIndicator();
    this.updateIndicator();
  }

  ngOnDestroy(): void {
    this.removeIndicator();
  }

  selectTab(index: number): void {
    this.activeIndex = index;
    this.updateIndicator();
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const total = this.tabs.length;
    if (total === 0) return;

    const key = event.key;
    if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Home' && key !== 'End') return;

    event.preventDefault();

    let nextIndex = index;
    if (key === 'ArrowRight') nextIndex = (index + 1) % total;
    if (key === 'ArrowLeft') nextIndex = (index - 1 + total) % total;
    if (key === 'Home') nextIndex = 0;
    if (key === 'End') nextIndex = total - 1;

    this.selectTab(nextIndex);
    this.tabButtons.get(nextIndex)?.nativeElement.focus();
  }

  private createIndicator(): void {
    const list = this.tabList?.nativeElement;
    if (!list || this.indicatorEl) return;

    const indicator = this.renderer.createElement('div') as HTMLElement;
    this.renderer.addClass(indicator, 'tabs__indicator');
    this.renderer.appendChild(list, indicator);
    this.indicatorEl = indicator;
  }

  private removeIndicator(): void {
    const list = this.tabList?.nativeElement;
    if (!list || !this.indicatorEl) return;

    this.renderer.removeChild(list, this.indicatorEl);
    this.indicatorEl = null;
  }

  private updateIndicator(): void {
    if (!this.indicatorEl) return;

    queueMicrotask(() => {
      const activeBtn = this.tabButtons.get(this.activeIndex)?.nativeElement;
      const list = this.tabList?.nativeElement;
      if (!activeBtn || !list || !this.indicatorEl) return;

      const listRect = list.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();

      const left = btnRect.left - listRect.left;
      const width = btnRect.width;

      this.renderer.setStyle(this.indicatorEl, 'width', `${width}px`);
      this.renderer.setStyle(this.indicatorEl, 'transform', `translateX(${left}px)`);
    });
  }
}
