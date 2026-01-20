import { ChangeDetectorRef, Component, HostListener, Inject, NgZone, Renderer2 } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { IconComponent } from '../../components/atoms/icon/icon.component';
import { SpinnerComponent } from '../../components/atoms/spinner/spinner.component';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent, SpinnerComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  currentDayName: string = '';
  currentDate: string = '';

  currentUser: User | null = null;

  name: string = '';
  lastName: string = '';
  email: string = '';
  phone: string = '';
  address: string = '';

  avatarUrl: string | null = null;

  isSaving: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  isSidebarOpen: boolean = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private themeService: ThemeService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.updateCurrentDate();
    this.loadUserFromStore();
    this.refreshProfile();
  }

  private loadUserFromStore(): void {
    this.authService.currentUser.subscribe(user => {
      this.ngZone.run(() => {
        this.currentUser = user;
        this.cdr.detectChanges();
      });
    });

    const storedAvatar = localStorage.getItem('geststore.avatar');
    this.avatarUrl = storedAvatar && storedAvatar.trim().length > 0 ? storedAvatar : null;
  }

  private refreshProfile(): void {
    this.userService.getMe().subscribe({
      next: user => {
        this.currentUser = user;
        this.name = user.name ?? '';
        this.lastName = user.lastName ?? '';
        this.email = user.email ?? '';
        this.phone = user.phone ?? '';
        this.address = user.address ?? '';

        if (user.avatar && user.avatar.trim().length > 0) {
          this.avatarUrl = user.avatar;
          localStorage.setItem('geststore.avatar', user.avatar);
        }

        this.authService.setCurrentUser(user);
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar tu perfil.';
        this.cdr.detectChanges();
      }
    });
  }

  updateCurrentDate(): void {
    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    this.currentDayName = days[now.getDay()];
    this.currentDate = `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
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

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Formato no soportado. Usa SVG, JPG o PNG.';
      input.value = '';
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.errorMessage = 'La imagen es demasiado grande (máx 2MB).';
      input.value = '';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.userService.uploadMyAvatar(file).subscribe({
      next: (user) => {
        if (user.avatar && user.avatar.trim().length > 0) {
          this.avatarUrl = user.avatar;
          localStorage.setItem('geststore.avatar', user.avatar);
        }
        this.authService.setCurrentUser(user);
        this.successMessage = 'Avatar actualizado.';
        this.notificationService.success('Avatar actualizado correctamente');
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 2500);
      },
      error: () => {
        // Fallback: keep current client-side behavior (Data URL + localStorage)
        const reader = new FileReader();
        reader.onload = () => {
          const result = typeof reader.result === 'string' ? reader.result : null;
          if (!result) return;
          this.avatarUrl = result;
          localStorage.setItem('geststore.avatar', result);
          this.notificationService.success('Avatar guardado localmente');
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  onUpdateInfo(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.errorMessage = '';
    this.successMessage = '';
    this.isSaving = true;
    this.cdr.detectChanges();

    const startTime = Date.now();
    const minDelay = 1500; // Minimum 1.5 seconds for spinner visibility

    this.userService
      .updateMe({
        name: this.name,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        address: this.address,
        avatar: this.avatarUrl
      })
      .subscribe({
        next: user => {
          const elapsed = Date.now() - startTime;
          const remainingDelay = Math.max(0, minDelay - elapsed);
          
          setTimeout(() => {
            this.isSaving = false;
            this.currentUser = user;
            this.authService.setCurrentUser(user);

            if (user.avatar && user.avatar.trim().length > 0) {
              localStorage.setItem('geststore.avatar', user.avatar);
              this.avatarUrl = user.avatar;
            }

            this.cdr.detectChanges();
            this.successMessage = 'Información actualizada.';
            this.notificationService.success('Información actualizada correctamente');
            setTimeout(() => {
              this.successMessage = '';
              this.cdr.detectChanges();
            }, 2500);
          }, remainingDelay);
        },
        error: () => {
          const elapsed = Date.now() - startTime;
          const remainingDelay = Math.max(0, minDelay - elapsed);
          
          setTimeout(() => {
            this.isSaving = false;
            this.errorMessage = 'No se pudo actualizar la información.';
            this.notificationService.error('Error al actualizar la información');
            this.cdr.detectChanges();
          }, remainingDelay);
        }
      });
  }

  onGoToPassword(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/perfil', 'cambiar-contrasena']);
  }

  onBack(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/ajustes']);
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

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isSidebarOpen) {
      this.closeSidebar();
    }
  }
}
