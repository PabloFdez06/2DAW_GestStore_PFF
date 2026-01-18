import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, NgZone, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CalendarComponent } from '../../components/molecules/calendar/calendar.component';
import { IconComponent } from '../../components/atoms/icon/icon.component';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent, CalendarComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit, OnDestroy {
  currentDayName: string = '';
  currentDate: string = '';

  isCalendarOpen: boolean = false;

  currentUser: User | null = null;

  avatarUrl: string | null = null;
  isSidebarOpen: boolean = false;

  // Form data (UI only for now)
  fullName: string = '';
  email: string = '';
  phone: string = '';
  accountType: string = 'Regular';

  // Preferences (UI)
  language: 'es' | 'en' = 'es';
  notificationsEnabled: boolean = false;

  @ViewChild('calendarDialog', { read: ElementRef }) calendarDialog?: ElementRef<HTMLDialogElement>;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.updateCurrentDate();
    this.loadCurrentUser();
    this.loadPreferences();
    this.loadAvatar();
  }

  ngOnDestroy(): void {
    this.unlockScroll();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser.subscribe(user => {
      this.ngZone.run(() => {
        this.currentUser = user;
        this.fullName = user?.name ?? '';
        this.email = user?.email ?? '';
        this.accountType = user?.role ? this.formatRole(user.role) : 'Regular';
        this.cdr.detectChanges();
      });
    });
  }

  private loadPreferences(): void {
    const storedLanguage = (localStorage.getItem('geststore.language') ?? '').toLowerCase();
    if (storedLanguage === 'en' || storedLanguage === 'es') {
      this.language = storedLanguage;
    }

    const storedNotifications = localStorage.getItem('geststore.notifications.enabled');
    if (storedNotifications === 'true' || storedNotifications === 'false') {
      this.notificationsEnabled = storedNotifications === 'true';
    }
  }

  private loadAvatar(): void {
    const stored = localStorage.getItem('geststore.avatar');
    this.avatarUrl = stored && stored.trim().length > 0 ? stored : null;
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Formato no soportado. Usa SVG, JPG o PNG.');
      input.value = '';
      return;
    }

    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert('La imagen supera 10MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (!result) return;
      this.avatarUrl = result;
      localStorage.setItem('geststore.avatar', result);
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  get languageLabel(): string {
    return this.language === 'en' ? 'Inglés' : 'Español';
  }

  cycleLanguage(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const nextLanguage: 'es' | 'en' = this.language === 'es' ? 'en' : 'es';
    const nextLabel = nextLanguage === 'en' ? 'Inglés' : 'Español';

    if (!confirm(`¿Quieres cambiar el idioma a ${nextLabel}?`)) return;

    this.language = nextLanguage;
    localStorage.setItem('geststore.language', this.language);
  }

  onNotificationsChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;

    const previous = this.notificationsEnabled;
    const next = input.checked;
    const message = next ? '¿Deseas permitir notificaciones?' : '¿Deseas desactivar las notificaciones?';

    if (!confirm(message)) {
      input.checked = previous;
      return;
    }

    this.notificationsEnabled = next;
    localStorage.setItem('geststore.notifications.enabled', String(this.notificationsEnabled));
  }

  private formatRole(role: string): string {
    const normalized = role.trim().toLowerCase();
    if (normalized === 'admin' || normalized === 'administrator') return 'Administrador';
    if (normalized === 'manager') return 'Encargado';
    return 'Regular';
  }

  updateCurrentDate(): void {
    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    this.currentDayName = days[now.getDay()];
    this.currentDate = `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
  }

  toggleCalendar(): void {
    this.isCalendarOpen = !this.isCalendarOpen;
    this.syncModalSideEffects();
    if (this.isCalendarOpen) {
      queueMicrotask(() => this.calendarDialog?.nativeElement?.focus());
    }
  }

  closeCalendar(): void {
    this.isCalendarOpen = false;
    this.syncModalSideEffects();
  }

  private syncModalSideEffects(): void {
    if (this.isCalendarOpen) {
      this.lockScroll();
    } else {
      this.unlockScroll();
    }
  }

  private lockScroll(): void {
    const body = this.document?.body;
    if (!body) return;
    this.renderer.addClass(body, 'is-scroll-locked');
  }

  private unlockScroll(): void {
    const body = this.document?.body;
    if (!body) return;
    this.renderer.removeClass(body, 'is-scroll-locked');
  }

  onLogout(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.authService.logout();
    }
  }

  get themeIcon(): string {
    return this.themeService.mode() === 'dark' ? 'moon' : 'sun';
  }

  get themeAriaLabel(): string {
    return this.themeService.mode() === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (this.isCalendarOpen) {
      keyboardEvent.preventDefault();
      this.closeCalendar();
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.isSidebarOpen) {
      this.renderer.addClass(this.document.body, 'sidebar-open');
    } else {
      this.renderer.removeClass(this.document.body, 'sidebar-open');
    }
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
    this.renderer.removeClass(this.document.body, 'sidebar-open');
  }
}
