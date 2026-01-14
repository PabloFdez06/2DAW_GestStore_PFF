import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, Renderer2, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IconComponent } from '../../atoms/icon/icon.component';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  isMenuOpen = signal(false);

  @ViewChild('hamburgerBtn', { read: ElementRef }) hamburgerBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('mobileMenu', { read: ElementRef }) mobileMenu?: ElementRef<HTMLElement>;

  private backdropEl: HTMLElement | null = null;
  private removeBackdropListener: (() => void) | null = null;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private themeService: ThemeService
  ) {}

  get themeIcon(): string {
    return this.themeService.mode() === 'dark' ? 'moon' : 'sun';
  }

  get themeAriaLabel(): string {
    return this.themeService.mode() === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  ngAfterViewInit(): void {
    this.syncHamburgerState();
  }

  ngOnDestroy(): void {
    this.removeBackdrop();
  }

  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
    this.syncHamburgerState();
    if (this.isMenuOpen()) {
      this.addBackdrop();
      this.focusFirstMobileLink();
    } else {
      this.removeBackdrop();
      this.hamburgerBtn?.nativeElement?.focus();
    }
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
    this.syncHamburgerState();
    this.removeBackdrop();
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
    this.closeMenu();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isMenuOpen()) {
      this.closeMenu();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isMenuOpen()) {
      this.closeMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isMenuOpen()) return;

    const target = event.target as Node | null;
    const menuEl = this.mobileMenu?.nativeElement;
    const buttonEl = this.hamburgerBtn?.nativeElement;

    if (!target) return;
    if (menuEl?.contains(target) || buttonEl?.contains(target)) return;

    this.closeMenu();
  }

  private syncHamburgerState(): void {
    const button = this.hamburgerBtn?.nativeElement;
    if (!button) return;

    if (this.isMenuOpen()) {
      this.renderer.addClass(button, 'is-open');
      this.renderer.setAttribute(button, 'aria-label', 'Cerrar menú de navegación');
    } else {
      this.renderer.removeClass(button, 'is-open');
      this.renderer.setAttribute(button, 'aria-label', 'Abrir menú de navegación');
    }
  }

  private addBackdrop(): void {
    if (this.backdropEl) return;

    const backdrop = this.renderer.createElement('span') as HTMLElement;
    this.renderer.addClass(backdrop, 'app-header__backdrop');
    this.renderer.setAttribute(backdrop, 'aria-hidden', 'true');

    this.removeBackdropListener = this.renderer.listen(backdrop, 'click', () => {
      this.closeMenu();
    });

    this.renderer.appendChild(this.renderer.selectRootElement('body', true), backdrop);
    this.backdropEl = backdrop;
  }

  private removeBackdrop(): void {
    if (this.removeBackdropListener) {
      this.removeBackdropListener();
      this.removeBackdropListener = null;
    }

    if (this.backdropEl) {
      const body = this.renderer.selectRootElement('body', true);
      this.renderer.removeChild(body, this.backdropEl);
      this.backdropEl = null;
    }
  }

  private focusFirstMobileLink(): void {
    queueMicrotask(() => {
      const menuEl = this.mobileMenu?.nativeElement;
      if (!menuEl) return;
      const firstLink = menuEl.querySelector<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])');
      firstLink?.focus();
    });
  }
}
