import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { RealTimeService } from './services/real-time.service';
import { NotificationContainerComponent } from './components/shared/notification-container/notification-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NotificationContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  title = 'GestStore';
  
  private destroy$ = new Subject<void>();

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private realTimeService: RealTimeService
  ) {
    this.themeService.init();
  }
  
  ngOnInit(): void {
    // Iniciar/detener polling según el estado de autenticación
    this.authService.currentUser.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        // Usuario autenticado: iniciar actualizaciones en tiempo real
        this.realTimeService.startPolling();
      } else {
        // Usuario no autenticado: detener polling
        this.realTimeService.stopPolling();
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.realTimeService.stopPolling();
  }
}
