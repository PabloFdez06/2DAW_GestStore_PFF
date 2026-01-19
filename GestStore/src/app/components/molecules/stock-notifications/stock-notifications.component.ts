import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../atoms/icon/icon.component';
import { StockAlertService } from '../../../services/stock-alert.service';

@Component({
  selector: 'app-stock-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './stock-notifications.component.html',
  styleUrl: './stock-notifications.component.scss'
})
export class StockNotificationsComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  
  protected stockAlertService = inject(StockAlertService);
  
  get lowStockProducts() {
    return this.stockAlertService.lowStock();
  }
  
  get outOfStockProducts() {
    return this.stockAlertService.outOfStock();
  }
  
  get hasAlerts(): boolean {
    return this.stockAlertService.hasAlerts();
  }
  
  get alertsCount(): number {
    return this.stockAlertService.alertsCount();
  }
  
  ngOnInit(): void {
    this.stockAlertService.loadAlerts();
  }
  
  onClose(): void {
    this.close.emit();
  }
  
  onBackdropClick(): void {
    this.close.emit();
  }
  
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
