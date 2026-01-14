import { Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

let tooltipIdCounter = 0;

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') text: string = '';
  @Input() tooltipPosition: TooltipPosition = 'top';
  @Input() tooltipDelay = 300;

  private tooltipEl: HTMLElement | null = null;
  private arrowEl: HTMLElement | null = null;
  private showTimer: number | null = null;

  private readonly tooltipId = `gs-tooltip-${++tooltipIdCounter}`;

  constructor(
    private host: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.scheduleShow();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hide();
  }

  @HostListener('focusin')
  onFocusIn(): void {
    this.scheduleShow();
  }

  @HostListener('focusout')
  onFocusOut(): void {
    this.hide();
  }

  @HostListener('keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (!this.tooltipEl) return;
    (event as KeyboardEvent).preventDefault();
    this.hide();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.reposition();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.reposition();
  }

  ngOnDestroy(): void {
    this.clearShowTimer();
    this.removeTooltip();
  }

  private scheduleShow(): void {
    if (!this.text?.trim()) return;

    this.clearShowTimer();
    this.showTimer = window.setTimeout(() => {
      this.show();
    }, this.tooltipDelay);
  }

  private clearShowTimer(): void {
    if (this.showTimer !== null) {
      window.clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  private show(): void {
    if (this.tooltipEl) return;

    const tooltip = this.renderer.createElement('div') as HTMLElement;
    const arrow = this.renderer.createElement('div') as HTMLElement;

    this.renderer.addClass(tooltip, 'gs-tooltip');
    this.renderer.addClass(tooltip, `gs-tooltip--${this.tooltipPosition}`);
    this.renderer.addClass(arrow, 'gs-tooltip__arrow');

    this.renderer.setAttribute(tooltip, 'id', this.tooltipId);
    this.renderer.setAttribute(tooltip, 'role', 'tooltip');

    const textNode = this.renderer.createText(this.text);
    this.renderer.appendChild(tooltip, textNode);
    this.renderer.appendChild(tooltip, arrow);

    this.renderer.appendChild(this.renderer.selectRootElement('body', true), tooltip);
    this.tooltipEl = tooltip;
    this.arrowEl = arrow;

    this.renderer.setAttribute(this.host.nativeElement, 'aria-describedby', this.tooltipId);

    this.reposition();

    // Trigger transición
    requestAnimationFrame(() => {
      if (this.tooltipEl) this.renderer.addClass(this.tooltipEl, 'is-visible');
    });
  }

  private hide(): void {
    this.clearShowTimer();

    if (!this.tooltipEl) return;

    const el = this.tooltipEl;
    this.renderer.removeClass(el, 'is-visible');

    window.setTimeout(() => {
      this.removeTooltip();
    }, 150);
  }

  private removeTooltip(): void {
    if (this.tooltipEl) {
      const body = this.renderer.selectRootElement('body', true);
      this.renderer.removeChild(body, this.tooltipEl);
      this.tooltipEl = null;
      this.arrowEl = null;
    }

    this.renderer.removeAttribute(this.host.nativeElement, 'aria-describedby');
  }

  private reposition(): void {
    if (!this.tooltipEl) return;

    const hostRect = this.host.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipEl.getBoundingClientRect();

    const spacing = 10;

    let top = 0;
    let left = 0;

    switch (this.tooltipPosition) {
      case 'bottom':
        top = hostRect.bottom + spacing;
        left = hostRect.left + hostRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = hostRect.top + hostRect.height / 2 - tooltipRect.height / 2;
        left = hostRect.left - tooltipRect.width - spacing;
        break;
      case 'right':
        top = hostRect.top + hostRect.height / 2 - tooltipRect.height / 2;
        left = hostRect.right + spacing;
        break;
      case 'top':
      default:
        top = hostRect.top - tooltipRect.height - spacing;
        left = hostRect.left + hostRect.width / 2 - tooltipRect.width / 2;
        break;
    }

    const maxLeft = window.innerWidth - tooltipRect.width - 8;
    left = Math.min(Math.max(8, left), Math.max(8, maxLeft));

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    this.renderer.setStyle(this.tooltipEl, 'left', `${left + scrollX}px`);
    this.renderer.setStyle(this.tooltipEl, 'top', `${top + scrollY}px`);
  }
}
