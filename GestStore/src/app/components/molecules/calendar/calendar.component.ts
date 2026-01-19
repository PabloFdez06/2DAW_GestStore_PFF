import { Component, EventEmitter, OnInit, OnDestroy, Output, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../atoms/icon/icon.component';
import { TaskService } from '../../../services/task.service';
import { Task } from '../../../models/task.model';
import { Subject, takeUntil } from 'rxjs';

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  hasTasks: boolean;
  taskCount: number;
  fullDate: Date | null;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  
  private taskService = inject(TaskService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  
  currentDate: Date = new Date();
  selectedDate: Date | null = null;
  selectedTaskCount: number = 0;
  calendarDays: CalendarDay[] = [];
  monthName: string = '';
  year: number = 0;
  weekDays: string[] = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
  
  private tasks: Task[] = [];
  private taskDatesMap: Map<string, number> = new Map();
  
  ngOnInit() {
    this.selectToday();
    this.updateCalendar(); // Mostrar el calendario inmediatamente
    this.loadTasks();
  }
  
  private selectToday(): void {
    const today = new Date();
    this.selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private loadTasks(): void {
    this.taskService.getAllTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.processTaskDates();
          this.updateCalendar();
          this.updateSelectedTaskCount();
          this.cdr.detectChanges();
        },
        error: () => {
          // Si falla, mostrar calendario sin tareas
          this.updateCalendar();
          this.cdr.detectChanges();
        }
      });
  }
  
  private processTaskDates(): void {
    this.taskDatesMap.clear();
    if (this.tasks && this.tasks.length > 0) {
      this.tasks.forEach(task => {
        const dateStr = task.dueDate || task.createdAt;
        if (dateStr) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            const currentCount = this.taskDatesMap.get(key) || 0;
            this.taskDatesMap.set(key, currentCount + 1);
          }
        }
      });
    }
  }
  
  private getTaskCountOnDate(year: number, month: number, day: number): number {
    const key = `${year}-${month}-${day}`;
    return this.taskDatesMap.get(key) || 0;
  }
  
  private updateSelectedTaskCount(): void {
    if (this.selectedDate) {
      this.selectedTaskCount = this.getTaskCountOnDate(
        this.selectedDate.getFullYear(),
        this.selectedDate.getMonth(),
        this.selectedDate.getDate()
      );
    }
  }
  
  private hasTaskOnDate(year: number, month: number, day: number): boolean {
    return this.getTaskCountOnDate(year, month, day) > 0;
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
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const taskCount = this.getTaskCountOnDate(prevYear, prevMonth, day);
      this.calendarDays.push({
        day,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false,
        hasTasks: taskCount > 0,
        taskCount,
        fullDate: new Date(prevYear, prevMonth, day)
      });
    }
    
    // Días del mes actual
    const today = new Date();
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const isToday = today.getFullYear() === year && 
                      today.getMonth() === month && 
                      today.getDate() === i;
      
      const taskCount = this.getTaskCountOnDate(year, month, i);
      this.calendarDays.push({
        day: i,
        isCurrentMonth: true,
        isSelected: this.selectedDate ? 
                    this.selectedDate.getFullYear() === year &&
                    this.selectedDate.getMonth() === month &&
                    this.selectedDate.getDate() === i : false,
        isToday,
        hasTasks: taskCount > 0,
        taskCount,
        fullDate: new Date(year, month, i)
      });
    }
    
    // Días del siguiente mes
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const taskCount = this.getTaskCountOnDate(nextYear, nextMonth, i);
      this.calendarDays.push({
        day: i,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false,
        hasTasks: taskCount > 0,
        taskCount,
        fullDate: new Date(nextYear, nextMonth, i)
      });
    }
  }
  
  getMonthName(month: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
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
    
    // Guardar el número de tareas para la fecha seleccionada
    this.selectedTaskCount = calendarDay.taskCount;
  }
  
  getSelectedDayOfWeek(): string {
    if (!this.selectedDate) return '';
    const dayIndex = this.selectedDate.getDay();
    return this.weekDays[dayIndex === 0 ? 6 : dayIndex - 1];
  }
  
  onClose() {
    this.close.emit();
  }
}
