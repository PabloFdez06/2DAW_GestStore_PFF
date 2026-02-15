import { Component, HostListener, Inject, Input, Renderer2 } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IconComponent } from '../../atoms/icon/icon.component';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/auth.model';

export interface SidebarLink {
  path: string;
  icon: string;
  label: string;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './sidebar-layout.component.html',
  styleUrls: ['./sidebar-layout.component.scss']
})
export class SidebarLayoutComponent {
  @Input() activeRoute: string = '';
  @Input() showLogout: boolean = true;

  isSidebarOpen: boolean = false;
  currentUser: User | null = null;
  avatarUrl: string | null = null;

  readonly navLinks: SidebarLink[] = [
    { path: '/dashboard', icon: 'home', label: 'Dashboard' },
    { path: '/tareas-importantes', icon: 'star', label: 'Tareas Importantes' },
    { path: '/tareas', icon: 'check-square', label: 'Tareas' },
    { path: '/almacen', icon: 'package', label: 'Almacén' },
    { path: '/incidencias', icon: 'alert-circle', label: 'Incidencias' },
    { path: '/ajustes', icon: 'settings', label: 'Ajustes' }
  ];
  
  constructor(
    private authService: AuthService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.loadCurrentUser();
    this.loadAvatar();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  private loadAvatar(): void {
    const stored = localStorage.getItem('geststore.avatar');
    this.avatarUrl = stored && stored.trim().length > 0 ? stored : null;
  }

  isActive(path: string): boolean {
    return this.activeRoute === path;
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

  onLogout(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.authService.logout();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isSidebarOpen) {
      this.closeSidebar();
    }
  }
}
