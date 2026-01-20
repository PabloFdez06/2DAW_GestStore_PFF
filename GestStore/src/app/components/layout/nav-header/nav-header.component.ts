import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../atoms/icon/icon.component';
import { SearchInputComponent } from '../../atoms/search-input/search-input.component';
import { ThemeService } from '../../../services/theme.service';
import { StockAlertService } from '../../../services/stock-alert.service';

@Component({
  selector: 'app-nav-header',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, SearchInputComponent],
  templateUrl: './nav-header.component.html',
  styleUrl: './nav-header.component.scss'
})
export class NavHeaderComponent {
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() searchAriaLabel: string = 'Buscar';
  @Input() showSearch: boolean = true;
  @Input() searchValue: string = '';
  
  @Output() searchValueChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() notificationsToggle = new EventEmitter<void>();
  @Output() themeToggle = new EventEmitter<void>();
  @Output() calendarToggle = new EventEmitter<void>();

  currentDayName: string = '';
  currentDate: string = '';

  constructor(
    public stockAlertService: StockAlertService,
    private themeService: ThemeService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.initializeDate();
  }

  private initializeDate(): void {
    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    this.currentDayName = days[now.getDay()];
    this.currentDate = `${now.getDate()} ${months[now.getMonth()]}, ${now.getFullYear()}`;
  }

  get themeIcon(): string {
    return this.themeService.mode() === 'dark' ? 'moon' : 'sun';
  }

  get themeAriaLabel(): string {
    return this.themeService.mode() === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  }

  onSearchValueChange(value: string): void {
    this.searchValue = value;
    this.searchValueChange.emit(value);
    this.searchChange.emit(value);
  }

  toggleNotifications(): void {
    this.notificationsToggle.emit();
  }

  toggleTheme(): void {
    this.themeService.toggle();
    this.themeToggle.emit();
  }

  toggleCalendar(): void {
    this.calendarToggle.emit();
  }
}
