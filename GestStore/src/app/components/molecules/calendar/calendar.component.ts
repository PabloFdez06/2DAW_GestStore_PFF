import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../atoms/icon/icon.component';

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  
  currentDate: Date = new Date();
  selectedDate: Date | null = null;
  calendarDays: CalendarDay[] = [];
  monthName: string = '';
  year: number = 0;
  weekDays: string[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  
  ngOnInit() {
    this.updateCalendar();
  }
  
  updateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    this.year = year;
    this.monthName = this.getMonthName(month);
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    
    // Día de la semana del primer día (0=domingo, 1=lunes, ...)
    let firstDayOfWeek = firstDay.getDay();
    // Convertir a formato europeo (0=lunes)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Días del mes anterior que hay que mostrar
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Días del siguiente mes
    const totalCells = 35; // 5 semanas
    const daysInCurrentMonth = lastDay.getDate();
    const daysFromNextMonth = totalCells - daysFromPrevMonth - daysInCurrentMonth;
    
    this.calendarDays = [];
    
    // Días del mes anterior
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      this.calendarDays.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false
      });
    }
    
    // Días del mes actual
    const today = new Date();
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const isToday = today.getFullYear() === year && 
                      today.getMonth() === month && 
                      today.getDate() === i;
      
      this.calendarDays.push({
        day: i,
        isCurrentMonth: true,
        isSelected: this.selectedDate ? 
                    this.selectedDate.getFullYear() === year &&
                    this.selectedDate.getMonth() === month &&
                    this.selectedDate.getDate() === i : false,
        isToday
      });
    }
    
    // Días del siguiente mes
    for (let i = 1; i <= daysFromNextMonth; i++) {
      this.calendarDays.push({
        day: i,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false
      });
    }
  }
  
  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  }
  
  getCurrentDayOfWeek(): string {
    const today = new Date();
    return this.weekDays[today.getDay() === 0 ? 6 : today.getDay() - 1];
  }
  
  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.updateCalendar();
  }
  
  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.updateCalendar();
  }
  
  selectDay(calendarDay: CalendarDay) {
    if (!calendarDay.isCurrentMonth) return;
    
    // Actualizar selección
    this.calendarDays.forEach(day => day.isSelected = false);
    calendarDay.isSelected = true;
    
    this.selectedDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      calendarDay.day
    );
  }
  
  onRemove() {
    this.selectedDate = null;
    this.calendarDays.forEach(day => day.isSelected = false);
  }
  
  onDone() {
    // Aquí podrías emitir la fecha seleccionada si la necesitas
    this.close.emit();
  }
}
