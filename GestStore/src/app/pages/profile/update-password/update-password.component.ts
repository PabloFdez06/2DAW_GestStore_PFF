import { ChangeDetectorRef, Component, Inject, NgZone, Renderer2 } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { IconComponent } from '../../../components/atoms/icon/icon.component';
import { ButtonComponent } from '../../../components/atoms/button/button.component';
import { SidebarLayoutComponent } from '../../../components/layout/sidebar-layout/sidebar-layout.component';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { User } from '../../../models/auth.model';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent, ButtonComponent, SidebarLayoutComponent],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.scss'
})
export class UpdatePasswordComponent {
  currentDayName: string = '';
  currentDate: string = '';

  currentUser: User | null = null;

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  isSaving: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

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
    this.authService.currentUser.subscribe(user => {
      this.ngZone.run(() => {
        this.currentUser = user;
        this.cdr.detectChanges();
      });
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

  onBack(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/perfil']);
  }

  onCancel(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/perfil']);
  }

  onUpdatePassword(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Completa todos los campos.';
      this.notificationService.warning('Completa todos los campos');
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'La nueva contraseña debe tener al menos 6 caracteres.';
      this.notificationService.warning('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'La confirmación no coincide con la nueva contraseña.';
      this.notificationService.warning('Las contraseñas no coinciden');
      return;
    }

    this.isSaving = true;
    this.cdr.detectChanges();

    this.userService.updateMyPassword({ currentPassword: this.currentPassword, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.isSaving = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.successMessage = 'Contraseña actualizada.';
        this.notificationService.success('Contraseña actualizada correctamente');
        this.cdr.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/perfil']);
        }, 900);
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'No se pudo actualizar la contraseña. Revisa la contraseña actual.';
        this.notificationService.error('Error al actualizar la contraseña');
        this.cdr.detectChanges();
      }
    });
  }
}
